import { describe, expect, test } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const contentDirs = [
  resolve(process.cwd(), "content/lengua/exercises"),
  resolve(process.cwd(), "content/lengua/reading_units"),
];

const publicTextRegressions = [
  /\bsenor\b/i,
  /\bmaquina\b/i,
  /\bmaquinas\b/i,
  /\bcanerias\b/i,
  /\bsubtitulos\b/i,
  /\boracion\b/i,
  /\bpreterito\b/i,
  /\bdepuracion\b/i,
  /\bCual\b/,
  /\bPor que\b/,
  /\b[Ss]egun\b/,
  /\b\w+ciónes\b/i,
  /\bcuálidad(?:es)?\b/i,
  /\bfunción(?:an|es)\b/i,
  /\\u00[0-9a-f]{2}/i,
];

const knownStudentFacingTypos: Array<{ pattern: RegExp; fix: string }> = [
  { pattern: /varíos/g, fix: "varios" },
  { pattern: /sitúación/g, fix: "situación" },
  { pattern: /sitúaciones/g, fix: "situaciones" },
  { pattern: /opiniónes/g, fix: "opiniones" },
  { pattern: /cuálquier/g, fix: "cualquier" },
  { pattern: /\bestan\b/g, fix: "están" },
];

describe("public Lengua content quality", () => {
  test("content JSON parses and avoids known accent regressions", () => {
    const regressions: string[] = [];

    for (const filePath of listJsonFiles()) {
      const raw = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;

      collectStrings(parsed).forEach(({ value, path }) => {
        if (publicTextRegressions.some((pattern) => pattern.test(value))) {
          regressions.push(`${filePath}:${path}: ${value}`);
        }
      });
    }

    expect(regressions).toEqual([]);
  });

  test("exercises have no duplicate options within the same question", () => {
    const duplicates: string[] = [];

    for (const filePath of listJsonFiles()) {
      const raw = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const exercises = (parsed as { exercises?: unknown[] }).exercises ?? [];

      for (const ex of exercises) {
        const exercise = ex as Record<string, unknown>;
        const options = exercise.options;
        if (!Array.isArray(options)) continue;

        const seen = new Set<string>();
        for (const opt of options) {
          if (typeof opt !== "string") continue;
          if (seen.has(opt)) {
            duplicates.push(`${filePath}:${exercise.id}: duplicate option "${opt}"`);
          }
          seen.add(opt);
        }
      }
    }

    expect(duplicates).toEqual([]);
  });

  test("content has no known student-facing typos", () => {
    const typos: string[] = [];

    for (const filePath of listJsonFiles()) {
      const raw = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;

      collectStrings(parsed).forEach(({ value, path }) => {
        for (const { pattern } of knownStudentFacingTypos) {
          const regex = new RegExp(pattern.source, pattern.flags);
          if (regex.test(value)) {
            typos.push(`${filePath}:${path}: "${value}"`);
          }
        }
      });
    }

    expect(typos).toEqual([]);
  });
});

function listJsonFiles(): string[] {
  return contentDirs.flatMap((dir) => (
    readdirSync(dir)
      .filter((fileName) => fileName.endsWith(".json"))
      .map((fileName) => join(dir, fileName))
  ));
}

function collectStrings(value: unknown, path = "$"): Array<{ path: string; value: string }> {
  if (typeof value === "string") {
    return [{ path, value }];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, `${path}[${index}]`));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => collectStrings(item, `${path}.${key}`));
  }

  return [];
}
