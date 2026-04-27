import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  listLenguaExerciseFiles,
  loadLenguaSelectionGraph,
  loadLenguaSelectorExercises,
  normalizeSkillId,
  normalizeSubskillId,
  selectNextExerciseDetailed,
  type Exercise as SelectorExercise,
  type MasteryLevel,
} from "../../../practice/exercise_selector.ts";
import {
  getReadingUnitCandidates,
  loadLenguaExercises,
  runSession,
  startPracticeSession,
  startReadingUnitSession,
  type Exercise,
} from "../../../practice/session_runner.ts";
import { extractTextPatterns } from "../../../content_analysis/text_pattern_extractor.ts";
import { startReadingSession } from "../../../practice/reading_session.ts";

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

  expect(listedFiles).toEqual(expectedFiles);
  const expectedFileSet = new Set(expectedFiles);
  const engineExerciseCount = fullExercises.filter(
    (exercise) => exercise.source_file && expectedFileSet.has(exercise.source_file),
  ).length;
  const contentReadingExerciseCount = fullExercises.filter(
    (exercise) => exercise.source_file && !expectedFileSet.has(exercise.source_file) && exercise.readingUnitId,
  ).length;
  expect(engineExerciseCount).toBeGreaterThanOrEqual(contentIndex.total_exercise_count);
  expect(fullExercises.length).toBeGreaterThanOrEqual(contentIndex.total_exercise_count);
  expect(contentReadingExerciseCount).toBeGreaterThanOrEqual(22);
  expect(selectorExercises.length).toBe(contentIndex.total_exercise_count);
  expect(new Set(fullExercises.map((exercise) => exercise.id)).size).toBe(fullExercises.length);

  for (const entry of contentIndex.files) {
    expect(
      selectorExercises.filter((exercise) => exercise.sourceFile === entry.file).length,
      entry.file,
    ).toBe(entry.exercise_count);
  }
}

