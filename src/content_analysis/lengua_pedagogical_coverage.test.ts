import { describe, expect, test } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const CANONICAL_SKILLS = [
  "lengua.skill_1",
  "lengua.skill_2",
  "lengua.skill_3",
  "lengua.skill_4",
  "lengua.skill_5",
  "lengua.skill_6",
  "lengua.skill_7",
] as const;

const EXPECTED_SUBSKILLS: Record<string, string[]> = {
  "lengua.skill_1": [
    "lengua.skill_1.subskill_1",
    "lengua.skill_1.subskill_2",
    "lengua.skill_1.subskill_3",
    "lengua.skill_1.subskill_4",
    "lengua.skill_1.subskill_5",
  ],
  "lengua.skill_2": [
    "lengua.skill_2.subskill_1",
    "lengua.skill_2.subskill_2",
    "lengua.skill_2.subskill_3",
    "lengua.skill_2.subskill_4",
    "lengua.skill_2.subskill_5",
  ],
  "lengua.skill_3": [
    "lengua.skill_3.subskill_1",
    "lengua.skill_3.subskill_2",
    "lengua.skill_3.subskill_3",
  ],
  "lengua.skill_4": [
    "lengua.skill_4.subskill_1",
    "lengua.skill_4.subskill_2",
    "lengua.skill_4.subskill_3",
    "lengua.skill_4.subskill_4",
    "lengua.skill_4.subskill_5",
  ],
  "lengua.skill_5": [
    "lengua.skill_5.subskill_1",
    "lengua.skill_5.subskill_2",
    "lengua.skill_5.subskill_3",
  ],
  "lengua.skill_6": [
    "lengua.skill_6.subskill_1",
    "lengua.skill_6.subskill_2",
    "lengua.skill_6.subskill_3",
    "lengua.skill_6.subskill_4",
    "lengua.skill_6.subskill_5",
  ],
  "lengua.skill_7": [
    "lengua.skill_7.subskill_1",
    "lengua.skill_7.subskill_2",
    "lengua.skill_7.subskill_3",
  ],
};

type ContentExercise = {
  id: string;
  skill?: string;
  skill_id?: string;
  subskill?: string;
  difficulty?: number | string;
  type?: string;
  question?: string;
  prompt?: string;
  options?: string[];
  correct_answer?: string;
  correctAnswer?: string;
  correct_answers?: string[];
  correctAnswers?: string[];
  feedback_correct?: string;
  feedbackCorrect?: string;
  feedback_incorrect?: string;
  feedbackIncorrect?: string;
  feedback?: { correct?: string; incorrect?: string };
  parts?: unknown[];
  categorization?: unknown;
  readingUnitId?: string;
  reading_unit_id?: string;
};

const exerciseDir = resolve(process.cwd(), "content/lengua/exercises");
const readingUnitDir = resolve(process.cwd(), "content/lengua/reading_units");

function loadAllExercises(): Array<ContentExercise & { _file: string }> {
  const exercises: Array<ContentExercise & { _file: string }> = [];
  const files = readdirSync(exerciseDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(exerciseDir, file), "utf8")) as {
      exercises?: ContentExercise[];
    };
    for (const ex of raw.exercises ?? []) {
      exercises.push({ ...ex, _file: file });
    }
  }
  return exercises;
}

function loadAllReadingUnits(): Array<Record<string, unknown> & { _file: string }> {
  const units: Array<Record<string, unknown> & { _file: string }> = [];
  const files = readdirSync(readingUnitDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(readingUnitDir, file), "utf8"));
    units.push({ ...raw, _file: file });
  }
  return units;
}

function getSkillId(ex: ContentExercise): string | null {
  return ex.skill ?? ex.skill_id ?? null;
}

function getCorrectAnswer(ex: ContentExercise): string | undefined {
  return ex.correct_answer ?? ex.correctAnswer ?? undefined;
}

function getFeedbackCorrect(ex: ContentExercise): string | undefined {
  return ex.feedback_correct ?? ex.feedbackCorrect ?? ex.feedback?.correct ?? undefined;
}

function getFeedbackIncorrect(ex: ContentExercise): string | undefined {
  return ex.feedback_incorrect ?? ex.feedbackIncorrect ?? ex.feedback?.incorrect ?? undefined;
}

