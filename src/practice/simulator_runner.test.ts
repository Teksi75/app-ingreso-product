import { describe, expect, it } from "vitest";
import { loadLenguaExercises, type Exercise } from "./session_runner.ts";
import {
  buildSimulatorSkillResults,
  evaluateSimulatorSession,
  selectSimulatorExercises,
  selectSimulatorSession,
  createSimulatorSession,
  startSimulatorSession,
  type SimulatorQuestionResult,
} from "./simulator_runner.ts";
import { type ReadingUnit } from "../types/reading_unit.ts";

describe("simulator runner", () => {
  it("starts simulator sessions with valid reading and standalone blocks", () => {
  const session = startSimulatorSession();
  const aliasSession = createSimulatorSession({ maxQuestions: 2 });

  expect(session.mode).toBe("simulator");
  expect(aliasSession.mode).toBe("simulator");
  expect(aliasSession.exercises.length).toBeLessThanOrEqual(2);
  expect(session.exercises.length).toBeGreaterThan(0);
  expect(session.exercises.length).toBeLessThanOrEqual(10);
  expect(session.blocks.some((block) => block.type === "reading_unit")).toBe(true);
  expect(session.blocks[0]?.type).toBe("reading_unit");
  expect(session.blocks[0]?.readingUnit?.text.length).toBeGreaterThan(0);
  expect(session.exercises.some((exercise) => Boolean(exercise.reading_unit_id))).toBe(true);
  expect(new Set(session.exercises.map((exercise) => exercise.id)).size).toBe(session.exercises.length);
  expect(session.exercises.every((exercise) => exercise.options.length >= 2)).toBe(true);
  expect(session.exercises.every((exercise) => exercise.correct_answer.length > 0)).toBe(true);
  expect(session.exercises.every((exercise) => exercise.options.includes(exercise.correct_answer))).toBe(true);

  const canonicalExercises = loadLenguaExercises();
  const canonicalIds = new Set(canonicalExercises.map((exercise) => exercise.id));
  expect(session.exercises.every((exercise) => canonicalIds.has(exercise.id))).toBe(true);
  });

  it("selects compatible simulator exercises by skill", () => {
  const selected = selectSimulatorExercises([
    buildExercise("a1", "lengua.skill_1", "lengua.skill_1.subskill_1", "multiple_choice"),
    buildExercise("a2", "lengua.skill_1", "lengua.skill_1.subskill_2", "multiple_choice_multiple"),
    buildExercise("b1", "lengua.skill_2", "lengua.skill_2.subskill_1", "multiple_choice"),
  ], { maxQuestions: 3 });

  expect(selected.map((exercise) => exercise.id)).toEqual(["a1", "b1"]);
  });

  it("groups reading-unit exercises before standalone simulator exercises", () => {
  const mixed = selectSimulatorSession([
    buildReadingExercise("r1", "RU-1", "Lectura 1", "lengua.skill_1", "lengua.skill_1.subskill_1"),
    buildReadingExercise("r2", "RU-1", "Lectura 1", "lengua.skill_2", "lengua.skill_2.subskill_1"),
    buildReadingExercise("r3", "RU-1", "Lectura 1", "lengua.skill_3", "lengua.skill_3.subskill_1"),
    buildReadingExercise("r4", "RU-1", "Lectura 1", "lengua.skill_4", "lengua.skill_4.subskill_1"),
    buildExercise("s1", "lengua.skill_5", "lengua.skill_5.subskill_1", "multiple_choice"),
    buildExercise("s2", "lengua.skill_6", "lengua.skill_6.subskill_1", "multiple_choice"),
  ], { maxQuestions: 6 });

  expect(mixed.blocks.map((block) => block.type)).toEqual(["reading_unit", "standalone"]);
  expect(mixed.blocks[0]?.exerciseIds.length).toBe(4);
  expect(mixed.blocks[0]?.readingUnit?.id).toBe("RU-1");
  expect(mixed.exercises.slice(0, 4).every((exercise) => exercise.block_id === "reading:RU-1")).toBe(true);
  expect(mixed.exercises.slice(4).every((exercise) => exercise.block_id === "standalone")).toBe(true);
  });

  it("evaluates simulator answers and builds skill results", () => {
  const session = startSimulatorSession();
  const answers = Object.fromEntries(
    session.exercises.map((exercise, index) => [
      exercise.id,
      index === 0 ? exercise.correct_answer : firstWrongOption(exercise.options, exercise.correct_answer),
    ]),
  );
  const evaluation = evaluateSimulatorSession(session, answers);

  expect(evaluation.mode).toBe("simulator");
  expect(evaluation.area).toBe("lengua");
  expect(evaluation.total_attempts).toBe(session.exercises.length);
  expect(evaluation.total_correct).toBe(1);
  expect(evaluation.total_errors).toBe(session.exercises.length - 1);
  expect(evaluation.score_percentage).toBe(Math.round((1 / session.exercises.length) * 100));
  expect(evaluation.exercise_ids).toEqual(session.exercises.map((exercise) => exercise.id));
  expect(evaluation.skill_results.length).toBeGreaterThan(0);
  expect(evaluation.skill_results.every((result) => result.attempts > 0)).toBe(true);
  expect(evaluation.skill_results.every((result) => result.correct <= result.attempts)).toBe(true);
  expect(evaluation.skill_results.every((result) => ["weak", "developing", "mastered"].includes(result.state))).toBe(true);

  const weakResults = buildSimulatorSkillResults([
    buildQuestionResult("x1", "lengua.skill_1", "lengua.skill_1.subskill_1", "incorrect"),
    buildQuestionResult("x2", "lengua.skill_1", "lengua.skill_1.subskill_1", "correct"),
    buildQuestionResult("x3", "lengua.skill_2", "lengua.skill_2.subskill_1", "correct"),
    buildQuestionResult("x4", "lengua.skill_2", "lengua.skill_2.subskill_1", "correct"),
  ]);
  const skillOne = weakResults.find((result) => result.skill_id === "lengua.skill_1");
  const skillTwo = weakResults.find((result) => result.skill_id === "lengua.skill_2");

  expect(skillOne?.state).toBe("developing");
  expect(skillTwo?.state).toBe("mastered");
  });
});

