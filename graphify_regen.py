import json, sys
from pathlib import Path
from graphify.detect import detect, save_manifest
from graphify.extract import collect_files, extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from graphify.wiki import to_wiki
from datetime import datetime, timezone

print("=== STEP 1: DETECT ===")
root = Path('.')
detection = detect(root)
print(f"Total files: {detection['total_files']}")
print(f"Total words: {detection['total_words']}")
for k, v in detection['files'].items():
    print(f"  {k}: {len(v)}")
print(f"Warning: {detection.get('warning', 'none')}")

print("\n=== STEP 2: AST EXTRACT ===")
code_files = []
for f in detection['files'].get('code', []):
    p = Path(f)
    if p.is_dir():
        code_files.extend(collect_files(p))
    elif p.exists():
        code_files.append(p)
if code_files:
    result = extract(code_files, cache_root=root)
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2))
    print(f"AST: {len(result['nodes'])} nodes, {len(result['edges'])} edges, input={result.get('input_tokens',0)}, output={result.get('output_tokens',0)}")
else:
    result = {'nodes': [], 'edges': [], 'input_tokens': 0, 'output_tokens': 0}
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result))
    print("No code files - skipping AST")

# Step 2.5: Semantic from cache/chunks
print("\n=== STEP 3: SEMANTIC EXTRACTION (from cache) ===")
from graphify.cache import check_semantic_cache
all_files = [f for files in detection['files'].values() for f in files]
cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(all_files)
print(f"Cache hit: {len(cached_nodes)} nodes, {len(cached_edges)} edges")
print(f"Needs extraction: {len(uncached)} files")

if uncached:
    print("UNCACHED FILES - semantic extraction requires LLM subagents (skipped in this run)")
    print("Top uncached:", uncached[:5])

# Merge cached semantic + AST
print("\n=== STEP 4: MERGE AST + SEMANTIC ===")
ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text())
sem_cached = {'nodes': cached_nodes, 'edges': cached_edges, 'hyperedges': cached_hyperedges, 'input_tokens': 0, 'output_tokens': 0}
Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(sem_cached))

seen = {n['id'] for n in ast['nodes']}
merged_nodes = list(ast['nodes'])
for n in sem_cached['nodes']:
    if n['id'] not in seen:
        merged_nodes.append(n)
        seen.add(n['id'])

merged_edges = ast['edges'] + sem_cached['edges']
merged_hyperedges = sem_cached.get('hyperedges', [])
merged = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': ast.get('input_tokens', 0),
    'output_tokens': ast.get('output_tokens', 0),
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged, indent=2))
print(f"Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges ({len(ast['nodes'])} AST + {len(sem_cached['nodes'])} semantic from cache)")

print("\n=== STEP 5: BUILD GRAPH + CLUSTER ===")
G = build_from_json(merged)
communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {'input': merged.get('input_tokens', 0), 'output': merged.get('output_tokens', 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: 'Community ' + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)
print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities")

print("\n=== STEP 6: GENERATE REPORT ===")
report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
to_json(G, communities, 'graphify-out/graph.json')
print("GRAPH_REPORT.md + graph.json written")

print("\n=== STEP 7: LABEL COMMUNITIES ===")
# Read analysis for labels
analysis = {
    'communities': {str(k): v for k, v in communities.items()},
    'cohesion': {str(k): v for k, v in cohesion.items()},
    'gods': gods,
    'surprises': surprises,
    'questions': questions,
}
Path('graphify-out/.graphify_analysis.json').write_text(json.dumps(analysis, indent=2), encoding='utf-8')

# Auto-label communities based on node content
print("Auto-labeling communities...")
for cid, members in communities.items():
    if not members:
        labels[cid] = f"Community {cid}"
        continue
    node_labels = [G.nodes[m].get('label', m) for m in members if m in G.nodes]
    top_labels = sorted(set(node_labels))[:3]
    labels[cid] = ', '.join(top_labels) if top_labels else f"Community {cid}"
    print(f"  Community {cid}: {labels[cid]} ({len(members)} nodes)")

# Regenerate report with labels
report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}), encoding='utf-8')
print("Report updated with community labels")

print("\n=== STEP 8: GENERATE WIKI ===")
n = to_wiki(G, communities, 'graphify-out/wiki', community_labels=labels, cohesion=cohesion, god_nodes_data=gods)
print(f"Wiki: {n} articles written to graphify-out/wiki/")

print("\n=== STEP 9: SAVE MANIFEST + COST ===")
save_manifest(detection['files'])
cost_path = Path('graphify-out/cost.json')
if cost_path.exists():
    cost = json.loads(cost_path.read_text())
else:
    cost = {'runs': [], 'total_input_tokens': 0, 'total_output_tokens': 0}
cost['runs'].append({
    'date': datetime.now(timezone.utc).isoformat(),
    'input_tokens': merged.get('input_tokens', 0),
    'output_tokens': merged.get('output_tokens', 0),
    'files': detection.get('total_files', 0),
})
cost['total_input_tokens'] += merged.get('input_tokens', 0)
cost['total_output_tokens'] += merged.get('output_tokens', 0)
cost_path.write_text(json.dumps(cost, indent=2), encoding='utf-8')
print(f"Cost: {merged.get('input_tokens', 0)} input, {merged.get('output_tokens', 0)} output")

# Cleanup temp files
import os
for f in ['.graphify_ast.json', '.graphify_semantic.json', '.graphify_extract.json',
          '.graphify_analysis.json', '.graphify_labels.json', '.graphify_detect.json']:
    try:
        os.remove(f'graphify-out/{f}')
    except:
        pass

print("\n=== DONE ===")
print(f"graph.html? {'yes' if Path('graphify-out/graph.html').exists() else 'no (not regenerated - use full pipeline for HTML)'}")