describe("Lengua pedagogical coverage contract", () => {
  const exercises = loadAllExercises();
  const readingUnits = loadAllReadingUnits();

  test("all 7 canonical skills have at least one exercise", () => {
    const skillsWithExercises = new Set(exercises.map((ex) => getSkillId(ex)).filter(Boolean));

    for (const skill of CANONICAL_SKILLS) {
      expect(
        skillsWithExercises.has(skill),
        `Skill ${skill} has no exercises in content/lengua/exercises/`,
      ).toBe(true);
    }
  });

  test("all canonical subskills have coverage or are marked as integrative", () => {
    const subskillsWithExercises = new Set<string>();
    for (const ex of exercises) {
      if (ex.subskill) subskillsWithExercises.add(ex.subskill);
    }

    const integrativeSubskills = new Set([
      "lengua.skill_1.subskill_4",
      "lengua.skill_1.subskill_5",
      "lengua.skill_2.subskill_2",
      "lengua.skill_4.subskill_2",
      "lengua.skill_6.subskill_2",
      "lengua.skill_6.subskill_3",
      "lengua.skill_6.subskill_4",
      "lengua.skill_7.subskill_2",
    ]);

    for (const [skill, subskills] of Object.entries(EXPECTED_SUBSKILLS)) {
      for (const sub of subskills) {
        if (integrativeSubskills.has(sub)) continue;
        expect(
          subskillsWithExercises.has(sub),
          `Subskill ${sub} (from ${skill}) has no exercises and is not marked integrative`,
        ).toBe(true);
      }
    }
  });

  test("every exercise has required fields", () => {
    const issues: string[] = [];

    for (const ex of exercises) {
      const skillId = getSkillId(ex);
      if (!skillId) issues.push(`${ex._file}:${ex.id} missing skill_id`);
      if (!ex.subskill) issues.push(`${ex._file}:${ex.id} missing subskill`);
      if (ex.difficulty === undefined) issues.push(`${ex._file}:${ex.id} missing difficulty`);
      if (!ex.type) issues.push(`${ex._file}:${ex.id} missing type`);

      const isMultipart = ex.type === "multipart_choice" || ex.type === "categorization";
      const isMultiSelect = ex.type === "multiple_choice_multiple";
      if (!isMultipart) {
        if (!ex.options || ex.options.length < 2) {
          issues.push(`${ex._file}:${ex.id} has fewer than 2 options`);
        }
        const answer = getCorrectAnswer(ex);
        const hasMultiAnswers = Boolean(ex.correct_answers || ex.correctAnswers);
        if (!answer && !hasMultiAnswers) {
          issues.push(`${ex._file}:${ex.id} missing correct_answer`);
        }
      }

      const fbCorrect = getFeedbackCorrect(ex);
      const fbIncorrect = getFeedbackIncorrect(ex);
      if (!fbCorrect) issues.push(`${ex._file}:${ex.id} missing feedback_correct`);
      if (!fbIncorrect) issues.push(`${ex._file}:${ex.id} missing feedback_incorrect`);
    }

    expect(issues).toEqual([]);
  });

  test("every exercise has valid skill_id matching canonical pattern", () => {
    const invalid: string[] = [];
    for (const ex of exercises) {
      const skillId = getSkillId(ex);
      if (skillId && !/^lengua\.skill_[1-7]$/.test(skillId)) {
        invalid.push(`${ex._file}:${ex.id} has non-canonical skill_id: ${skillId}`);
      }
    }
    expect(invalid).toEqual([]);
  });

  test("every exercise subskill matches its parent skill", () => {
    const mismatches: string[] = [];
    for (const ex of exercises) {
      const skillId = getSkillId(ex);
      if (skillId && ex.subskill) {
        const parentFromSubskill = ex.subskill.replace(/\.subskill_\d+$/, "");
        if (parentFromSubskill !== skillId) {
          mismatches.push(
            `${ex._file}:${ex.id} skill=${skillId} but subskill=${ex.subskill} (parent would be ${parentFromSubskill})`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  test("reading units have text, title, and associated exercises", () => {
    const issues: string[] = [];
    for (const ru of readingUnits) {
      if (!ru.id) issues.push(`${ru._file} missing id`);
      if (!ru.title) issues.push(`${ru._file} missing title`);
      if (!ru.text || (typeof ru.text === "string" && ru.text.length < 200)) {
        issues.push(`${ru._file} text too short or missing`);
      }
    }
    expect(issues).toEqual([]);
  });

  test("reading units cover multiple skill families through their exercises", () => {
    const skillsByUnit = new Map<string, Set<string>>();

    for (const ru of readingUnits) {
      const unitId = ru.id as string;
      skillsByUnit.set(unitId, new Set());
    }

    for (const ex of exercises) {
      const ruId = ex.readingUnitId ?? ex.reading_unit_id;
      if (ruId && skillsByUnit.has(ruId)) {
        const skillId = getSkillId(ex);
        if (skillId) skillsByUnit.get(ruId)!.add(skillId);
      }
    }

    const multiSkillUnits = [...skillsByUnit.entries()].filter(([, skills]) => skills.size >= 2);
    expect(
      multiSkillUnits.length,
      "At least 3 reading units should cover 2+ skill families",
    ).toBeGreaterThanOrEqual(3);
  });

  test("simulator-compatible exercises exist for all 7 skills", () => {
    const mcExercises = exercises.filter((ex) => ex.type === "multiple_choice");
    const skillsWithMC = new Set(mcExercises.map((ex) => getSkillId(ex)).filter(Boolean));

    for (const skill of CANONICAL_SKILLS) {
      const count = mcExercises.filter((ex) => getSkillId(ex) === skill).length;
      expect(count, `Skill ${skill} needs >= 1 multiple_choice exercises for simulator`).toBeGreaterThanOrEqual(1);
    }
  });

  test("no exercise exposes technical IDs in student-facing text", () => {
    const technicalPatterns = [/lengua\.skill_\d/, /subskill_\d/, /RU-LEN-/];
    const violations: string[] = [];

    for (const ex of exercises) {
      const fields = [ex.question, ex.prompt, ex.feedback_correct, ex.feedbackCorrect, ex.feedback_incorrect, ex.feedbackIncorrect].filter(Boolean);
      for (const field of fields) {
        for (const pattern of technicalPatterns) {
          if (pattern.test(field!)) {
            violations.push(`${ex._file}:${ex.id} exposes technical ID in "${field!.substring(0, 60)}..."`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
