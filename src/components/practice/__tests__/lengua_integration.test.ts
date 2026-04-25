import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  listLenguaExerciseFiles,
  loadLenguaSelectionGraph,
  loadLenguaSelectorExercises,
  normalizeSkillId,
  normalizeSubskillId,
  selectNextExerciseDetailed,
  type Exercise as SelectorExercise,
  type MasteryLevel,
} from "../exercise_selector.ts";
import {
  getReadingUnitCandidates,
  loadLenguaExercises,
  runSession,
  startPracticeSession,
  startReadingUnitSession,
  type Exercise,
} from "../session_runner.ts";
import { extractTextPatterns } from "../../../content_analysis/text_pattern_extractor.ts";
import { startReadingSession } from "../../../practice/reading_session_runner.ts";

const engineDir = resolve(process.cwd(), "docs/04_exercise_engine");
const contentIndex = JSON.parse(
  readFileSync(join(engineDir, "lengua_content_index.json"), "utf8"),
) as {
  files: Array<{ file: string; exercise_count: number }>;
  total_exercise_count: number;
  canonical_skills: string[];
};

function withMutedConsole<T>(callback: () => T): T {
  const originalLog = console.log;
  console.log = () => undefined;

  try {
    return callback();
  } finally {
    console.log = originalLog;
  }
}

function buildExercise(
  id: string,
  skillId: string,
  subskill: string,
  masteryLevel: MasteryLevel = 1,
): Exercise {
  return {
    id,
    skill_id: skillId,
    subskill,
    difficulty: 1,
    mastery_level: masteryLevel,
    type: "multiple_choice",
    prompt: id,
    options: ["ok", "bad"],
    correct_answer: "ok",
    feedback_correct: "ok",
    feedback_incorrect: "bad",
    related_skills: [],
  };
}

function assertLoadsAllLenguaJson(): void {
  const expectedFiles = contentIndex.files.map((entry) => entry.file).sort();
  const listedFiles = listLenguaExerciseFiles(engineDir);
  const fullExercises = loadLenguaExercises(engineDir);
  const selectorExercises = loadLenguaSelectorExercises(engineDir);

  assert.deepEqual(listedFiles, expectedFiles);
  const expectedFileSet = new Set(expectedFiles);
  const engineExerciseCount = fullExercises.filter(
    (exercise) => exercise.source_file && expectedFileSet.has(exercise.source_file),
  ).length;
  const contentReadingExerciseCount = fullExercises.filter(
    (exercise) => exercise.source_file && !expectedFileSet.has(exercise.source_file) && exercise.readingUnitId,
  ).length;
  assert.equal(engineExerciseCount, contentIndex.total_exercise_count);
  assert.ok(fullExercises.length >= contentIndex.total_exercise_count);
  assert.equal(contentReadingExerciseCount, 22);
  assert.equal(selectorExercises.length, contentIndex.total_exercise_count);
  assert.equal(new Set(fullExercises.map((exercise) => exercise.id)).size, fullExercises.length);

  for (const entry of contentIndex.files) {
    assert.equal(
      fullExercises.filter((exercise) => exercise.source_file === entry.file).length,
      entry.exercise_count,
      entry.file,
    );
  }
}

