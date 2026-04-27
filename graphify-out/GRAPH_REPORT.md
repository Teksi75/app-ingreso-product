# Graph Report - .  (2026-04-27)

## Corpus Check
- 73 files · ~208,771 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 397 nodes · 701 edges · 52 communities detected
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 109 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 23 edges
2. `loadContentLenguaExercises()` - 22 edges
3. `selectNextExerciseDetailed()` - 18 edges
4. `loadLenguaExercises()` - 16 edges
5. `loadLenguaSelectionGraph()` - 15 edges
6. `startPracticeSession()` - 14 edges
7. `loadProgress()` - 14 edges
8. `loadProgressAsync()` - 14 edges
9. `normalizeExercise()` - 12 edges
10. `startReadingUnitSession()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `slugToReadingUnitId()`  [INFERRED]
  C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\src\app\reporte\datos\route.ts → C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\src\skills\skill_slugs.ts
- `loadLenguaSelectionGraph()` --calls--> `getLenguaMasteryMap()`  [INFERRED]
  src\practice\exercise_selector.ts → C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\src\practice\session_runner.ts
- `middleware()` --calls--> `GET()`  [INFERRED]
  C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\middleware.ts → C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\src\app\reporte\datos\route.ts
- `calculateDashboardData()` --calls--> `loadProgress()`  [INFERRED]
  C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\src\app\page.tsx → C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\src\storage\local_progress_store.ts
- `buildProgressSummary()` --calls--> `GET()`  [INFERRED]
  C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\src\app\progress_summary.ts → C:\Users\pablo\OneDrive\Desarrollo\app-ingreso-product\src\app\reporte\datos\route.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (51): buildFallbackOptions(), buildGeneratedOptions(), buildHighlightOptions(), buildObjectAnswerOptions(), buildOrderingOptions(), buildSessionSkillResults(), buildUserState(), calculateUpdatedMastery() (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (35): getPracticeProgressSnapshot(), getWeakestPracticeSkillId(), buildMasteryModel(), buildPracticeProgressSnapshot(), buildPracticeSkillStats(), buildTrace(), calculateMasteryScore(), clampMasteryLevel() (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (40): clampDifficulty(), clampMastery(), dedupeExercises(), extractSelectorExercises(), filterImmediateRepeats(), filterUnlockedExercises(), findAlternativeSubskill(), findRelatedTarget() (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (27): addFocusResult(), buildReadingBlocks(), buildSimulatorSkillResults(), calculateScorePercentage(), chanceByDifficulty(), createStandaloneBlock(), evaluateSimulatorSession(), groupByReadingUnit() (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (27): appendSessionResult(), cloneProgress(), createEmptyProgress(), createSessionId(), getProgressPath(), getRedisClient(), getRedisProgressKey(), getSeenSkillsAsync() (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (17): ActionPanel(), withNewStudentParam(), getSeenSkills(), buildRestartHref(), getParam(), PracticePage(), SimulacionesPage(), withProgressCode() (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (11): ClientAvatarBadge(), ClientAvatarHero(), ClientStudentName(), SidebarNav(), useProgressCodeFromLocation(), createDefaultProfile(), isLearningGoal(), isPlainObject() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (16): assertBioStimulusLoadsAsSkillTraining(), assertCanonicalTextPackLoads(), assertPracticeSessionsUseChoiceExercises(), assertReadingModeDatasetRunsSequentially(), assertReadingUnitSessionsShareBaseTexts(), assertSelectionRespectsPrerequisitesAndMastery(), assertSessionRunnerUsesCrossRelationships(), assertSkillPracticeCompletesReadingUnitBeforeFallback() (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (2): BottomNav(), useProgressCodeFromLocation()

### Community 10 - "Community 10"
Cohesion: 0.42
Nodes (7): buildSkillStats(), practiceSession(), readingSession(), readyBaseSessions(), result(), stableBaseSessions(), writeProgress()

### Community 11 - "Community 11"
Cohesion: 0.43
Nodes (4): buildContentIndex(), generate(), listJsonFiles(), readJson()

### Community 12 - "Community 12"
Cohesion: 0.48
Nodes (6): assertTextPatternExtractorDoesNotReturnSourceText(), analyzePlainTextShape(), estimatePdfLength(), extractTextPatterns(), inferStructuresFromShape(), inferTextTypesFromShape()

### Community 13 - "Community 13"
Cohesion: 0.53
Nodes (5): baseConsolidatedSessions(), buildSkillStats(), result(), session(), writeProgress()

### Community 14 - "Community 14"
Cohesion: 0.47
Nodes (3): baseConsolidatedSessions(), result(), session()

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 0.83
Nodes (3): createProgressCode(), middleware(), normalizeProgressCode()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.67
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

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 20`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `Header()`, `Header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `SkillList.tsx`, `SkillList()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `SkillStatus()`, `SkillStatus.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `AvatarHero()`, `AvatarHero.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `StreakBadge.tsx`, `getStreakColor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `XpBar.tsx`, `XpBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `next.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `playwright.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `_graphify_ast.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `_graphify_merge_semantic.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `BentoCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `Button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `ProgressCircle.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `SkillCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `static_content.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `exercise_selector.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `skill_slugs.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `reading_unit.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `all-pages.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `dashboard-progress.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `dashboard-responsive.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `dashboard-screenshot.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `first-experience.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `lengua-practice-links.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `student-profile-and-code.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 16`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `buildMasteryModel()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `startReadingUnitSession()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `GET()` (e.g. with `middleware()` and `resolveStudentIdentity()`) actually correct?**
  _`GET()` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `loadContentLenguaExercises()` (e.g. with `GET()` and `normalizeSkillId()`) actually correct?**
  _`loadContentLenguaExercises()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `selectNextExerciseDetailed()` (e.g. with `buildPlannedSessionExercises()` and `startPracticeSession()`) actually correct?**
  _`selectNextExerciseDetailed()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `loadLenguaExercises()` (e.g. with `assertLoadsAllLenguaJson()` and `assertNormalizedExerciseShape()`) actually correct?**
  _`loadLenguaExercises()` has 8 INFERRED edges - model-reasoned connections that need verification._