function buildExercise(
  id: string,
  skillId: string,
  subskill: string,
  type: Exercise["type"],
): Exercise {
  return {
    id,
    skill_id: skillId,
    subskill,
    difficulty: 1,
    mastery_level: 1,
    type,
    prompt: id,
    options: ["correct", "wrong"],
    correct_answer: "correct",
    feedback_correct: "ok",
    feedback_incorrect: "bad",
    related_skills: [],
  };
}

function buildReadingExercise(
  id: string,
  readingUnitId: string,
  title: string,
  skillId: string,
  subskill: string,
): Exercise {
  const readingUnit: ReadingUnit = {
    id: readingUnitId,
    title,
    text: "Texto base de lectura para evaluar comprension.",
    difficulty: 2,
    textType: "informative",
    source: "original_interno",
  };

  return {
    ...buildExercise(id, skillId, subskill, "multiple_choice"),
    readingUnitId,
    reading_unit_id: readingUnitId,
    reading_unit: readingUnit,
  };
}

function firstWrongOption(options: string[], correctAnswer: string): string {
  return options.find((option) => option !== correctAnswer) ?? "__wrong__";
}

function buildQuestionResult(
  exerciseId: string,
  skillId: string,
  subskill: string,
  result: SimulatorQuestionResult["result"],
): SimulatorQuestionResult {
  return {
    exercise_id: exerciseId,
    skill_id: skillId,
    subskill,
    result,
    selected_answer: result === "correct" ? "correct" : "wrong",
    correct_answer: "correct",
  };
}
