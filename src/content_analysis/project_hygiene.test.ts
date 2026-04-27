import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("project hygiene", () => {
  test(".gitignore covers .env and .env.* variants", () => {
    const gitignorePath = resolve(process.cwd(), ".gitignore");
    const content = readFileSync(gitignorePath, "utf8");
    const lines = content.split("\n").map((line) => line.trim());

    const hasEnv = lines.some((line) => line === ".env");
    const hasEnvDot = lines.some((line) => line === ".env.*");

    expect(hasEnv, ".gitignore must include '.env'").toBe(true);
    expect(hasEnvDot, ".gitignore must include '.env.*'").toBe(true);
  });
});
