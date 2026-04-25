import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildMasteryModel } from "../progress/mastery_model.ts";
import { loadProgress } from "../storage/local_progress_store.ts";
import { savePracticeSessionProgress } from "./session_runner.ts";

const progressPath = resolve(process.cwd(), "data/progress.json");
let originalProgress: string | null = null;

describe("practice session progress", () => {
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

  it("saves reading practice progress and feeds the mastery model", async () => {
    await savePracticeSessionProgress({
      sessionType: "reading-based",
      currentFocus: "lengua.skill_2.subskill_1",
      skillId: "lengua.skill_2",
      attempts: 3,
      correct: 2,
      currentMastery: 2,
      readingUnitId: "RU-LEN-NOT-001",
      focusResults: [
        {
          focusId: "lengua.skill_1.subskill_1",
          skillId: "lengua.skill_1",
          attempts: 1,
          correct: 1,
          currentMastery: 1,
        },
        {
          focusId: "lengua.skill_2.subskill_1",
          skillId: "lengua.skill_2",
          attempts: 2,
          correct: 1,
          currentMastery: 2,
        },
      ],
    });

    const progress = loadProgress();
    const session = progress.sessions.at(-1);

    expect(session).toBeDefined();
    expect(session?.mode).toBe("reading");
    expect(session?.readingUnitId).toBe("RU-LEN-NOT-001");

    const resultsById = new Map(session?.skill_results.map((result) => [result.skill_id, result]));

    expect(resultsById.get("lengua.skill_1")).toEqual({
      skill_id: "lengua.skill_1",
      attempts: 1,
      correct: 1,
      state: "developing",
      mastery_level: 2,
    });
    expect(resultsById.get("lengua.skill_2")).toEqual({
      skill_id: "lengua.skill_2",
      attempts: 2,
      correct: 1,
      state: "developing",
      mastery_level: 2,
    });
    expect(resultsById.get("lengua.skill_1.subskill_1")).toEqual({
      skill_id: "lengua.skill_1.subskill_1",
      attempts: 1,
      correct: 1,
      state: "developing",
      mastery_level: 2,
    });
    expect(resultsById.get("lengua.skill_2.subskill_1")).toEqual({
      skill_id: "lengua.skill_2.subskill_1",
      attempts: 2,
      correct: 1,
      state: "developing",
      mastery_level: 2,
    });

    const model = buildMasteryModel(progress);

    expect(model.skills["lengua.skill_1"]?.readingSessions).toBe(1);
    expect(model.skills["lengua.skill_2"]?.readingSessions).toBe(1);
    expect(model.subskills["lengua.skill_1.subskill_1"]?.readingSessions).toBe(1);
    expect(model.subskills["lengua.skill_2.subskill_1"]?.readingSessions).toBe(1);
  });
});
