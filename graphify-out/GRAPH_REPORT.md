# Graph Report - .  (2026-04-18)

## Corpus Check
- 27 files · ~80,086 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 180 nodes · 333 edges · 26 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.8)
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

## God Nodes (most connected - your core abstractions)
1. `selectNextExerciseDetailed()` - 17 edges
2. `loadLenguaSelectionGraph()` - 11 edges
3. `loadLenguaExercises()` - 11 edges
4. `normalizeExercise()` - 11 edges
5. `loadContentLenguaExercises()` - 10 edges
6. `runSession()` - 9 edges
7. `startPracticeSession()` - 9 edges
8. `runSimulator()` - 8 edges
9. `normalizeSkillId()` - 7 edges
10. `normalizeSubskillId()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --calls--> `loadProgress()`  [INFERRED]
  src\app\dashboard\page.tsx → src\storage\local_progress_store.ts
- `assertSelectionRespectsPrerequisitesAndMastery()` --calls--> `loadLenguaSelectionGraph()`  [INFERRED]
  src\components\practice\__tests__\lengua_integration.test.ts → src\practice\exercise_selector.ts
- `assertReadingUnitSessionsShareGeneratedTexts()` --calls--> `loadLenguaExercises()`  [INFERRED]
  src\components\practice\__tests__\lengua_integration.test.ts → src\practice\session_runner.ts
- `assertReadingModeDatasetRunsSequentially()` --calls--> `startReadingSession()`  [INFERRED]
  src\components\practice\__tests__\lengua_integration.test.ts → src\practice\reading_session_runner.ts
- `normalizeSkillId()` --calls--> `loadContentLenguaExercises()`  [INFERRED]
  src\practice\exercise_selector.ts → src\practice\session_runner.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (27): buildFallbackOptions(), buildGeneratedOptions(), buildHighlightOptions(), buildObjectAnswerOptions(), buildOrderingOptions(), buildSkillTrainingPool(), ensureContentOptions(), ensureOptions() (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (21): clampMastery(), filterImmediateRepeats(), filterUnlockedExercises(), findAlternativeSubskill(), findRelatedTarget(), getReferenceDifficulty(), hasRecurrentError(), isAtRecommendedMastery() (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (24): clampDifficulty(), dedupeExercises(), extractSelectorExercises(), listLenguaExerciseFiles(), loadLenguaSelectionGraph(), loadLenguaSelectorExercises(), normalizeDifficulty(), normalizeSelectorExercise() (+16 more)

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (15): buildSkillResults(), buildSkillStats(), chanceByDifficulty(), formatPercent(), groupBySkill(), hasAvailableExercises(), loadExercises(), pickValue() (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (10): assertReadingModeDatasetRunsSequentially(), ensureOptions(), findReadingUnit(), loadReadingExercises(), loadReadingUnits(), normalizeDifficulty(), normalizeReadingExercise(), normalizeReadingUnit() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.38
Nodes (8): findMasteryNode(), getLenguaMasteryMap(), getMasteryGap(), getMasteryLevel(), loadMasteryMap(), loadRelationships(), readJsonFile(), recommendNextSubskill()

### Community 6 - "Community 6"
Cohesion: 0.42
Nodes (9): createEmptyProgress(), createSessionId(), getSeenSkills(), loadProgress(), markSkillsSeen(), saveSessionResult(), updateSeenSkills(), updateSkillStats() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.46
Nodes (7): assertPracticeSessionsUseChoiceExercises(), assertReadingUnitSessionsShareGeneratedTexts(), assertSelectionRespectsPrerequisitesAndMastery(), assertSessionRunnerUsesCrossRelationships(), assertSkillPracticeCompletesReadingUnitBeforeFallback(), buildExercise(), withMutedConsole()

### Community 8 - "Community 8"
Cohesion: 0.48
Nodes (6): assertTextPatternExtractorDoesNotReturnSourceText(), analyzePlainTextShape(), estimatePdfLength(), extractTextPatterns(), inferStructuresFromShape(), inferTextTypesFromShape()

### Community 9 - "Community 9"
Cohesion: 0.6
Nodes (5): DashboardPage(), getDashboardSkills(), getPracticeSkillStats(), getWeakestSkill(), isEnabledParam()

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (2): getSkillMetadata(), SkillItem()

### Community 11 - "Community 11"
Cohesion: 0.67
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

### Community 16 - "Community 16"
Cohesion: 1.0
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

## Knowledge Gaps
- **Thin community `Community 12`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `HomePage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `Header()`, `Header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `SkillList()`, `SkillList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `SkillStatus()`, `SkillStatus.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `next.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `playwright.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `ActionPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `session_runner.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `reading_unit.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `dashboard-progress.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `loadProgress()` connect `Community 6` to `Community 9`, `Community 3`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `runSimulator()` connect `Community 3` to `Community 6`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Why does `markSkillsSeen()` connect `Community 6` to `Community 2`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `selectNextExerciseDetailed()` (e.g. with `startPracticeSession()` and `startReadingUnitSession()`) actually correct?**
  _`selectNextExerciseDetailed()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `loadLenguaSelectionGraph()` (e.g. with `assertNormalizedExerciseShape()` and `assertSelectionRespectsPrerequisitesAndMastery()`) actually correct?**
  _`loadLenguaSelectionGraph()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `loadLenguaExercises()` (e.g. with `assertLoadsAllLenguaJson()` and `assertNormalizedExerciseShape()`) actually correct?**
  _`loadLenguaExercises()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `normalizeExercise()` (e.g. with `normalizeSkillId()` and `normalizeSubskillId()`) actually correct?**
  _`normalizeExercise()` has 2 INFERRED edges - model-reasoned connections that need verification._