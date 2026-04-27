import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

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
  results: SkillResultInput[];
};

const studentCode = "qa_gradual_pedagogy";
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

test("validates gradual pedagogical strengthening across multiple practice rounds", async ({ page }) => {
  test.setTimeout(120_000);

  await verifyStage(page, {
    name: "diagnóstico inicial con dos debilidades",
    sessions: [
      ...stableBaseSessions("initial"),
      practiceSession("initial_skill_4_weak", "2026-04-25T09:40:00.000Z", [
        result("lengua.skill_4", 10, 1, "weak", 1),
        result("lengua.skill_4.subskill_1", 5, 0, "weak", 1),
        result("lengua.skill_4.subskill_2", 5, 1, "weak", 1),
      ]),
      practiceSession("initial_skill_5_weak", "2026-04-25T09:50:00.000Z", [
        result("lengua.skill_5", 10, 3, "weak", 1),
        result("lengua.skill_5.subskill_1", 10, 3, "weak", 1),
      ]),
    ],
    heading: "Debilidades detectadas",
    recommendedHeading: "Practica focalizada: Gramática en contexto",
    cta: "Reforzar habilidad",
    targetSkillArticle: "Gramática en contexto",
    targetState: "Debil",
    visibleText: "Esta habilidad necesita práctica constante",
    hiddenPattern: /accuracy ponderada|mastery \d+ con score/,
  });

  await page.locator(`a[href*="skill=gramatica-en-contexto"][href*="code=${studentCode}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/practice\\?mode=training&skill=gramatica-en-contexto&code=${studentCode}`));
  await expect(page.getByText("Habilidad en entrenamiento")).toBeVisible();
  await expect(page.getByText("Gramática en contexto")).toBeVisible();
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();

  await verifyStage(page, {
    name: "primera ronda fallida mantiene refuerzo",
    sessions: [
      ...stableBaseSessions("failed"),
      practiceSession("skill_4_round_1_low", "2026-04-25T10:00:00.000Z", [
        result("lengua.skill_4", 10, 2, "weak", 1),
        result("lengua.skill_4.subskill_1", 5, 1, "weak", 1),
        result("lengua.skill_4.subskill_2", 5, 1, "weak", 1),
      ]),
      practiceSession("skill_5_waiting", "2026-04-25T10:10:00.000Z", [
        result("lengua.skill_5", 10, 3, "weak", 1),
        result("lengua.skill_5.subskill_1", 10, 3, "weak", 1),
      ]),
    ],
    heading: "Debilidades detectadas",
    recommendedHeading: "Practica focalizada: Gramática en contexto",
    cta: "Reforzar habilidad",
    targetSkillArticle: "Gramática en contexto",
    targetState: "Debil",
    visibleText: "Vas por buen camino",
  });

  await verifyStage(page, {
    name: "segunda ronda pasa a desarrollo pero sigue sin simulador",
    sessions: [
      ...stableBaseSessions("developing"),
      practiceSession("skill_4_round_1_low", "2026-04-25T10:00:00.000Z", [
        result("lengua.skill_4", 10, 2, "weak", 1),
        result("lengua.skill_4.subskill_1", 5, 1, "weak", 1),
        result("lengua.skill_4.subskill_2", 5, 1, "weak", 1),
      ]),
      practiceSession("skill_4_round_2_mid", "2026-04-25T10:20:00.000Z", [
        result("lengua.skill_4", 10, 7, "developing", 2),
        result("lengua.skill_4.subskill_1", 5, 4, "developing", 2),
        result("lengua.skill_4.subskill_2", 5, 3, "developing", 2),
      ]),
      practiceSession("skill_5_waiting_2", "2026-04-25T10:30:00.000Z", [
        result("lengua.skill_5", 10, 3, "weak", 1),
        result("lengua.skill_5.subskill_1", 10, 3, "weak", 1),
      ]),
    ],
    heading: "Debilidades detectadas",
    recommendedHeading: "Practica focalizada: Uso de verbos",
    cta: "Reforzar habilidad",
    targetSkillArticle: "Gramática en contexto",
    targetState: "En desarrollo",
    visibleText: "Uso de verbos",
    absentText: "Listo para simulacion",
  });

  await verifyStage(page, {
    name: "tercera ronda consolida skill_4 y rota a skill_5",
    sessions: [
      ...stableBaseSessions("mastered"),
      practiceSession("skill_4_round_2_mid", "2026-04-25T10:20:00.000Z", [
        result("lengua.skill_4", 10, 7, "developing", 2),
        result("lengua.skill_4.subskill_1", 5, 4, "developing", 2),
        result("lengua.skill_4.subskill_2", 5, 3, "developing", 2),
      ]),
      practiceSession("skill_4_round_3_high", "2026-04-25T10:40:00.000Z", [
        result("lengua.skill_4", 10, 9, "mastered", 3),
        result("lengua.skill_4.subskill_1", 5, 5, "mastered", 3),
        result("lengua.skill_4.subskill_2", 5, 4, "mastered", 3),
      ]),
      practiceSession("skill_5_waiting_3", "2026-04-25T10:50:00.000Z", [
        result("lengua.skill_5", 10, 3, "weak", 1),
        result("lengua.skill_5.subskill_1", 10, 3, "weak", 1),
      ]),
    ],
    heading: "Debilidades detectadas",
    recommendedHeading: "Practica focalizada: Uso de verbos",
    cta: "Reforzar habilidad",
    targetSkillArticle: "Gramática en contexto",
    targetState: "Dominada",
    visibleText: "Tiempo y modo verbal",
  });

  await verifyStage(page, {
    name: "skill_5 mejora gradualmente a desarrollo",
    sessions: [
      ...readyBaseSessions("skill5_developing"),
      practiceSession("skill_5_round_1_mid", "2026-04-25T11:00:00.000Z", [
        result("lengua.skill_5", 10, 6, "developing", 2),
        result("lengua.skill_5.subskill_1", 10, 6, "developing", 2),
      ]),
    ],
    heading: "Habilidades en desarrollo",
    recommendedHeading: /Empezar lectura:|Practica focalizada:|Listo para simulacion/,
    targetSkillArticle: "Uso de verbos",
    targetState: "En desarrollo",
    visibleText: "Ya tenés una base sólida",
    absentText: "Debilidades detectadas",
  });

  await verifyStage(page, {
    name: "dominio transversal desbloquea simulador",
    sessions: [
      ...readyBaseSessions("final"),
      practiceSession("skill_5_round_1_mid", "2026-04-25T11:00:00.000Z", [
        result("lengua.skill_5", 10, 6, "developing", 2),
        result("lengua.skill_5.subskill_1", 10, 6, "developing", 2),
      ]),
      practiceSession("skill_5_round_2_high", "2026-04-25T11:20:00.000Z", [
        result("lengua.skill_5", 10, 9, "mastered", 3),
        result("lengua.skill_5.subskill_1", 10, 9, "mastered", 3),
      ]),
    ],
    heading: "Sin debilidades críticas",
    recommendedHeading: "Listo para simulacion",
    cta: "Ir a simulaciones",
    targetSkillArticle: "Uso de verbos",
    targetState: "Dominada",
    visibleText: "No aparecen puntos débiles",
  });

  await page.getByRole("link", { name: "Ir a simulaciones" }).click();
  await expect(page).toHaveURL(`/simulaciones?code=${studentCode}`);
  await expect(page.getByText("Sesión completa")).toBeVisible();
  await expect(page.getByText("preguntas", { exact: true })).toBeVisible();
  await expect(page.getByText("minutos", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Empezar simulación" })).toBeVisible();
});

async function verifyStage(
  page: Page,
  stage: {
    name: string;
    sessions: SessionInput[];
    heading: string;
    recommendedHeading: string | RegExp;
    cta?: string;
    targetSkillArticle: string;
    targetState: string;
    visibleText: string;
    hiddenPattern?: RegExp;
    absentText?: string;
  },
): Promise<void> {
  await test.step(stage.name, async () => {
    writeProgress(stage.sessions);
    await page.goto(`/dashboard?code=${studentCode}`);

    await expect(page.getByRole("heading", { name: stage.heading })).toBeVisible();
    await expect(page.getByRole("heading", { name: stage.recommendedHeading })).toBeVisible();
    await expect(page.getByRole("article", { name: stage.targetSkillArticle }).getByText(stage.targetState)).toBeVisible();
    await expect(page.getByText(stage.visibleText).first()).toBeVisible();

    if (stage.cta) {
      await expect(page.getByRole("link", { name: stage.cta }).first()).toBeVisible();
    }

    if (stage.hiddenPattern) {
      await expect(page.getByText(stage.hiddenPattern)).not.toBeVisible();
    }

    if (stage.absentText) {
      await expect(page.getByText(stage.absentText)).not.toBeVisible();
    }
  });
}

function stableBaseSessions(prefix: string): SessionInput[] {
  return [
    practiceSession(`${prefix}_skill_1_mastered`, "2026-04-25T09:00:00.000Z", [
      result("lengua.skill_1", 10, 9, "mastered", 3),
      result("lengua.skill_1.subskill_1", 10, 9, "mastered", 3),
    ]),
    readingSession(`${prefix}_skill_2_mastered`, "2026-04-25T09:10:00.000Z", "RU-LEN-BIO-001", [
      result("lengua.skill_2", 10, 9, "mastered", 3),
      result("lengua.skill_2.subskill_1", 10, 9, "mastered", 3),
    ]),
    practiceSession(`${prefix}_skill_3_mastered`, "2026-04-25T09:20:00.000Z", [
      result("lengua.skill_3", 10, 8, "mastered", 3),
      result("lengua.skill_3.subskill_1", 10, 8, "mastered", 3),
    ]),
  ];
}

function readyBaseSessions(prefix: string): SessionInput[] {
  return [
    ...stableBaseSessions(prefix),
    practiceSession(`${prefix}_skill_4_mastered`, "2026-04-25T10:40:00.000Z", [
      result("lengua.skill_4", 10, 9, "mastered", 3),
      result("lengua.skill_4.subskill_1", 10, 9, "mastered", 3),
    ]),
    practiceSession(`${prefix}_skill_6_mastered`, "2026-04-25T10:45:00.000Z", [
      result("lengua.skill_6", 10, 9, "mastered", 3),
      result("lengua.skill_6.subskill_1", 10, 9, "mastered", 3),
    ]),
    practiceSession(`${prefix}_skill_7_mastered`, "2026-04-25T10:50:00.000Z", [
      result("lengua.skill_7", 10, 9, "mastered", 3),
      result("lengua.skill_7.subskill_1", 10, 9, "mastered", 3),
    ]),
  ];
}

function practiceSession(id: string, createdAt: string, results: SkillResultInput[]): SessionInput {
  return { id, createdAt, mode: "practice", results };
}

function readingSession(
  id: string,
  createdAt: string,
  readingUnitId: string,
  results: SkillResultInput[],
): SessionInput {
  return { id, createdAt, mode: "reading", readingUnitId, results };
}

function result(
  skillId: string,
  attempts: number,
  correct: number,
  state: SkillState,
  masteryLevel: 1 | 2 | 3 | 4,
): SkillResultInput {
  return { skillId, attempts, correct, state, masteryLevel };
}

function writeProgress(sessions: SessionInput[]): void {
  const storedSessions = sessions.map((session) => {
    const parentResults = session.results.filter((skillResult) => !skillResult.skillId.includes(".subskill_"));
    const totalAttempts = parentResults.reduce((sum, skillResult) => sum + skillResult.attempts, 0);
    const totalCorrect = parentResults.reduce((sum, skillResult) => sum + skillResult.correct, 0);

    return {
      id: `session_${session.id}`,
      created_at: session.createdAt,
      mode: session.mode,
      area: "lengua",
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      total_errors: totalAttempts - totalCorrect,
      duration_seconds: totalAttempts * 15,
      readingUnitId: session.readingUnitId,
      skill_results: session.results.map((skillResult) => ({
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

  for (const session of sessions) {
    for (const skillResult of session.results) {
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
