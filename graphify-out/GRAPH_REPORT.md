# Graph Report - .  (2026-04-17)

## Corpus Check
- 27 files · ~58,340 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 337 nodes · 564 edges · 30 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `Product Analysis` - 21 edges
2. `selectNextExerciseDetailed()` - 18 edges
3. `Agent Orchestrator` - 12 edges
4. `loadLenguaSelectionGraph()` - 11 edges
5. `normalizeExercise()` - 11 edges
6. `App Ingreso` - 11 edges
7. `Scope & Rules Validator` - 11 edges
8. `Codex Prompt Generator` - 11 edges
9. `loadLenguaExercises()` - 10 edges
10. `runSession()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Product Roadmap - App Ingreso` --conceptually_related_to--> `App icon with dark square and white stylized mark`  [INFERRED]
  roadmap/roadmap.md → src/app/icon.svg
- `DashboardPage()` --calls--> `loadProgress()`  [INFERRED]
  src\app\dashboard\page.tsx → src\storage\local_progress_store.ts
- `PracticePage()` --calls--> `startReadingSession()`  [INFERRED]
  src\app\practice\page.tsx → src\practice\reading_session_runner.ts
- `PracticePage()` --calls--> `startPracticeSession()`  [INFERRED]
  src\app\practice\page.tsx → src\practice\session_runner.ts
- `savePracticeSessionProgress()` --calls--> `saveSessionResult()`  [INFERRED]
  src\app\practice\page.tsx → src\storage\local_progress_store.ts

## Hyperedges (group relationships)
- **Four-agent validation stack** — agent_01_product_guardian, agent_02_scope_rules_validator, agent_03_quality_auditor, agent_04_codex_prompt_generator [INFERRED 0.94]
- **Validation protocol docs** — orchestrator, interaction_flow, validation_pipeline [INFERRED 0.95]
- **Worked decision examples** — ejemplo_01_ajuste_menor, ejemplo_02_idea_nueva, ejemplo_03_bloqueado_p0 [INFERRED 0.90]
- **Policy Guardrails** — adr_002_no_official_content, adr_003_autonomous_learning, adr_004_parent_responsibility [INFERRED 0.90]
- **Practice Loop** — exercise_engine_v1, exercise_selection_logic_v1, practice_session_flow_v1 [EXTRACTED 0.96]
- **Measurement Stack** — simulator_model, progress_metrics, progress_metrics_v1 [INFERRED 0.87]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (57): Access by Time, Accuracy Metric, Adaptive Practice, ADR-003: Autonomous Learning, ADR-004: Parent Responsibility, Adult Customer, Adult Responsibility, Autonomous Training Platform (+49 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (39): clampDifficulty(), clampMastery(), dedupeExercises(), extractSelectorExercises(), filterImmediateRepeats(), filterUnlockedExercises(), findAlternativeSubskill(), findRelatedTarget() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (41): ADR-001 Product Scope, ADR-002: No Official Content, Product Guardian, Scope & Rules Validator, Quality Auditor, Codex Prompt Generator, Agents Map, AGENTS instructions (+33 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (29): buildFallbackOptions(), buildGeneratedOptions(), buildHighlightOptions(), buildObjectAnswerOptions(), buildOrderingOptions(), buildUserState(), ensureOptions(), evaluateAnswer() (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (20): findMasteryNode(), getLenguaMasteryMap(), getMasteryGap(), getMasteryLevel(), loadMasteryMap(), loadRelationships(), readJsonFile(), recommendNextSubskill() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (18): App icon with dark square and white stylized mark, Dashboard para padres (uso + progreso), Incorporacion futura de modulo de Matematica, Construir la base conceptual del producto (sin codigo), Construir un producto usable sin logica compleja, Mejorar el producto a nivel de aprendizaje real, Optimizar, expandir y preparar para crecimiento, Sistema de feedback inmediato (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (15): buildSkillResults(), buildSkillStats(), chanceByDifficulty(), formatPercent(), groupBySkill(), hasAvailableExercises(), loadExercises(), pickValue() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (12): assertPracticeSessionsUseChoiceExercises(), assertReadingUnitSessionsShareGeneratedTexts(), assertSelectionRespectsPrerequisitesAndMastery(), assertSessionRunnerUsesCrossRelationships(), assertTextPatternExtractorDoesNotReturnSourceText(), buildExercise(), withMutedConsole(), analyzePlainTextShape() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (10): assertReadingModeDatasetRunsSequentially(), ensureOptions(), findReadingUnit(), loadReadingExercises(), loadReadingUnits(), normalizeDifficulty(), normalizeReadingExercise(), normalizeReadingUnit() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.42
Nodes (9): createEmptyProgress(), createSessionId(), getSeenSkills(), loadProgress(), markSkillsSeen(), saveSessionResult(), updateSeenSkills(), updateSkillStats() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (10): Biografia de Hans Christian Andersen, Clase textual, paratexto y datos enciclopedicos, Lengua | modulo 1, Oracion, parrafo, mayusculas y coma, Sustantivos y adjetivos, Acentuacion y tilde diacritica, Biografia de Hans Christian Andersen (reutilizada), Cotexto, sinonimia y antonimia (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (9): Adverbios, Articulo enciclopedico, Lengua | modulo 5, Enciclopedia ilustrada para ninos. Historia del Mundo. Lexus (2018), La leyenda de Cacheuta, Diccionario de la lengua espanola (RAE), Sintaxis de la oracion simple, El Tawantinsuyu: un imperio de piedra y oro (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (9): Acentuacion, diptongos y hiatos, Actividades de integracion, Clases de palabras, Cohesion, mayusculas y coma, El caso del laberinto del terror, Ortografia de B/V, C/S/Z, Pronombres personales, posesivos y demostrativos, Sinonimia y antonimia (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (6): Lengua | modulo 3, Modo verbal y tiempos verbales, Noticia 'Laguna de la nina encantada, una leyenda con lenguaje vanguardista', Texto periodistico, UNO (25 de octubre de 2013), Vocales, concurrencia de vocales, diptongo, triptongo e hiato

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (5): Cohesion, coherencia y conectores, Lengua | modulo 4, La leyenda de la Laguna de la Nina Encantada, Narracion y tipos de narradores, Posesivos, demostrativos y usos de B y V

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (2): getSkillMetadata(), SkillItem()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **69 isolated node(s):** `AGENTS instructions`, `Minor-adjustment example`, `Codex Prompt Generator system prompt`, `Product Guardian system prompt`, `Quality Auditor system prompt` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `HomePage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `Header()`, `Header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `SkillList()`, `SkillList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `SkillStatus()`, `SkillStatus.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `next.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `playwright.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `ActionPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `session_runner.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `reading_unit.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `dashboard-progress.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `loadProgress()` connect `Community 9` to `Community 4`, `Community 6`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `runSimulator()` connect `Community 6` to `Community 9`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `selectNextExerciseDetailed()` (e.g. with `startPracticeSession()` and `startReadingUnitSession()`) actually correct?**
  _`selectNextExerciseDetailed()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Agent Orchestrator` (e.g. with `Validation Pipeline` and `Interaction Flow`) actually correct?**
  _`Agent Orchestrator` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `loadLenguaSelectionGraph()` (e.g. with `assertNormalizedExerciseShape()` and `assertSelectionRespectsPrerequisitesAndMastery()`) actually correct?**
  _`loadLenguaSelectionGraph()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `normalizeExercise()` (e.g. with `normalizeSkillId()` and `normalizeSubskillId()`) actually correct?**
  _`normalizeExercise()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AGENTS instructions`, `Minor-adjustment example`, `Codex Prompt Generator system prompt` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._