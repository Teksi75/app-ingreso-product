import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

type SkillState = "weak" | "developing" | "mastered";
type SessionMode = "practice" | "reading" | "simulator";

type SkillResultInput = {
  skillId: string;
  attempts: number;
  correct: number;
  state: SkillState;
  masteryLevel: 1 | 2 | 3 | 4;
};

type SessionInput = {
  id: string;
  createdAt: string;
  mode: SessionMode;
  readingUnitId?: string;
  durationSeconds?: number;
  results: SkillResultInput[];
};

const studentCode = "qa_adaptive_weakness";
const progressPath = resolve(process.cwd(), `data/progress_${studentCode}.json`);
const originalProgress = existsSync(progressPath) ? readFileSync(progressPath, "utf8") : null;

test.afterAll(() => {
  if (originalProgress !== null) {
    writeFileSync(progressPath, originalProgress, "utf8");
    return;
  }

  if (existsSync(progressPath)) {
    unlinkSync(progressPath);
  }
});

test("reinforces weak skills before advancing to exam readiness", async ({ page }) => {
  writeProgress([
    session("initial_skill_1", "2026-04-20T09:00:00.000Z", "practice", [
      result("lengua.skill_1", 8, 7, "mastered", 3),
      result("lengua.skill_1.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("initial_skill_2", "2026-04-20T09:20:00.000Z", "practice", [
      result("lengua.skill_2", 8, 7, "mastered", 3),
      result("lengua.skill_2.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("initial_skill_3", "2026-04-20T09:40:00.000Z", "practice", [
      result("lengua.skill_3", 8, 5, "developing", 2),
      result("lengua.skill_3.subskill_1", 8, 5, "developing", 2),
    ]),
    session("initial_skill_4_weak", "2026-04-20T10:00:00.000Z", "practice", [
      result("lengua.skill_4", 8, 1, "weak", 1),
      result("lengua.skill_4.subskill_1", 4, 0, "weak", 1),
      result("lengua.skill_4.subskill_2", 4, 1, "weak", 1),
    ]),
    session("initial_skill_5_weak", "2026-04-20T10:20:00.000Z", "practice", [
      result("lengua.skill_5", 8, 2, "weak", 1),
      result("lengua.skill_5.subskill_1", 8, 2, "weak", 1),
    ]),
    session("initial_recent_reading", "2026-04-20T10:40:00.000Z", "reading", [
      result("lengua.skill_1", 4, 4, "mastered", 4),
      result("lengua.skill_1.subskill_3", 4, 4, "mastered", 4),
    ], "RU-LEN-BIO-001"),
  ]);

  await page.goto(`/dashboard?code=${studentCode}`);

  await expect(page.getByText("Puntos a mejorar")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Debilidades detectadas" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Gramática en contexto" }).getByText("Debil")).toBeVisible();
  await expect(page.getByText("Clases de palabras", { exact: true })).toBeVisible();
  await expect(page.getByText(/Subskill ·/).first()).toBeVisible();
  await expect(page.getByText("Esta habilidad necesita práctica constante").first()).toBeVisible();
  await expect(page.getByText(/accuracy ponderada|mastery 1 con score/)).not.toBeVisible();
  await expect(page.getByText("Listo para simulacion")).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "Practica focalizada: Gramática en contexto" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Reforzar habilidad" })).toHaveAttribute(
    "href",
    /\/practice\?mode=training&skill=gramatica-en-contexto&code=qa_adaptive_weakness/,
  );

  await page.locator('a[href*="skill=gramatica-en-contexto"][href*="code=qa_adaptive_weakness"]').click();
  await expect(page).toHaveURL(/\/practice\?mode=training&skill=gramatica-en-contexto&code=qa_adaptive_weakness/);
  await expect(page.getByText("Habilidad en entrenamiento")).toBeVisible();
  await expect(page.getByText("Gramática en contexto")).toBeVisible();

  writeProgress([
    ...baseConsolidatedSessions(),
    session("reinforce_skill_4_failed", "2026-04-20T11:00:00.000Z", "practice", [
      result("lengua.skill_4", 10, 1, "weak", 1),
      result("lengua.skill_4.subskill_1", 5, 0, "weak", 1),
      result("lengua.skill_4.subskill_2", 5, 1, "weak", 1),
    ]),
    session("reinforce_recent_reading", "2026-04-20T11:10:00.000Z", "reading", [
      result("lengua.skill_1", 4, 4, "mastered", 4),
      result("lengua.skill_1.subskill_3", 4, 4, "mastered", 4),
    ], "RU-LEN-BIO-001"),
  ]);

  await page.goto(`/dashboard?code=${studentCode}`);

  await expect(page.getByRole("heading", { name: "Debilidades detectadas" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Gramática en contexto" }).getByText("Debil")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Practica focalizada: Gramática en contexto" })).toBeVisible();
  await expect(page.getByText("Listo para simulacion")).not.toBeVisible();

  writeProgress([
    ...baseConsolidatedSessions(),
    session("skill_4_recovery_1", "2026-04-20T11:20:00.000Z", "practice", [
      result("lengua.skill_4", 8, 5, "developing", 2),
      result("lengua.skill_4.subskill_1", 4, 3, "developing", 2),
      result("lengua.skill_4.subskill_2", 4, 2, "developing", 2),
    ]),
    session("skill_4_recovery_2", "2026-04-20T11:40:00.000Z", "practice", [
      result("lengua.skill_4", 8, 7, "mastered", 3),
      result("lengua.skill_4.subskill_1", 4, 4, "mastered", 3),
      result("lengua.skill_4.subskill_2", 4, 3, "mastered", 3),
    ]),
    session("skill_5_still_weak", "2026-04-20T12:00:00.000Z", "practice", [
      result("lengua.skill_5", 8, 2, "weak", 1),
      result("lengua.skill_5.subskill_1", 8, 2, "weak", 1),
    ]),
    session("recovery_recent_reading", "2026-04-20T12:10:00.000Z", "reading", [
      result("lengua.skill_1", 4, 4, "mastered", 4),
      result("lengua.skill_1.subskill_3", 4, 4, "mastered", 4),
    ], "RU-LEN-BIO-001"),
  ]);

  await page.goto(`/dashboard?code=${studentCode}`);

  await expect(page.getByRole("article", { name: "Gramática en contexto" }).getByText("Dominada")).toBeVisible();
  await expect(page.getByRole("article", { name: "Uso de verbos" }).getByText("Debil")).toBeVisible();
  await expect(page.getByText("Tiempo y modo verbal", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Practica focalizada: Uso de verbos" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Reforzar habilidad" })).toHaveAttribute(
    "href",
    /\/practice\?mode=training&skill=uso-de-verbos&code=qa_adaptive_weakness/,
  );

  writeProgress([
    session("ready_skill_1", "2026-04-20T13:00:00.000Z", "practice", [
      result("lengua.skill_1", 8, 7, "mastered", 3),
      result("lengua.skill_1.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("ready_skill_2", "2026-04-20T13:10:00.000Z", "reading", [
      result("lengua.skill_2", 8, 7, "mastered", 3),
      result("lengua.skill_2.subskill_1", 8, 7, "mastered", 3),
    ], "RU-LEN-BIO-001"),
    session("ready_skill_3", "2026-04-20T13:20:00.000Z", "practice", [
      result("lengua.skill_3", 8, 7, "mastered", 3),
      result("lengua.skill_3.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("ready_skill_4", "2026-04-20T13:30:00.000Z", "practice", [
      result("lengua.skill_4", 8, 7, "mastered", 3),
      result("lengua.skill_4.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("ready_skill_5", "2026-04-20T13:40:00.000Z", "practice", [
      result("lengua.skill_5", 8, 7, "mastered", 3),
      result("lengua.skill_5.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("ready_skill_6", "2026-04-20T13:50:00.000Z", "practice", [
      result("lengua.skill_6", 8, 7, "mastered", 3),
      result("lengua.skill_6.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("ready_skill_7", "2026-04-20T14:00:00.000Z", "practice", [
      result("lengua.skill_7", 8, 7, "mastered", 3),
      result("lengua.skill_7.subskill_1", 8, 7, "mastered", 3),
    ]),
  ]);

  await page.goto(`/dashboard?code=${studentCode}`);

  await expect(page.getByRole("heading", { name: "Sin debilidades críticas" })).toBeVisible();
  await expect(page.getByText("Debilidades detectadas")).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "Listo para simulacion" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir a simulaciones" })).toHaveAttribute(
    "href",
    `/simulaciones?code=${studentCode}`,
  );

  await page.getByRole("link", { name: "Ir a simulaciones" }).click();
  await expect(page).toHaveURL(`/simulaciones?code=${studentCode}`);
  await expect(page.getByRole("heading", { name: "Simulación" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar simulación" })).toBeVisible();
});

function baseConsolidatedSessions(): SessionInput[] {
  return [
    session("base_skill_1", "2026-04-20T09:00:00.000Z", "practice", [
      result("lengua.skill_1", 8, 7, "mastered", 3),
      result("lengua.skill_1.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("base_skill_2", "2026-04-20T09:20:00.000Z", "practice", [
      result("lengua.skill_2", 8, 7, "mastered", 3),
      result("lengua.skill_2.subskill_1", 8, 7, "mastered", 3),
    ]),
    session("base_skill_3", "2026-04-20T09:40:00.000Z", "practice", [
      result("lengua.skill_3", 8, 5, "developing", 2),
      result("lengua.skill_3.subskill_1", 8, 5, "developing", 2),
    ]),
  ];
}

function session(
  id: string,
  createdAt: string,
  mode: SessionMode,
  results: SkillResultInput[],
  readingUnitId?: string,
): SessionInput {
  return {
    id,
    createdAt,
    mode,
    readingUnitId,
    durationSeconds: results.reduce((sum, item) => sum + item.attempts, 0) * 12,
    results,
  };
}

function result(
  skillId: string,
  attempts: number,
  correct: number,
  state: SkillState,
  masteryLevel: 1 | 2 | 3 | 4,
): SkillResultInput {
  return {
    skillId,
    attempts,
    correct,
    state,
    masteryLevel,
  };
}

function writeProgress(sessions: SessionInput[]): void {
  const storedSessions = sessions.map((item) => {
    const totalAttempts = item.results
      .filter((skillResult) => !skillResult.skillId.includes(".subskill_"))
      .reduce((sum, skillResult) => sum + skillResult.attempts, 0);
    const totalCorrect = item.results
      .filter((skillResult) => !skillResult.skillId.includes(".subskill_"))
      .reduce((sum, skillResult) => sum + skillResult.correct, 0);

    return {
      id: `session_${item.id}`,
      created_at: item.createdAt,
      mode: item.mode,
      area: "lengua",
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      total_errors: totalAttempts - totalCorrect,
      duration_seconds: item.durationSeconds,
      readingUnitId: item.readingUnitId,
      skill_results: item.results.map((skillResult) => ({
        skill_id: skillResult.skillId,
        attempts: skillResult.attempts,
        correct: skillResult.correct,
        state: skillResult.state,
        mastery_level: skillResult.masteryLevel,
      })),
    };
  });
  const skillStats = buildSkillStats(sessions);

  writeFileSync(
    progressPath,
    `${JSON.stringify(
      {
        sessions: storedSessions,
        skill_stats: skillStats,
        seenSkills: Object.keys(skillStats).sort(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function buildSkillStats(sessions: SessionInput[]) {
  const stats: Record<string, {
    total_attempts: number;
    total_correct: number;
    last_state: SkillState;
    mastery_level: number;
  }> = {};

  for (const item of sessions) {
    for (const skillResult of item.results) {
      stats[skillResult.skillId] ??= {
        total_attempts: 0,
        total_correct: 0,
        last_state: skillResult.state,
        mastery_level: skillResult.masteryLevel,
      };
      stats[skillResult.skillId].total_attempts += skillResult.attempts;
      stats[skillResult.skillId].total_correct += skillResult.correct;
      stats[skillResult.skillId].last_state = skillResult.state;
      stats[skillResult.skillId].mastery_level = skillResult.masteryLevel;
    }
  }

  return stats;
}
