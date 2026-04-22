# Graph Report - .  (2026-04-21)

## Corpus Check
- 50 files · ~194,494 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 269 nodes · 450 edges · 43 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.8)
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

## God Nodes (most connected - your core abstractions)
1. `loadContentLenguaExercises()` - 21 edges
2. `selectNextExerciseDetailed()` - 17 edges
3. `loadLenguaExercises()` - 13 edges
4. `loadLenguaSelectionGraph()` - 12 edges
5. `normalizeExercise()` - 11 edges
6. `startPracticeSession()` - 10 edges
7. `loadProgress()` - 10 edges
8. `runSession()` - 9 edges
9. `startReadingUnitSession()` - 8 edges
10. `runSimulator()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `calculateDashboardData()` --calls--> `loadProgress()`  [INFERRED]
  src\app\page.tsx → src\storage\local_progress_store.ts
- `DashboardPage()` --calls--> `loadProgress()`  [INFERRED]
  src\app\dashboard\page.tsx → src\storage\local_progress_store.ts
- `getSkillData()` --calls--> `loadProgress()`  [INFERRED]
  src\app\habilidades\page.tsx → src\storage\local_progress_store.ts
- `PracticePage()` --calls--> `startReadingUnitSession()`  [INFERRED]
  src\app\practice\page.tsx → src\practice\session_runner.ts
- `PracticePage()` --calls--> `startPracticeSession()`  [INFERRED]
  src\app\practice\page.tsx → src\practice\session_runner.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (36): buildFallbackOptions(), buildGeneratedOptions(), buildHighlightOptions(), buildObjectAnswerOptions(), buildOrderingOptions(), ensureContentOptions(), ensureOptions(), flattenPartOptions() (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (30): clampDifficulty(), clampMastery(), filterImmediateRepeats(), filterUnlockedExercises(), findAlternativeSubskill(), findRelatedTarget(), getMasteryGap(), getMasteryLevel() (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (20): dedupeExercises(), extractSelectorExercises(), isFsAvailable(), listLenguaExerciseFiles(), loadLenguaSelectionGraph(), loadLenguaSelectorExercises(), assertBioStimulusLoadsAsSkillTraining(), assertLoadsAllLenguaJson() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (9): ClientAvatarHero(), ClientStudentName(), SidebarNav(), createDefaultProfile(), isLearningGoal(), isPlainObject(), isPreferredSubject(), loadProfileFromStorage() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (17): createEmptyProgress(), createSessionId(), getSeenSkills(), loadProgress(), markSkillsSeen(), saveSessionResult(), updateSeenSkills(), updateSkillStats() (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.23
Nodes (16): assertReadingModeDatasetRunsSequentially(), ensureOptions(), findReadingUnit(), loadReadingExercises(), loadReadingUnits(), normalizeDifficulty(), normalizeGlossary(), normalizeMasteryLevel() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (15): buildSkillResults(), buildSkillStats(), chanceByDifficulty(), formatPercent(), groupBySkill(), hasAvailableExercises(), loadExercises(), pickValue() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (12): buildRestartHref(), calculateUpdatedMastery(), DashboardPage(), getDashboardSkills(), getPracticeSkillStats(), getSkillState(), getStoredMasteryByFocus(), getWeakestSkill() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (6): findMasteryNode(), getLenguaMasteryMap(), loadMasteryMap(), loadRelationships(), readJsonFile(), recommendNextSubskill()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.48
Nodes (6): assertTextPatternExtractorDoesNotReturnSourceText(), analyzePlainTextShape(), estimatePdfLength(), extractTextPatterns(), inferStructuresFromShape(), inferTextTypesFromShape()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (2): calculateDashboardData(), getRank()

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.83
Nodes (3): generate(), listJsonFiles(), readJson()

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (2): getSkillMetadata(), SkillItem()

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

## Knowledge Gaps
- **Thin community `Community 16`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `Header()`, `Header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `SkillList()`, `SkillList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `SkillStatus()`, `SkillStatus.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `AvatarHero()`, `AvatarHero.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `StreakBadge.tsx`, `getStreakColor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `XpBar.tsx`, `XpBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `next.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `playwright.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `ActionPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `session_runner.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `BentoCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `Button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `ProgressCircle.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `SkillCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `static_content.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `reading_unit.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `all-pages.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `dashboard-progress.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `dashboard-responsive.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `dashboard-screenshot.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `lengua-practice-links.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `loadProgress()` connect `Community 4` to `Community 12`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `runSimulator()` connect `Community 6` to `Community 4`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `startPracticeSession()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 7`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `loadContentLenguaExercises()` (e.g. with `normalizeSkillId()` and `normalizeSubskillId()`) actually correct?**
  _`loadContentLenguaExercises()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `selectNextExerciseDetailed()` (e.g. with `startPracticeSession()` and `startReadingUnitSession()`) actually correct?**
  _`selectNextExerciseDetailed()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `loadLenguaExercises()` (e.g. with `assertLoadsAllLenguaJson()` and `assertNormalizedExerciseShape()`) actually correct?**
  _`loadLenguaExercises()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `loadLenguaSelectionGraph()` (e.g. with `assertNormalizedExerciseShape()` and `assertSelectionRespectsPrerequisitesAndMastery()`) actually correct?**
  _`loadLenguaSelectionGraph()` has 7 INFERRED edges - model-reasoned connections that need verification._