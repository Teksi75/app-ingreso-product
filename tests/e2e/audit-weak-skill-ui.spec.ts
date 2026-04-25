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

const studentCode = "qa_adaptive_weakness_audit";
const progressPath = resolve(process.cwd(), `data/progress_${studentCode}.json`);
const screenshotDir = resolve(process.cwd(), ".screenshots/audit");
const originalProgress = existsSync(progressPath) ? readFileSync(progressPath, "utf8") : null;

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    const { mkdirSync } = require("node:fs");
    mkdirSync(dir, { recursive: true });
  }
}

test.afterAll(() => {
  if (originalProgress !== null) {
    writeFileSync(progressPath, originalProgress, "utf8");
    return;
  }
  if (existsSync(progressPath)) {
    unlinkSync(progressPath);
  }
});

test.describe("audit visual de flujo de debilidades", () => {
  test("captura estados del dashboard con debilidades", async ({ page }) => {
    test.setTimeout(90_000);
    ensureDir(screenshotDir);

    // Estado 1: Mixto con debilidades (skill_4 y skill_5 weak)
    writeProgress([
      session("base_s1", "2026-04-20T09:00:00.000Z", "practice", [
        result("lengua.skill_1", 8, 7, "mastered", 3),
        result("lengua.skill_1.subskill_1", 8, 7, "mastered", 3),
      ]),
      session("base_s2", "2026-04-20T09:20:00.000Z", "practice", [
        result("lengua.skill_2", 8, 7, "mastered", 3),
        result("lengua.skill_2.subskill_1", 8, 7, "mastered", 3),
      ]),
      session("base_s3", "2026-04-20T09:40:00.000Z", "practice", [
        result("lengua.skill_3", 8, 5, "developing", 2),
        result("lengua.skill_3.subskill_1", 8, 5, "developing", 2),
      ]),
      session("weak_s4", "2026-04-20T10:00:00.000Z", "practice", [
        result("lengua.skill_4", 8, 1, "weak", 1),
        result("lengua.skill_4.subskill_1", 4, 0, "weak", 1),
        result("lengua.skill_4.subskill_2", 4, 1, "weak", 1),
      ]),
      session("weak_s5", "2026-04-20T10:20:00.000Z", "practice", [
        result("lengua.skill_5", 8, 2, "weak", 1),
        result("lengua.skill_5.subskill_1", 8, 2, "weak", 1),
      ]),
    ]);

    await page.goto(`/dashboard?code=${studentCode}`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${screenshotDir}/01-dashboard-with-weaknesses.png`, fullPage: true });

    // Estado 2: Skill_4 recuperándose (developing), skill_5 aún weak
    writeProgress([
      ...baseConsolidatedSessions(),
      session("rec_s4_1", "2026-04-20T11:00:00.000Z", "practice", [
        result("lengua.skill_4", 8, 5, "developing", 2),
        result("lengua.skill_4.subskill_1", 4, 3, "developing", 2),
        result("lengua.skill_4.subskill_2", 4, 2, "developing", 2),
      ]),
      session("still_s5", "2026-04-20T11:20:00.000Z", "practice", [
        result("lengua.skill_5", 8, 2, "weak", 1),
        result("lengua.skill_5.subskill_1", 8, 2, "weak", 1),
      ]),
    ]);

    await page.goto(`/dashboard?code=${studentCode}`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${screenshotDir}/02-dashboard-recovering.png`, fullPage: true });

    // Estado 3: Skill_4 mastered, rotación a skill_5
    writeProgress([
      ...baseConsolidatedSessions(),
      session("rec_s4_2", "2026-04-20T11:30:00.000Z", "practice", [
        result("lengua.skill_4", 8, 7, "mastered", 3),
        result("lengua.skill_4.subskill_1", 4, 4, "mastered", 3),
        result("lengua.skill_4.subskill_2", 4, 3, "mastered", 3),
      ]),
      session("still_s5_2", "2026-04-20T11:50:00.000Z", "practice", [
        result("lengua.skill_5", 8, 2, "weak", 1),
        result("lengua.skill_5.subskill_1", 8, 2, "weak", 1),
      ]),
    ]);

    await page.goto(`/dashboard?code=${studentCode}`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${screenshotDir}/03-dashboard-rotation.png`, fullPage: true });

    // Estado 4: Todas mastered → simulador listo
    writeProgress([
      session("all_1", "2026-04-20T12:00:00.000Z", "practice", [
        result("lengua.skill_1", 8, 7, "mastered", 3),
        result("lengua.skill_1.subskill_1", 8, 7, "mastered", 3),
      ]),
      session("all_2", "2026-04-20T12:10:00.000Z", "reading", [
        result("lengua.skill_2", 8, 7, "mastered", 3),
        result("lengua.skill_2.subskill_1", 8, 7, "mastered", 3),
      ], "RU-LEN-BIO-001"),
      session("all_3", "2026-04-20T12:20:00.000Z", "practice", [
        result("lengua.skill_3", 8, 7, "mastered", 3),
        result("lengua.skill_3.subskill_1", 8, 7, "mastered", 3),
      ]),
      session("all_4", "2026-04-20T12:30:00.000Z", "practice", [
        result("lengua.skill_4", 8, 7, "mastered", 3),
        result("lengua.skill_4.subskill_1", 8, 7, "mastered", 3),
      ]),
      session("all_5", "2026-04-20T12:40:00.000Z", "practice", [
        result("lengua.skill_5", 8, 7, "mastered", 3),
        result("lengua.skill_5.subskill_1", 8, 7, "mastered", 3),
      ]),
      session("all_6", "2026-04-20T12:50:00.000Z", "practice", [
        result("lengua.skill_6", 8, 7, "mastered", 3),
        result("lengua.skill_6.subskill_1", 8, 7, "mastered", 3),
      ]),
      session("all_7", "2026-04-20T13:00:00.000Z", "practice", [
        result("lengua.skill_7", 8, 7, "mastered", 3),
        result("lengua.skill_7.subskill_1", 8, 7, "mastered", 3),
      ]),
    ]);

    await page.goto(`/dashboard?code=${studentCode}`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${screenshotDir}/04-dashboard-simulator-ready.png`, fullPage: true });

    // Estado 5: Página de práctica focalizada (skill weak)
    writeProgress([
      ...baseConsolidatedSessions(),
      session("weak_s4_for_practice", "2026-04-20T10:00:00.000Z", "practice", [
        result("lengua.skill_4", 8, 1, "weak", 1),
        result("lengua.skill_4.subskill_1", 4, 0, "weak", 1),
      ]),
    ]);

    await page.goto(`/practice?mode=training&skill=gramatica-en-contexto&code=${studentCode}`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${screenshotDir}/05-practice-focused.png`, fullPage: true });

    // Estado 6: Página de simulaciones
    await page.goto(`/simulaciones?code=${studentCode}`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${screenshotDir}/06-simulaciones.png`, fullPage: true });

    // Estado 7: Empty state (new student)
    await page.goto(`/dashboard?code=${studentCode}&newStudent=1`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${screenshotDir}/07-dashboard-empty-state.png`, fullPage: true });

    // Estado 8: Dashboard con lectura reciente de bajo accuracy (<80%)
    writeProgress([
      session("reading_low", "2026-04-20T14:00:00.000Z", "reading", [
        result("lengua.skill_1", 10, 5, "developing", 2),
      ], "RU-LEN-BIO-001"),
    ]);

    await page.goto(`/dashboard?code=${studentCode}`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${screenshotDir}/08-dashboard-continue-reading.png`, fullPage: true });

    console.log(`Screenshots guardados en: ${screenshotDir}`);
  });
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
  return { skillId, attempts, correct, state, masteryLevel };
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

  const skillStats: Record<string, { total_attempts: number; total_correct: number; last_state: SkillState; mastery_level: number }> = {};
  for (const item of sessions) {
    for (const skillResult of item.results) {
      skillStats[skillResult.skillId] ??= {
        total_attempts: 0,
        total_correct: 0,
        last_state: skillResult.state,
        mastery_level: skillResult.masteryLevel,
      };
      skillStats[skillResult.skillId].total_attempts += skillResult.attempts;
      skillStats[skillResult.skillId].total_correct += skillResult.correct;
      skillStats[skillResult.skillId].last_state = skillResult.state;
      skillStats[skillResult.skillId].mastery_level = skillResult.masteryLevel;
    }
  }

  writeFileSync(
    progressPath,
    `${JSON.stringify({ sessions: storedSessions, skill_stats: skillStats, seenSkills: Object.keys(skillStats).sort() }, null, 2)}\n`,
    "utf8",
  );
}
