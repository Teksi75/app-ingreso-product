import { describe, expect, it } from "vitest";
import { buildPracticeHref, resolvePracticeSkillId } from "../../src/practice/practice_links";

describe("practice links", () => {
  it("preserves subject=matematica for follow-up and recommendation links", () => {
    const repeat = buildPracticeHref("matematica.A7", "matematica.A7.simela", ["a", "b"], { mode: "training" });
    const recommendation = buildPracticeHref("matematica.A3", "matematica.A3.fracciones", [], { mode: "training" });

    expect(repeat).toContain("subject=matematica");
    expect(recommendation).toContain("subject=matematica");
  });

  it("keeps Lengua links unchanged without explicit subject parameter", () => {
    const href = buildPracticeHref("lengua.skill_1", "lengua.skill_1.subskill_1", ["x1"], { mode: "training" });
    expect(href).not.toContain("subject=matematica");
    expect(href).toContain("skill=comprension-global-del-texto");
  });

  it("resolves math skill IDs and slugs used by post-session links", () => {
    expect(resolvePracticeSkillId("matematica.A7")).toBe("matematica.A7");
    expect(resolvePracticeSkillId("matematica-a7")).toBe("matematica.A7");
  });
});
