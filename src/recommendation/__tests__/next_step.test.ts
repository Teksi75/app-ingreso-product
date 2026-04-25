import { describe, expect, it } from "vitest";
import { getNextStepRecommendation } from "../next_step";
import { type SessionMode, type SessionSkillResult, type StoredProgress } from "../../storage/local_progress_store";

const BASE_DATE = Date.parse("2026-04-25T12:00:00.000Z");

function progressWithSessions(
  sessions: Array<{
    mode: SessionMode;
    skillResults: SessionSkillResult[];
    readingUnitId?: string;
  }>,
): StoredProgress {
  return {
    sessions: sessions.map((session, index) => {
      const totalAttempts = session.skillResults
        .filter((result) => /^lengua\.skill_\d+$/.test(result.skill_id))
        .reduce((sum, result) => sum + result.attempts, 0);
      const totalCorrect = session.skillResults
        .filter((result) => /^lengua\.skill_\d+$/.test(result.skill_id))
        .reduce((sum, result) => sum + result.correct, 0);

      return {
        id: `session-${index + 1}`,
        created_at: new Date(BASE_DATE + index * 60_000).toISOString(),
        mode: session.mode,
        area: "lengua",
        total_attempts: totalAttempts,
        total_correct: totalCorrect,
        total_errors: Math.max(0, totalAttempts - totalCorrect),
        skill_results: session.skillResults,
        readingUnitId: session.readingUnitId,
      };
    }),
    seenSkills: [],
    skill_stats: {},
  };
}

function skillResult(skillId: string, attempts: number, correct: number, masteryLevel = 3): SessionSkillResult {
  const accuracy = attempts > 0 ? correct / attempts : 0;

  return {
    skill_id: skillId,
    attempts,
    correct,
    state: accuracy >= 0.7 ? "mastered" : accuracy >= 0.45 ? "developing" : "weak",
    mastery_level: masteryLevel,
  };
}

describe("getNextStepRecommendation", () => {
  it("falls back to a reading unit with no history", () => {
    const recommendation = getNextStepRecommendation({
      sessions: [],
      seenSkills: [],
      skill_stats: {},
    });

    expect(recommendation.kind).toBe("start-reading-unit");
    expect(recommendation.href).toContain("/practice?mode=reading");
  });

  it("recommends simulator when enough skills are consolidated", () => {
    const progress = progressWithSessions([
      { mode: "practice", skillResults: [skillResult("lengua.skill_1", 4, 4, 3)] },
      { mode: "practice", skillResults: [skillResult("lengua.skill_2", 4, 4, 3)] },
      { mode: "practice", skillResults: [skillResult("lengua.skill_3", 4, 4, 3)] },
      { mode: "practice", skillResults: [skillResult("lengua.skill_4", 4, 4, 3)] },
    ]);

    expect(getNextStepRecommendation(progress).kind).toBe("simulator-ready");
  });

  it("continues the latest reading unit when reading accuracy is low", () => {
    const progress = progressWithSessions([
      {
        mode: "reading",
        readingUnitId: "RU-LEN-BIO-001",
        skillResults: [skillResult("lengua.skill_1", 10, 6, 2)],
      },
    ]);

    const recommendation = getNextStepRecommendation(progress);

    expect(recommendation.kind).toBe("continue-reading-unit");
    expect(recommendation.readingUnitId).toBe("RU-LEN-BIO-001");
  });

  it("reviews a weak skill after a simulator session", () => {
    const progress = progressWithSessions([
      { mode: "practice", skillResults: [skillResult("lengua.skill_2", 4, 4, 3)] },
      {
        mode: "simulator",
        skillResults: [
          skillResult("lengua.skill_1", 4, 1, 1),
          skillResult("lengua.skill_2", 4, 4, 3),
        ],
      },
    ]);

    const recommendation = getNextStepRecommendation(progress);

    expect(recommendation.kind).toBe("review-weak-skill");
    expect(recommendation.skillId).toBe("lengua.skill_1");
  });

  it("recommends targeted practice when a weak skill is the best next step", () => {
    const progress = progressWithSessions([
      {
        mode: "reading",
        readingUnitId: "RU-LEN-BIO-001",
        skillResults: [
          skillResult("lengua.skill_1", 20, 20, 4),
          skillResult("lengua.skill_5", 4, 1, 1),
        ],
      },
    ]);

    const recommendation = getNextStepRecommendation(progress);

    expect(recommendation.kind).toBe("targeted-practice");
    expect(recommendation.skillId).toBe("lengua.skill_5");
  });

  it("starts an unread reading unit after practice", () => {
    const progress = progressWithSessions([
      { mode: "practice", skillResults: [skillResult("lengua.skill_1", 3, 2, 2)] },
    ]);

    expect(getNextStepRecommendation(progress).kind).toBe("start-reading-unit");
  });
});
