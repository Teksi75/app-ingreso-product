import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildMasteryModel } from "../progress/mastery_model.ts";
import { getNextStepRecommendation } from "../recommendation/next_step.ts";
import { loadProgress } from "../storage/local_progress_store.ts";
import {
  saveSimulatorSessionProgress,
  type SimulatorExercise,
  type SimulatorSession,
} from "./simulator_runner.ts";

const progressPath = resolve(process.cwd(), "data/progress.json");
let originalProgress: string | null = null;

describe("simulator session progress", () => {
  beforeEach(() => {
    originalProgress = existsSync(progressPath) ? readFileSync(progressPath, "utf8") : null;
    if (existsSync(progressPath)) {
      unlinkSync(progressPath);
    }
  });

  afterEach(() => {
    if (originalProgress === null) {
      if (existsSync(progressPath)) {
        unlinkSync(progressPath);
      }
    } else {
      writeFileSync(progressPath, originalProgress, "utf8");
    }
  });

  it("saves simulator progress and drives mastery recommendations", () => {
    const session = buildSimulatorSession();
    const result = saveSimulatorSessionProgress(session, [
      { exerciseId: "sim-s1-1", answer: "wrong", timeSeconds: 30 },
      { exerciseId: "sim-s1-2", answer: "wrong", timeSeconds: 45 },
      { exerciseId: "sim-s2-1", answer: "correct", timeSeconds: 25 },
      { exerciseId: "sim-s2-2", answer: "correct", timeSeconds: 35 },
    ]);

    expect(result.mode).toBe("simulator");
    expect(result.area).toBe("lengua");
    expect(result.total_attempts).toBe(4);
    expect(result.total_correct).toBe(2);
    expect(result.total_errors).toBe(2);
    expect(result.score_percentage).toBe(50);
    expect(result.duration_seconds).toBe(135);
    expect(result.exercise_ids).toEqual(["sim-s1-1", "sim-s1-2", "sim-s2-1", "sim-s2-2"]);

    const progress = loadProgress();
    const storedSession = progress.sessions.at(-1);

    expect(storedSession).toBeDefined();
    expect(storedSession?.mode).toBe("simulator");
    expect(storedSession?.area).toBe("lengua");
    expect(storedSession?.total_attempts).toBe(4);
    expect(storedSession?.total_correct).toBe(2);
    expect(storedSession?.score_percentage).toBe(50);
    expect(storedSession?.duration_seconds).toBe(135);
    expect(storedSession?.exercise_ids).toEqual(result.exercise_ids);

    const storedResultsById = new Map(storedSession?.skill_results.map((skillResult) => [skillResult.skill_id, skillResult]));

    expect(storedResultsById.get("lengua.skill_1")).toEqual({
      skill_id: "lengua.skill_1",
      attempts: 2,
      correct: 0,
      state: "weak",
      mastery_level: 1,
    });
    expect(storedResultsById.get("lengua.skill_2")).toEqual({
      skill_id: "lengua.skill_2",
      attempts: 2,
      correct: 2,
      state: "mastered",
      mastery_level: 2,
    });
    expect(storedResultsById.has("lengua.skill_1.subskill_1")).toBe(true);
    expect(storedResultsById.has("lengua.skill_2.subskill_1")).toBe(true);

    const model = buildMasteryModel(progress);

    expect(model.lastSessionMode).toBe("simulator");
    expect(model.skills["lengua.skill_1"]?.simulatorSessions).toBe(1);
    expect(model.skills["lengua.skill_2"]?.simulatorSessions).toBe(1);
    expect(model.skills["lengua.skill_1"]?.state).toBe("weak");
    expect(model.skills["lengua.skill_2"]?.masteryLevel).toBe(2);
    expect(model.subskills["lengua.skill_1.subskill_1"]?.simulatorSessions).toBe(1);
    expect(model.subskills["lengua.skill_2.subskill_1"]?.simulatorSessions).toBe(1);

    const recommendation = getNextStepRecommendation(progress);

    expect(recommendation.kind).toBe("review-weak-skill");
    expect(recommendation.skillId).toBe("lengua.skill_1");
    expect(recommendation.basedOn.lastSessionMode).toBe("simulator");
  });
});

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
