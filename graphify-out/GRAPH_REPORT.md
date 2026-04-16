# Graph Report - .  (2026-04-16)

## Corpus Check
- 17 files · ~27,082 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 76 nodes · 112 edges · 16 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
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

## God Nodes (most connected - your core abstractions)
1. `selectNextExerciseDetailed()` - 10 edges
2. `runSimulator()` - 8 edges
3. `runSession()` - 7 edges
4. `saveSessionResult()` - 6 edges
5. `startPracticeSession()` - 5 edges
6. `selectSimulatorExercises()` - 5 edges
7. `printFinalResults()` - 5 edges
8. `loadProgress()` - 5 edges
9. `DashboardPage()` - 4 edges
10. `pickFallbackCandidate()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --calls--> `loadProgress()`  [INFERRED]
  src\app\dashboard\page.tsx → src\storage\local_progress_store.ts
- `PracticePage()` --calls--> `startPracticeSession()`  [INFERRED]
  src\app\practice\page.tsx → src\practice\session_runner.ts
- `runSession()` --calls--> `selectNextExerciseDetailed()`  [INFERRED]
  src\practice\session_runner.ts → src\practice\exercise_selector.ts
- `startPracticeSession()` --calls--> `selectNextExerciseDetailed()`  [INFERRED]
  src\practice\session_runner.ts → src\practice\exercise_selector.ts
- `runSimulator()` --calls--> `loadProgress()`  [INFERRED]
  src\practice\simulator_runner.ts → src\storage\local_progress_store.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (15): buildSkillResults(), buildSkillStats(), chanceByDifficulty(), formatPercent(), groupBySkill(), hasAvailableExercises(), loadExercises(), pickValue() (+7 more)

### Community 1 - "Community 1"
Cohesion: 0.31
Nodes (11): findAlternativeSubskill(), getReferenceDifficulty(), logSelection(), pickDeterministic(), pickFallbackCandidate(), pickRandom(), pickStrictCandidate(), resolveRuleTarget() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (10): buildUserState(), computeAccuracy(), computeStreak(), evaluateAnswer(), findExercise(), loadExercises(), runDeterministicSession(), runMixedSession() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.52
Nodes (6): createEmptyProgress(), createSessionId(), loadProgress(), saveSessionResult(), updateSkillStats(), writeProgress()

### Community 4 - "Community 4"
Cohesion: 0.6
Nodes (3): DashboardPage(), getDashboardSkills(), getWeakestSkill()

### Community 5 - "Community 5"
Cohesion: 0.5
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (2): parseUsedExerciseIds(), PracticePage()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 7`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `ActionPanel()`, `ActionPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `Header()`, `Header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (2 nodes): `SkillItem()`, `SkillItem.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `SkillList()`, `SkillList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `SkillStatus()`, `SkillStatus.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `next.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runSimulator()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `loadProgress()` connect `Community 3` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `DashboardPage()` connect `Community 4` to `Community 3`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `selectNextExerciseDetailed()` (e.g. with `runSession()` and `startPracticeSession()`) actually correct?**
  _`selectNextExerciseDetailed()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `runSimulator()` (e.g. with `loadProgress()` and `saveSessionResult()`) actually correct?**
  _`runSimulator()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `startPracticeSession()` (e.g. with `PracticePage()` and `selectNextExerciseDetailed()`) actually correct?**
  _`startPracticeSession()` has 2 INFERRED edges - model-reasoned connections that need verification._