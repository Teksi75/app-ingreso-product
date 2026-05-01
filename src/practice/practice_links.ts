import { canonicalIdToSlug, readingUnitIdToSlug, slugToCanonicalId } from "../skills/skill_slugs";

type PracticeLinkContext = { mode: "training" | "reading"; readingUnitId?: string };

export function resolvePracticeSkillId(rawSkill: string | undefined): string | null {
  if (!rawSkill) {
    return null;
  }

  const canonical = slugToCanonicalId(rawSkill);
  if (canonical) {
    return canonical;
  }

  if (/^matematica\.A\d+$/i.test(rawSkill)) {
    return rawSkill.replace(/^matematica\.a/i, "matematica.A");
  }

  const mathSlug = rawSkill.match(/^matematica-a(\d+)$/i);
  if (mathSlug) {
    return `matematica.A${mathSlug[1]}`;
  }

  return null;
}

export function buildPracticeHref(
  skillId: string,
  focus: string,
  usedExerciseIds: string[],
  context: PracticeLinkContext,
): string {
  const params = new URLSearchParams({
    skill: canonicalIdToSlug(skillId),
    focus,
    mode: context.mode,
  });

  if (context.mode === "reading" && context.readingUnitId) {
    params.set("unit", readingUnitIdToSlug(context.readingUnitId));
  }

  if (skillId.startsWith("matematica.") || focus.startsWith("matematica.")) {
    params.set("subject", "matematica");
  }

  if (usedExerciseIds.length > 0) {
    params.set("used", Array.from(new Set(usedExerciseIds)).join(","));
  }

  return `/practice?${params.toString()}`;
}