function assertNormalizedExerciseShape(): void {
  const graph = loadLenguaSelectionGraph(engineDir);
  const exercises = loadLenguaExercises(engineDir);
  const canonicalSkills = new Set(contentIndex.canonical_skills);

  expect(graph.relationships.length).toBe(38);
  expect(graph.masteryMap.length).toBe(36);

  for (const exercise of exercises) {
    expect(exercise.id).toMatch(/\S/);
    expect(canonicalSkills.has(exercise.skill_id), exercise.id).toBe(true);
    expect(exercise.subskill).toMatch(/^lengua\.skill_[1-7]\.subskill_[1-5]$/);
    expect([1, 2, 3].includes(exercise.difficulty), exercise.id).toBe(true);
    expect([1, 2, 3, 4].includes(exercise.mastery_level), exercise.id).toBe(true);
    expect(exercise.type).toMatch(/\S/);
    expect(exercise.prompt).toMatch(/\S/);
    expect(
      exercise.options.filter((option) => option.trim().length > 0).length >= 2,
      exercise.id,
    ).toBe(true);
    expect(exercise.options.includes(exercise.correct_answer), exercise.id).toBe(true);
    expect(exercise.correct_answer, exercise.id).not.toMatch(/^[\[{]/);
    expect(exercise.feedback_correct).toMatch(/\S/);
    expect(exercise.feedback_incorrect).toMatch(/\S/);
  }

  expect(normalizeSkillId(2, graph)).toBe("lengua.skill_2");
  expect(normalizeSkillId("LEN-GRAM-002", graph)).toBe("lengua.skill_4");
  expect(normalizeSkillId("Gestion verbal en contexto", graph)).toBe("lengua.skill_5");
  expect(
    normalizeSubskillId("deteccion de ruptura de coherencia", "lengua.skill_2", graph),
  ).toBe("lengua.skill_2.subskill_2");
  expect(
    normalizeSubskillId("uso de coma", "lengua.skill_7", graph),
  ).toBe("lengua.skill_7.subskill_1");
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
  expect(initialSelection.exercise.id).toBe("skill_1_ready");

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

  expect(unlockedSelection.exercise.id).toBe("skill_3_locked");
  expect(unlockedSelection.ruleApplied).toBe("B");
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

  expect(
    result.history.map((item) => item.exerciseId),
  ).toEqual(["skill_1_a", "skill_1_b", "skill_1_c", "skill_3_unlocked"]);
  expect(result.summary.total).toBe(4);
  expect(result.summary.correct).toBe(4);
  expect(
    result.finalState.find((state) => state.subskill === "lengua.skill_1.subskill_3")?.masteryLevel,
  ).toBe(3);
  expect(
    result.history.at(-1)?.subskill,
  ).toBe("lengua.skill_3.subskill_2");
}

function assertPracticeSessionsUseChoiceExercises(): void {
  for (const skillId of [null, ...contentIndex.canonical_skills]) {
    const session = withMutedConsole(() => (
      startPracticeSession(skillId, [], { forceNewStudent: true })
    ));

    expect(
      session.exercise.options.filter((option) => option.trim().length > 0).length >= 2,
      session.exercise.id,
    ).toBe(true);
    expect(session.exercisePool.length, String(skillId)).toBeGreaterThan(0);

    for (const exercise of session.exercisePool) {
      expect(
        exercise.options.filter((option) => option.trim().length > 0).length >= 2,
        exercise.id,
      ).toBe(true);
    }
  }
}

function assertReadingUnitSessionsShareBaseTexts(): void {
  const exercises = loadLenguaExercises(engineDir);
  const readingExercises = exercises.filter((exercise) => exercise.reading_unit_id);
  const unitsById = new Map<string, Exercise[]>();

  for (const exercise of readingExercises) {
    expect(exercise.reading_unit, exercise.id).toBeDefined();
    expect(["generated", "original_interno"].includes(exercise.reading_unit?.source ?? ""), exercise.id).toBe(true);
    expect(exercise.text, exercise.id).toBe(exercise.reading_unit?.text);

    const unitExercises = unitsById.get(exercise.reading_unit_id ?? "") ?? [];
    unitExercises.push(exercise);
    unitsById.set(exercise.reading_unit_id ?? "", unitExercises);
  }

  expect(unitsById.size).toBeGreaterThanOrEqual(2);

  for (const [unitId, unitExercises] of unitsById) {
    expect(unitExercises.length, unitId).toBeGreaterThanOrEqual(2);
  }

  const session = withMutedConsole(() => startReadingUnitSession(null, [], { forceNewStudent: true }));

  expect(session.mode).toBe("reading");
  expect(session.sessionType).toBe("reading-based");
  expect(session.readingUnit.source).toBe("original_interno");
  expect(session.exercisePool.length).toBeGreaterThanOrEqual(2);
  expect(
    session.sessionExercises.map((exercise) => exercise.id),
  ).toEqual(session.exercisePool.map((exercise) => exercise.id));
  expect(session.exercisePool.every((exercise) => exercise.reading_unit_id === session.readingUnit.id)).toBe(true);
  expect(session.exercise.reading_unit?.id).toBe(session.readingUnit.id);
}

function assertBioStimulusLoadsAsSkillTraining(): void {
  const exercises = loadLenguaExercises(engineDir);
  const bioExercises = exercises.filter((exercise) => exercise.readingUnitId === "RU-LEN-BIO-001");

  expect(bioExercises.length).toBeGreaterThanOrEqual(12);
  expect(bioExercises.every((exercise) => exercise.reading_unit?.source === "original_interno")).toBe(true);
  expect(bioExercises.every((exercise) => !exercise.reading_unit?.image)).toBe(true);
  expect(bioExercises.every((exercise) => exercise.reading_unit?.moduleFit?.includes("modulo_1"))).toBe(true);
  expect(bioExercises.every((exercise) => exercise.skill_id.startsWith("lengua.skill_"))).toBe(true);
  expect(bioExercises.every((exercise) => exercise.subskill.startsWith(`${exercise.skill_id}.subskill_`))).toBe(true);

  const paratextExercise = bioExercises.find((exercise) => exercise.id === "M1-BIO-001");
  expect(paratextExercise).toBeDefined();
  expect(paratextExercise?.type).toBe("multiple_choice_multiple");
  expect(paratextExercise?.correct_answers?.includes("glosario")).toBe(true);

  const multipartExercise = bioExercises.find((exercise) => exercise.id === "M1-BIO-004");
  expect(multipartExercise?.parts).toBeDefined();
  expect(multipartExercise?.parts?.length).toBe(2);

  const categorizationExercise = bioExercises.find((exercise) => exercise.id === "M1-BIO-008");
  expect(categorizationExercise?.categorization).toBeDefined();
  expect(categorizationExercise?.categorization?.items.includes("Chile")).toBe(true);
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
    expect(unitExercises.length, readingUnitId).toBeGreaterThanOrEqual(3);
    expect(unitExercises.every((exercise) => exercise.reading_unit?.source === "original_interno"), readingUnitId).toBe(true);
  }

  expect(candidates.length).toBeGreaterThanOrEqual(canonicalUnitIds.length);
  expect(candidates[0]?.source).toBe("original_interno");
  expect(canonicalUnitIds.includes(candidates[0]?.id ?? "")).toBe(true);
}

function assertReadingModeDatasetRunsSequentially(): void {
  const session = startReadingSession("RU-LEN-NOT-001");

  expect(session.sessionType).toBe("reading-based");
  expect(session.readingUnit.id).toBe("RU-LEN-NOT-001");
  expect(session.readingUnit.source).toBe("original_interno");
  expect(session.exercises.length).toBeGreaterThanOrEqual(2);
  expect(session.summary.exerciseCount).toBe(session.exercises.length);
  expect(
    session.exercises.map((exercise) => exercise.readingUnitId),
  ).toEqual(session.exercises.map(() => "RU-LEN-NOT-001"));
  expect(
    session.exercises.map((exercise) => exercise.id),
  ).toEqual(["GAM-004", "GPD-004", "GMA-002", "M3-NOT-001", "M3-NOT-002", "M3-NOT-003", "M3-NOT-004", "M3-NOT-005"]);
  expect(session.exercises.every((exercise) => exercise.options.includes(exercise.correct_answer))).toBe(true);
}

function assertSkillPracticeCompletesReadingUnitBeforeFallback(): void {
  let usedExerciseIds: string[] = [];
  const selected: Exercise[] = [];

  for (let index = 0; index < 3; index += 1) {
    const session = withMutedConsole(() => (
      startPracticeSession("lengua.skill_1", usedExerciseIds, { forceNewStudent: true })
    ));

    expect(session.mode).toBe("training");
    expect(session.sessionType).toBe("reading-based");
    selected.push(session.exercise);
    usedExerciseIds = session.usedExerciseIds;
  }

  const readingUnitId = selected[0].readingUnitId;

  expect(readingUnitId).toBeTruthy();
  expect(selected.every((exercise) => exercise.readingUnitId === readingUnitId)).toBe(true);
}

function assertTextPatternExtractorDoesNotReturnSourceText(): void {
  const summary = extractTextPatterns();

  expect(summary.avgLength).toBeGreaterThan(0);
  expect(summary.textTypes.length).toBeGreaterThan(0);
  expect(summary.commonStructures.length).toBeGreaterThan(0);
  expect(JSON.stringify(summary)).not.toContain("Tomas");
}

describe("lengua integration", () => {
  it("loads all configured Lengua JSON files", assertLoadsAllLenguaJson);
  it("normalizes exercise shape and skill identifiers", assertNormalizedExerciseShape);
  it("respects prerequisites and mastery during selection", assertSelectionRespectsPrerequisitesAndMastery);
  it("uses cross-skill relationships in practice sessions", assertSessionRunnerUsesCrossRelationships);
  it("starts practice sessions with choice exercises", assertPracticeSessionsUseChoiceExercises);
  it("shares base texts across reading-unit sessions", assertReadingUnitSessionsShareBaseTexts);
  it("loads the biography stimulus as skill training", assertBioStimulusLoadsAsSkillTraining);
  it("loads canonical text pack reading units", assertCanonicalTextPackLoads);
  it("runs reading mode datasets sequentially", assertReadingModeDatasetRunsSequentially);
  it("completes reading units before skill-practice fallback", assertSkillPracticeCompletesReadingUnitBeforeFallback);
  it("extracts text patterns without leaking source text", assertTextPatternExtractorDoesNotReturnSourceText);
});
