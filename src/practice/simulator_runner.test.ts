import assert from "node:assert/strict";
import { loadLenguaExercises, type Exercise } from "./session_runner.ts";
import {
  buildSimulatorSkillResults,
  evaluateSimulatorSession,
  selectSimulatorExercises,
  createSimulatorSession,
  startSimulatorSession,
  type SimulatorQuestionResult,
} from "./simulator_runner.ts";

function main(): void {
  const session = startSimulatorSession();
  const aliasSession = createSimulatorSession({ maxQuestions: 2 });

  assert.equal(session.mode, "simulator");
  assert.equal(aliasSession.mode, "simulator");
  assert.ok(aliasSession.exercises.length <= 2);
  assert.ok(session.exercises.length > 0);
  assert.ok(session.exercises.length <= 10);
  assert.equal(new Set(session.exercises.map((exercise) => exercise.id)).size, session.exercises.length);
  assert.ok(session.exercises.every((exercise) => exercise.options.length >= 2));
  assert.ok(session.exercises.every((exercise) => exercise.correct_answer.length > 0));
  assert.ok(session.exercises.every((exercise) => exercise.options.includes(exercise.correct_answer)));

  const canonicalExercises = loadLenguaExercises();
  const canonicalIds = new Set(canonicalExercises.map((exercise) => exercise.id));
  assert.ok(session.exercises.every((exercise) => canonicalIds.has(exercise.id)));

  const selected = selectSimulatorExercises([
    buildExercise("a1", "lengua.skill_1", "lengua.skill_1.subskill_1", "multiple_choice"),
    buildExercise("a2", "lengua.skill_1", "lengua.skill_1.subskill_2", "multiple_choice_multiple"),
    buildExercise("b1", "lengua.skill_2", "lengua.skill_2.subskill_1", "multiple_choice"),
  ], { maxQuestions: 3 });

  assert.deepEqual(selected.map((exercise) => exercise.id), ["a1", "b1"]);

  const answers = Object.fromEntries(
    session.exercises.map((exercise, index) => [
      exercise.id,
      index === 0 ? exercise.correct_answer : firstWrongOption(exercise.options, exercise.correct_answer),
    ]),
  );
  const evaluation = evaluateSimulatorSession(session, answers);

  assert.equal(evaluation.mode, "simulator");
  assert.equal(evaluation.area, "lengua");
  assert.equal(evaluation.total_attempts, session.exercises.length);
  assert.equal(evaluation.total_correct, 1);
  assert.equal(evaluation.total_errors, session.exercises.length - 1);
  assert.equal(evaluation.score_percentage, Math.round((1 / session.exercises.length) * 100));
  assert.deepEqual(evaluation.exercise_ids, session.exercises.map((exercise) => exercise.id));
  assert.ok(evaluation.skill_results.length > 0);
  assert.ok(evaluation.skill_results.every((result) => result.attempts > 0));
  assert.ok(evaluation.skill_results.every((result) => result.correct <= result.attempts));
  assert.ok(evaluation.skill_results.every((result) => ["weak", "developing", "mastered"].includes(result.state)));

  const weakResults = buildSimulatorSkillResults([
    buildQuestionResult("x1", "lengua.skill_1", "lengua.skill_1.subskill_1", "incorrect"),
    buildQuestionResult("x2", "lengua.skill_1", "lengua.skill_1.subskill_1", "correct"),
    buildQuestionResult("x3", "lengua.skill_2", "lengua.skill_2.subskill_1", "correct"),
    buildQuestionResult("x4", "lengua.skill_2", "lengua.skill_2.subskill_1", "correct"),
  ]);
  const skillOne = weakResults.find((result) => result.skill_id === "lengua.skill_1");
  const skillTwo = weakResults.find((result) => result.skill_id === "lengua.skill_2");

  assert.equal(skillOne?.state, "developing");
  assert.equal(skillTwo?.state, "mastered");

  console.log("simulator runner validated");
}

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

main();
