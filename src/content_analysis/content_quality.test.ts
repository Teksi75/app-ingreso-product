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