function assertNormalizedExerciseShape(): void {
  const graph = loadLenguaSelectionGraph(engineDir);
  const exercises = loadLenguaExercises(engineDir);
  const canonicalSkills = new Set(contentIndex.canonical_skills);

  assert.equal(graph.relationships.length, 38);
  assert.equal(graph.masteryMap.length, 36);

  for (const exercise of exercises) {
    assert.match(exercise.id, /\S/);
    assert.ok(canonicalSkills.has(exercise.skill_id), exercise.id);
    assert.match(exercise.subskill, /^lengua\.skill_[1-7]\.subskill_[1-5]$/);
    assert.ok([1, 2, 3].includes(exercise.difficulty), exercise.id);
    assert.ok([1, 2, 3, 4].includes(exercise.mastery_level), exercise.id);
    assert.match(exercise.type, /\S/);
    assert.match(exercise.prompt, /\S/);
    assert.ok(
      exercise.options.filter((option) => option.trim().length > 0).length >= 2,
      exercise.id,
    );
    assert.ok(exercise.options.includes(exercise.correct_answer), exercise.id);
    assert.doesNotMatch(exercise.correct_answer, /^[\[{]/, exercise.id);
    assert.match(exercise.feedback_correct, /\S/);
    assert.match(exercise.feedback_incorrect, /\S/);
  }

  assert.equal(normalizeSkillId(2, graph), "lengua.skill_2");
  assert.equal(normalizeSkillId("LEN-GRAM-002", graph), "lengua.skill_4");
  assert.equal(normalizeSkillId("Gestion verbal en contexto", graph), "lengua.skill_5");
  assert.equal(
    normalizeSubskillId("deteccion de ruptura de coherencia", "lengua.skill_2", graph),
    "lengua.skill_2.subskill_2",
  );
  assert.equal(
    normalizeSubskillId("uso de coma", "lengua.skill_7", graph),
    "lengua.skill_7.subskill_1",
  );
}

function assertSelectionRespectsPrerequisitesAndMastery(): void {
  const graph = loadLenguaSelectionGraph(engineDir);
  const exercises: SelectorExercise[] = [
    { id: "skill_1_ready", skill: "lengua.skill_1", subskill: "lengua.skill_1.subskill_3", difficulty: 1, masteryLevel: 1 },
    { id: "skill_2_locked", skill: "lengua.skill_2", subskill: "lengua.skill_2.subskill_1", difficulty: 1, masteryLevel: 1 },
    { id: "skill_3_locked", skill: "lengua.skill_3", subskill: "lengua.skill_3.subskill_2", difficulty: 1, masteryLevel: 1 },
  ];

  const initialSelection = withMutedConsole(() => (
    selectNextExerciseDetailed(exercises, [], { selectionGraph: graph })
  ));
  assert.equal(initialSelection.exercise.id, "skill_1_ready");

  const unlockedSelection = withMutedConsole(() => (
    selectNextExerciseDetailed(
      exercises,
      [
        {
          skill: "lengua.skill_1",
          subskill: "lengua.skill_1.subskill_3",
          accuracy: 1,
          streak: 2,
          attempts: 3,
          lastResult: "correct",
          masteryLevel: 3,
        },
      ],
      {
        selectionGraph: graph,
        masteryBySkill: {
          "lengua.skill_1": 3,
          "lengua.skill_1.subskill_3": 3,
        },
      },
    )
  ));

  assert.equal(unlockedSelection.exercise.id, "skill_3_locked");
  assert.equal(unlockedSelection.ruleApplied, "B");
}

function assertSessionRunnerUsesCrossRelationships(): void {
  const exercises = [
    buildExercise("skill_1_a", "lengua.skill_1", "lengua.skill_1.subskill_3"),
    buildExercise("skill_1_b", "lengua.skill_1", "lengua.skill_1.subskill_3"),
    buildExercise("skill_1_c", "lengua.skill_1", "lengua.skill_1.subskill_3"),
    buildExercise("skill_3_unlocked", "lengua.skill_3", "lengua.skill_3.subskill_2"),
  ];
  const result = withMutedConsole(() => (
    runSession(exercises, (exercise) => exercise.correct_answer, {
      maxSteps: 4,
      forceNewStudent: true,
    })
  ));

  assert.deepEqual(
    result.history.map((item) => item.exerciseId),
    ["skill_1_a", "skill_1_b", "skill_1_c", "skill_3_unlocked"],
  );
  assert.equal(result.summary.total, 4);
  assert.equal(result.summary.correct, 4);
  assert.equal(
    result.finalState.find((state) => state.subskill === "lengua.skill_1.subskill_3")?.masteryLevel,
    3,
  );
  assert.equal(
    result.history.at(-1)?.subskill,
    "lengua.skill_3.subskill_2",
  );
}

function assertPracticeSessionsUseChoiceExercises(): void {
  for (const skillId of [null, ...contentIndex.canonical_skills]) {
    const session = withMutedConsole(() => (
      startPracticeSession(skillId, [], { forceNewStudent: true })
    ));

    assert.ok(
      session.exercise.options.filter((option) => option.trim().length > 0).length >= 2,
      session.exercise.id,
    );
    assert.ok(session.exercisePool.length > 0, String(skillId));

    for (const exercise of session.exercisePool) {
      assert.ok(
        exercise.options.filter((option) => option.trim().length > 0).length >= 2,
        exercise.id,
      );
    }
  }
}

function assertReadingUnitSessionsShareBaseTexts(): void {
  const exercises = loadLenguaExercises(engineDir);
  const readingExercises = exercises.filter((exercise) => exercise.reading_unit_id);
  const unitsById = new Map<string, Exercise[]>();

  for (const exercise of readingExercises) {
    assert.ok(exercise.reading_unit, exercise.id);
    assert.ok(["generated", "original_interno"].includes(exercise.reading_unit?.source ?? ""), exercise.id);
    assert.equal(exercise.text, exercise.reading_unit?.text, exercise.id);

    const unitExercises = unitsById.get(exercise.reading_unit_id ?? "") ?? [];
    unitExercises.push(exercise);
    unitsById.set(exercise.reading_unit_id ?? "", unitExercises);
  }

  assert.ok(unitsById.size >= 2);

  for (const [unitId, unitExercises] of unitsById) {
    assert.ok(unitExercises.length >= 2, unitId);
  }

  const session = withMutedConsole(() => startReadingUnitSession(null, [], { forceNewStudent: true }));

  assert.equal(session.mode, "reading");
  assert.equal(session.sessionType, "reading-based");
  assert.equal(session.readingUnit.source, "original_interno");
  assert.ok(session.exercisePool.length >= 2);
  assert.deepEqual(
    session.sessionExercises.map((exercise) => exercise.id),
    session.exercisePool.map((exercise) => exercise.id),
  );
  assert.ok(session.exercisePool.every((exercise) => exercise.reading_unit_id === session.readingUnit.id));
  assert.equal(session.exercise.reading_unit?.id, session.readingUnit.id);
}

function assertBioStimulusLoadsAsSkillTraining(): void {
  const exercises = loadLenguaExercises(engineDir);
  const bioExercises = exercises.filter((exercise) => exercise.readingUnitId === "RU-LEN-BIO-001");

  assert.equal(bioExercises.length, 10);
  assert.ok(bioExercises.every((exercise) => exercise.reading_unit?.source === "original_interno"));
  assert.ok(bioExercises.every((exercise) => !exercise.reading_unit?.image));
  assert.ok(bioExercises.every((exercise) => exercise.reading_unit?.moduleFit?.includes("modulo_1")));
  assert.ok(bioExercises.every((exercise) => exercise.skill_id.startsWith("lengua.skill_")));
  assert.ok(bioExercises.every((exercise) => exercise.subskill.startsWith(`${exercise.skill_id}.subskill_`)));

  const paratextExercise = bioExercises.find((exercise) => exercise.id === "M1-BIO-001");
  assert.ok(paratextExercise);
  assert.equal(paratextExercise.type, "multiple_choice_multiple");
  assert.ok(paratextExercise.correct_answers?.includes("glosario"));

  const multipartExercise = bioExercises.find((exercise) => exercise.id === "M1-BIO-004");
  assert.ok(multipartExercise?.parts);
  assert.equal(multipartExercise.parts.length, 2);

  const categorizationExercise = bioExercises.find((exercise) => exercise.id === "M1-BIO-008");
  assert.ok(categorizationExercise?.categorization);
  assert.ok(categorizationExercise.categorization.items.includes("Chile"));
}

function assertCanonicalTextPackLoads(): void {
  const exercises = loadLenguaExercises(engineDir);
  const candidates = getReadingUnitCandidates();
  const canonicalUnitIds = [
    "RU-LEN-BIO-001",
    "RU-LEN-NOT-001",
    "RU-LEN-LEY-001",
    "RU-LEN-ENC-001",
    "RU-LEN-CUE-001",
  ];

  for (const readingUnitId of canonicalUnitIds) {
    const unitExercises = exercises.filter((exercise) => exercise.readingUnitId === readingUnitId);
    assert.ok(unitExercises.length >= 3, readingUnitId);
    assert.ok(unitExercises.every((exercise) => exercise.reading_unit?.source === "original_interno"), readingUnitId);
  }

  assert.ok(candidates.length >= canonicalUnitIds.length);
  assert.equal(candidates[0]?.source, "original_interno");
  assert.ok(canonicalUnitIds.includes(candidates[0]?.id ?? ""));
}

function assertReadingModeDatasetRunsSequentially(): void {
  const session = startReadingSession("RU-LEN-NOT-001");

  assert.equal(session.sessionType, "reading-based");
  assert.equal(session.readingUnit.id, "RU-LEN-NOT-001");
  assert.equal(session.readingUnit.source, "original_interno");
  assert.ok(session.exercises.length >= 2);
  assert.equal(session.summary.exerciseCount, session.exercises.length);
  assert.deepEqual(
    session.exercises.map((exercise) => exercise.readingUnitId),
    session.exercises.map(() => "RU-LEN-NOT-001"),
  );
  assert.deepEqual(
    session.exercises.map((exercise) => exercise.id),
    ["M3-NOT-001", "M3-NOT-002", "M3-NOT-003"],
  );
  assert.ok(session.exercises.every((exercise) => exercise.options.includes(exercise.correct_answer)));
}

function assertSkillPracticeCompletesReadingUnitBeforeFallback(): void {
  let usedExerciseIds: string[] = [];
  const selected: Exercise[] = [];

  for (let index = 0; index < 3; index += 1) {
    const session = withMutedConsole(() => (
      startPracticeSession("lengua.skill_1", usedExerciseIds, { forceNewStudent: true })
    ));

    assert.equal(session.mode, "training");
    assert.equal(session.sessionType, "reading-based");
    selected.push(session.exercise);
    usedExerciseIds = session.usedExerciseIds;
  }

  const readingUnitId = selected[0].readingUnitId;

  assert.ok(readingUnitId);
  assert.ok(selected.every((exercise) => exercise.readingUnitId === readingUnitId));
}

function assertTextPatternExtractorDoesNotReturnSourceText(): void {
  const summary = extractTextPatterns();

  assert.ok(summary.avgLength > 0);
  assert.ok(summary.textTypes.length > 0);
  assert.ok(summary.commonStructures.length > 0);
  assert.ok(!JSON.stringify(summary).includes("Tomas"));
}

assertLoadsAllLenguaJson();
assertNormalizedExerciseShape();
assertSelectionRespectsPrerequisitesAndMastery();
assertSessionRunnerUsesCrossRelationships();
assertPracticeSessionsUseChoiceExercises();
assertReadingUnitSessionsShareBaseTexts();
assertBioStimulusLoadsAsSkillTraining();
assertCanonicalTextPackLoads();
assertReadingModeDatasetRunsSequentially();
assertSkillPracticeCompletesReadingUnitBeforeFallback();
assertTextPatternExtractorDoesNotReturnSourceText();

console.log("lengua integration validated");
