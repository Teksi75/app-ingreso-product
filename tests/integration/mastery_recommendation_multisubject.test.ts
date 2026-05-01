import { describe, expect, it } from "vitest";
import { buildMasteryModel } from "../../src/progress/mastery_model.ts";
import { getNextStepRecommendation } from "../../src/recommendation/next_step.ts";
import { type SessionSkillResult, type StoredProgress } from "../../src/storage/local_progress_store.ts";

function result(skill_id: string, attempts: number, correct: number): SessionSkillResult {
  const accuracy = attempts > 0 ? correct / attempts : 0;
  return {
    skill_id,
    attempts,
    correct,
    state: accuracy >= 0.7 ? "mastered" : accuracy >= 0.45 ? "developing" : "weak",
    mastery_level: accuracy >= 0.8 ? 3 : accuracy >= 0.45 ? 2 : 1,
  };
}

describe("mastery + recommendation multisubject", () => {
  it("tracks mastery summaries separated by subject", () => {
    const progress: StoredProgress = {
      sessions: [
        {
          id: "s1",
          created_at: "2026-05-01T00:00:00.000Z",
          mode: "practice",
          area: "lengua",
          total_attempts: 4,
          total_correct: 3,
          total_errors: 1,
          skill_results: [
            result("lengua.skill_1", 4, 3),
            result("matematica.A1", 4, 1),
          ],
        },
      ],
      seenSkills: ["lengua.skill_1", "matematica.A1"],
      skill_stats: {},
    };

    const model = buildMasteryModel(progress);
    expect(model.subjects.lengua.skills["lengua.skill_1"]).toBeDefined();
    expect(model.subjects.matematica.skills["matematica.A1"]).toBeDefined();
  });

  it("keeps lengua-safe recommendation fallback with mixed-subject history", () => {
    const progress: StoredProgress = {
      sessions: [
        {
          id: "s1",
          created_at: "2026-05-01T00:00:00.000Z",
          mode: "practice",
          area: "lengua",
          total_attempts: 4,
          total_correct: 2,
          total_errors: 2,
          skill_results: [result("lengua.skill_1", 4, 2)],
        },
        {
          id: "s2",
          created_at: "2026-05-01T00:10:00.000Z",
          mode: "practice",
          area: "matematica",
          total_attempts: 4,
          total_correct: 4,
          total_errors: 0,
          skill_results: [result("matematica.A2", 4, 4)],
        },
      ],
      seenSkills: ["lengua.skill_1", "matematica.A2"],
      skill_stats: {},
    };

    const recommendation = getNextStepRecommendation(progress, { subject: "lengua" });
    expect(recommendation.href.startsWith("/practice?")).toBe(true);
    expect(recommendation.href.includes("subject=matematica")).toBe(false);
  });

  it("keeps mathematics recommendation pinned to subject=matematica", () => {
    const progress: StoredProgress = {
      sessions: [],
      seenSkills: [],
      skill_stats: {},
    };

    const recommendation = getNextStepRecommendation(progress, { subject: "matematica" });
    expect(recommendation.href).toBe("/practice?mode=training&subject=matematica");
  });
});
