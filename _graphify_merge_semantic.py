import json
from pathlib import Path
from graphify.cache import save_semantic_cache

all_nodes = []
all_edges = []
all_hyperedges = []
total_input = 0
total_output = 0

for i in range(1, 6):
    p = Path(f"graphify-out/.graphify_chunk_{i:02d}.json")
    if p.exists():
        chunk = json.loads(p.read_text())
        all_nodes.extend(chunk.get("nodes", []))
        all_edges.extend(chunk.get("edges", []))
        all_hyperedges.extend(chunk.get("hyperedges", []))
        total_input += chunk.get("input_tokens", 0)
        total_output += chunk.get("output_tokens", 0)
    else:
        print(f"WARNING: chunk {i} missing from disk")

Path(".graphify_semantic_new.json").write_text(json.dumps({
    "nodes": all_nodes,
    "edges": all_edges,
    "hyperedges": all_hyperedges,
    "input_tokens": total_input,
    "output_tokens": total_output,
}, indent=2))

saved = save_semantic_cache(all_nodes, all_edges, all_hyperedges)
print(f"Extracted: {len(all_nodes)} nodes, {len(all_edges)} edges, {len(all_hyperedges)} hyperedges")
print(f"Cached {saved} files")
