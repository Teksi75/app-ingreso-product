import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const progressPath = resolve(process.cwd(), "data/progress.json");
const originalProgress = existsSync(progressPath) ? readFileSync(progressPath, "utf8") : null;

test.afterAll(() => {
  if (originalProgress !== null) {
    writeFileSync(progressPath, originalProgress, "utf8");
  }
});

test("dashboard separates practice count from answered questions", async ({ page }) => {
  writeFileSync(
    progressPath,
    `${JSON.stringify(
      {
        sessions: [
          {
            mode: "practice",
            total_attempts: 10,
            total_correct: 7,
            total_errors: 3,
            skill_results: [
              {
                skill_id: "lengua.skill_1",
                attempts: 10,
                correct: 7,
                state: "developing",
                mastery_level: 2,
              },
              {
                skill_id: "lengua.skill_1.subskill_1",
                attempts: 10,
                correct: 7,
                state: "developing",
                mastery_level: 2,
              },
            ],
            id: "session_test_1",
            created_at: "2026-04-17T00:00:00.000Z",
          },
          {
            mode: "practice",
            total_attempts: 10,
            total_correct: 4,
            total_errors: 6,
            skill_results: [
              {
                skill_id: "lengua.skill_1",
                attempts: 10,
                correct: 4,
                state: "weak",
                mastery_level: 1,
              },
              {
                skill_id: "lengua.skill_1.subskill_2",
                attempts: 10,
                correct: 4,
                state: "weak",
                mastery_level: 1,
              },
            ],
            id: "session_test_2",
            created_at: "2026-04-17T00:10:00.000Z",
          },
        ],
        skill_stats: {},
        seenSkills: [],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  await page.goto("/dashboard");

  const skillRow = page.getByRole("article", {
    name: "Comprensión e inferencia textual",
  });

  await expect(skillRow.getByText("Prácticas")).toBeVisible();
  await expect(skillRow.getByText("2", { exact: true })).toBeVisible();
  await expect(skillRow.getByText("Respuestas")).toBeVisible();
  await expect(skillRow.getByText("20", { exact: true })).toBeVisible();
  await expect(skillRow.getByText("55%")).toBeVisible();
});
