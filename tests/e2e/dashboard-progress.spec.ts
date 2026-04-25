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
    name: "Comprensión global del texto",
  });

  await expect(skillRow.getByText("Prácticas")).toBeVisible();
  await expect(skillRow.getByText("2", { exact: true })).toBeVisible();
  await expect(skillRow.getByText("Respuestas")).toBeVisible();
  await expect(skillRow.getByText("20", { exact: true })).toBeVisible();
  await expect(skillRow.getByText("55%")).toBeVisible();
  await expect(page.getByText("Siguiente paso sugerido")).toBeVisible();
  await expect(page.getByRole("link", { name: "Iniciar lectura con actividades" })).toHaveAttribute(
    "href",
    /\/practice\?mode=reading&unit=/,
  );
});

test("dashboard recommends continuing a recent reading unit when accuracy is low", async ({ page }) => {
  writeFileSync(
    progressPath,
    `${JSON.stringify(
      {
        sessions: [
          {
            mode: "reading",
            total_attempts: 10,
            total_correct: 5,
            total_errors: 5,
            readingUnitId: "RU-LEN-BIO-001",
            skill_results: [
              {
                skill_id: "lengua.skill_1",
                attempts: 10,
                correct: 5,
                state: "developing",
                mastery_level: 2,
              },
              {
                skill_id: "lengua.skill_1.subskill_1",
                attempts: 10,
                correct: 5,
                state: "developing",
                mastery_level: 2,
              },
            ],
            id: "session_test_reading_1",
            created_at: "2026-04-17T01:00:00.000Z",
          },
        ],
        skill_stats: {
          "lengua.skill_1": {
            total_attempts: 10,
            total_correct: 5,
            last_state: "developing",
            mastery_level: 2,
          },
          "lengua.skill_1.subskill_1": {
            total_attempts: 10,
            total_correct: 5,
            last_state: "developing",
            mastery_level: 2,
          },
        },
        seenSkills: ["lengua.skill_1", "lengua.skill_1.subskill_1"],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: /Continuar lectura: Violeta Parra/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continuar lectura guiada" })).toHaveAttribute(
    "href",
    "/practice?mode=reading&unit=violeta-parra",
  );
});

test("dashboard recommends simulator when mastery is sufficiently consolidated", async ({ page }) => {
  writeFileSync(
    progressPath,
    `${JSON.stringify(
      {
        sessions: [
          {
            mode: "practice",
            total_attempts: 8,
            total_correct: 7,
            total_errors: 1,
            skill_results: [
              { skill_id: "lengua.skill_1", attempts: 8, correct: 7, state: "mastered", mastery_level: 3 },
            ],
            id: "session_ready_1",
            created_at: "2026-04-17T00:00:00.000Z",
          },
          {
            mode: "reading",
            total_attempts: 8,
            total_correct: 7,
            total_errors: 1,
            readingUnitId: "RU-LEN-BIO-001",
            skill_results: [
              { skill_id: "lengua.skill_2", attempts: 8, correct: 7, state: "mastered", mastery_level: 3 },
            ],
            id: "session_ready_2",
            created_at: "2026-04-17T00:10:00.000Z",
          },
          {
            mode: "practice",
            total_attempts: 8,
            total_correct: 6,
            total_errors: 2,
            skill_results: [
              { skill_id: "lengua.skill_3", attempts: 8, correct: 6, state: "developing", mastery_level: 2 },
            ],
            id: "session_ready_3",
            created_at: "2026-04-17T00:20:00.000Z",
          },
          {
            mode: "practice",
            total_attempts: 8,
            total_correct: 6,
            total_errors: 2,
            skill_results: [
              { skill_id: "lengua.skill_4", attempts: 8, correct: 6, state: "developing", mastery_level: 2 },
            ],
            id: "session_ready_4",
            created_at: "2026-04-17T00:30:00.000Z",
          },
        ],
        skill_stats: {
          "lengua.skill_1": { total_attempts: 8, total_correct: 7, last_state: "mastered", mastery_level: 3 },
          "lengua.skill_2": { total_attempts: 8, total_correct: 7, last_state: "mastered", mastery_level: 3 },
          "lengua.skill_3": { total_attempts: 8, total_correct: 6, last_state: "developing", mastery_level: 2 },
          "lengua.skill_4": { total_attempts: 8, total_correct: 6, last_state: "developing", mastery_level: 2 },
        },
        seenSkills: ["lengua.skill_1", "lengua.skill_2", "lengua.skill_3", "lengua.skill_4"],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Listo para simulacion" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir a simulaciones" })).toHaveAttribute("href", "/simulaciones");
});
