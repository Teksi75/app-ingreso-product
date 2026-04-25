import assert from "node:assert/strict";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildMasteryModel } from "../progress/mastery_model.ts";
import { getNextStepRecommendation } from "../recommendation/next_step.ts";
import { loadProgress } from "../storage/local_progress_store.ts";
import {
  saveSimulatorSessionProgress,
  type SimulatorExercise,
  type SimulatorSession,
} from "./simulator_runner.ts";

const progressPath = resolve(process.cwd(), "data/progress.json");
const originalProgress = existsSync(progressPath) ? readFileSync(progressPath, "utf8") : null;

function main(): void {
  try {
    if (existsSync(progressPath)) {
      unlinkSync(progressPath);
    }

    const session = buildSimulatorSession();
    const result = saveSimulatorSessionProgress(session, [
      { exerciseId: "sim-s1-1", answer: "wrong", timeSeconds: 30 },
      { exerciseId: "sim-s1-2", answer: "wrong", timeSeconds: 45 },
      { exerciseId: "sim-s2-1", answer: "correct", timeSeconds: 25 },
      { exerciseId: "sim-s2-2", answer: "correct", timeSeconds: 35 },
    ]);

    assert.equal(result.mode, "simulator");
    assert.equal(result.area, "lengua");
    assert.equal(result.total_attempts, 4);
    assert.equal(result.total_correct, 2);
    assert.equal(result.total_errors, 2);
    assert.equal(result.score_percentage, 50);
    assert.equal(result.duration_seconds, 135);
    assert.deepEqual(result.exercise_ids, ["sim-s1-1", "sim-s1-2", "sim-s2-1", "sim-s2-2"]);

    const progress = loadProgress();
    const storedSession = progress.sessions.at(-1);

    assert.ok(storedSession);
    assert.equal(storedSession.mode, "simulator");
    assert.equal(storedSession.area, "lengua");
    assert.equal(storedSession.total_attempts, 4);
    assert.equal(storedSession.total_correct, 2);
    assert.equal(storedSession.score_percentage, 50);
    assert.equal(storedSession.duration_seconds, 135);
    assert.deepEqual(storedSession.exercise_ids, result.exercise_ids);

    const storedResultsById = new Map(storedSession.skill_results.map((skillResult) => [skillResult.skill_id, skillResult]));

    assert.deepEqual(storedResultsById.get("lengua.skill_1"), {
      skill_id: "lengua.skill_1",
      attempts: 2,
      correct: 0,
      state: "weak",
      mastery_level: 1,
    });
    assert.deepEqual(storedResultsById.get("lengua.skill_2"), {
      skill_id: "lengua.skill_2",
      attempts: 2,
      correct: 2,
      state: "mastered",
      mastery_level: 2,
    });
    assert.ok(storedResultsById.has("lengua.skill_1.subskill_1"));
    assert.ok(storedResultsById.has("lengua.skill_2.subskill_1"));

    const model = buildMasteryModel(progress);

    assert.equal(model.lastSessionMode, "simulator");
    assert.equal(model.skills["lengua.skill_1"]?.simulatorSessions, 1);
    assert.equal(model.skills["lengua.skill_2"]?.simulatorSessions, 1);
    assert.equal(model.skills["lengua.skill_1"]?.state, "weak");
    assert.equal(model.skills["lengua.skill_2"]?.masteryLevel, 2);
    assert.equal(model.subskills["lengua.skill_1.subskill_1"]?.simulatorSessions, 1);
    assert.equal(model.subskills["lengua.skill_2.subskill_1"]?.simulatorSessions, 1);

    const recommendation = getNextStepRecommendation(progress);

    assert.equal(recommendation.kind, "review-weak-skill");
    assert.equal(recommendation.skillId, "lengua.skill_1");
    assert.equal(recommendation.basedOn.lastSessionMode, "simulator");

    console.log("simulator progress integration validated");
  } finally {
    if (originalProgress === null) {
      if (existsSync(progressPath)) {
        unlinkSync(progressPath);
      }
    } else {
      writeFileSync(progressPath, originalProgress, "utf8");
    }
  }
}

function buildSimulatorSession(): SimulatorSession {
  const exercises: SimulatorExercise[] = [
    buildSimulatorExercise("sim-s1-1", "lengua.skill_1", "lengua.skill_1.subskill_1"),
    buildSimulatorExercise("sim-s1-2", "lengua.skill_1", "lengua.skill_1.subskill_1"),
    buildSimulatorExercise("sim-s2-1", "lengua.skill_2", "lengua.skill_2.subskill_1"),
    buildSimulatorExercise("sim-s2-2", "lengua.skill_2", "lengua.skill_2.subskill_1"),
  ];

  return {
    mode: "simulator",
    blocks: [
      {
        id: "standalone",
        type: "standalone",
        title: "Ejercicios sueltos",
        exerciseIds: exercises.map((exercise) => exercise.id),
      },
    ],
    exercises,
    totalQuestions: exercises.length,
  };
}

function buildSimulatorExercise(
  id: string,
  skillId: string,
  subskill: string,
): SimulatorExercise {
  return {
    id,
    skill_id: skillId,
    subskill,
    difficulty: 1,
    prompt: id,
    options: ["correct", "wrong"],
    correct_answer: "correct",
    block_id: "standalone",
  };
}

main();
