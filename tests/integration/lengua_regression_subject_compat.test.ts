import { describe, expect, it } from "vitest";
import { startPracticeSession } from "../../src/practice/session_runner.ts";
import { buildMasteryModel } from "../../src/progress/mastery_model.ts";
import { getNextStepRecommendation } from "../../src/recommendation/next_step.ts";
import {
  DEFAULT_SUBJECT_ID,
  getSubjectDefinition,
  resolveSubjectId,
} from "../../src/subjects/subject_registry.ts";

describe("lengua regression / subject compatibility", () => {
  it("keeps lengua as default subject for navigation and selection", () => {
    expect(DEFAULT_SUBJECT_ID).toBe("lengua");
    expect(resolveSubjectId(undefined)).toBe("lengua");
    expect(resolveSubjectId("matematica")).toBe("matematica");
    expect(resolveSubjectId("unknown-subject")).toBe("lengua");

    const lengua = getSubjectDefinition("lengua");
    expect(lengua.id).toBe("lengua");
    expect(lengua.defaultPracticeHref).toBe("/practice?mode=training");

    const session = startPracticeSession(null, [], { forceNewStudent: true, persistSeenSkills: false });
    expect(session.exercise.skill_id.startsWith("lengua.skill_")).toBe(true);
    expect(session.mode).toBe("training");
  });

  it("keeps lengua progress and recommendation behavior stable", () => {
    const progress = {
      sessions: [],
      seenSkills: [],
      skill_stats: {},
    };

    const model = buildMasteryModel(progress);
    expect(Object.keys(model.skills)).toHaveLength(0);
    expect(model.simulatorReadiness.ready).toBe(false);

    const recommendation = getNextStepRecommendation(progress);
    expect(recommendation.kind).toBe("start-reading-unit");
    expect(recommendation.href.startsWith("/practice?")).toBe(true);
  });
});
