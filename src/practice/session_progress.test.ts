import assert from "node:assert/strict";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildMasteryModel } from "../progress/mastery_model.ts";
import { loadProgress } from "../storage/local_progress_store.ts";
import { savePracticeSessionProgress } from "./session_runner.ts";

const progressPath = resolve(process.cwd(), "data/progress.json");
const originalProgress = existsSync(progressPath) ? readFileSync(progressPath, "utf8") : null;

async function main(): Promise<void> {
  try {
    if (existsSync(progressPath)) {
      unlinkSync(progressPath);
    }

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

    assert.ok(session);
    assert.equal(session.mode, "reading");
    assert.equal(session.readingUnitId, "RU-LEN-NOT-001");

    const resultsById = new Map(session.skill_results.map((result) => [result.skill_id, result]));

    assert.deepEqual(resultsById.get("lengua.skill_1"), {
      skill_id: "lengua.skill_1",
      attempts: 1,
      correct: 1,
      state: "developing",
      mastery_level: 2,
    });
    assert.deepEqual(resultsById.get("lengua.skill_2"), {
      skill_id: "lengua.skill_2",
      attempts: 2,
      correct: 1,
      state: "developing",
      mastery_level: 2,
    });
    assert.deepEqual(resultsById.get("lengua.skill_1.subskill_1"), {
      skill_id: "lengua.skill_1.subskill_1",
      attempts: 1,
      correct: 1,
      state: "developing",
      mastery_level: 2,
    });
    assert.deepEqual(resultsById.get("lengua.skill_2.subskill_1"), {
      skill_id: "lengua.skill_2.subskill_1",
      attempts: 2,
      correct: 1,
      state: "developing",
      mastery_level: 2,
    });

    const model = buildMasteryModel(progress);

    assert.equal(model.skills["lengua.skill_1"]?.readingSessions, 1);
    assert.equal(model.skills["lengua.skill_2"]?.readingSessions, 1);
    assert.equal(model.subskills["lengua.skill_1.subskill_1"]?.readingSessions, 1);
    assert.equal(model.subskills["lengua.skill_2.subskill_1"]?.readingSessions, 1);

    console.log("session progress integration validated");
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

await main();
