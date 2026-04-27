import { expect, test } from "@playwright/test";

const TECHNICAL_ID_PATTERNS = [/lengua\.skill_\d/, /subskill_\d/, /RU-LEN-/];

test.describe("Lengua full pedagogical flow", () => {
  const studentCode = `e2e-lengua-coverage-${Date.now()}`;

  test("home → skills → practice → reading → simulator → progress → report", async ({ page }) => {
    await page.goto(`/?code=${studentCode}`);
    await expect(page.locator("body")).toContainText(/Empecemos|Bienvenido|misión/);

    const publicText = await page.locator("body").innerText();
    for (const pattern of TECHNICAL_ID_PATTERNS) {
      expect(publicText).not.toMatch(pattern);
    }

    await page.goto(`/habilidades?code=${studentCode}`);
    await expect(page.locator("body")).toContainText(/Lengua|Habilidades/);

    const skillsText = await page.locator("body").innerText();
    for (const pattern of TECHNICAL_ID_PATTERNS) {
      expect(skillsText).not.toMatch(pattern);
    }

    await page.goto(`/practice?mode=training&skill=comprension-global-del-texto&code=${studentCode}`);
    await expect(page.getByText(/Pregunta \d+ de/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();

    const optionLabels = page.locator('[data-testid="answer-option"]');
    const optionCount = await optionLabels.count();
    expect(optionCount).toBeGreaterThanOrEqual(2);
    await optionLabels.first().click();
    await page.getByRole("button", { name: "Responder" }).click();

    await page.waitForTimeout(1000);
    const practiceText = await page.locator("body").innerText();
    for (const pattern of TECHNICAL_ID_PATTERNS) {
      expect(practiceText).not.toMatch(pattern);
    }

    await page.goto(`/practice?mode=reading&unit=violeta-parra&code=${studentCode}`);
    await expect(page.getByText("Lectura y actividades")).toBeVisible();
    await expect(page.getByText("Texto de práctica")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Violeta Parra/ })).toBeVisible();

    const readingOptions = page.locator('[data-testid="answer-option"]');
    if ((await readingOptions.count()) > 0) {
      await readingOptions.first().click();
      const submitBtn = page.locator('[data-testid="submit-answer"]');
      if ((await submitBtn.count()) > 0) {
        await submitBtn.click();
      }
    }

    await page.goto(`/simulaciones?code=${studentCode}`);
    await expect(page.getByRole("button", { name: "Empezar simulación" })).toBeVisible();
    await page.getByRole("button", { name: "Empezar simulación" }).click();

    for (let attempt = 0; attempt < 20; attempt++) {
      const resultVisible = await page.getByText("Resultado de la simulación").isVisible().catch(() => false);
      if (resultVisible) break;

      const readingIntro = page.getByText("Comenzar preguntas");
      if (await readingIntro.isVisible().catch(() => false)) {
        await readingIntro.click();
        continue;
      }

      const simOptions = page.locator('[data-testid="answer-option"]');
      if ((await simOptions.count()) > 0) {
        await simOptions.first().click({ timeout: 5000 }).catch(() => {});
      }

      const finishBtn = page.getByRole("button", { name: "Finalizar" });
      if (await finishBtn.isVisible().catch(() => false)) {
        await finishBtn.click();
        continue;
      }

      const nextBtn = page.getByRole("button", { name: "Siguiente" });
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
      }
    }

    await expect(page.getByText("Resultado de la simulación")).toBeVisible();

    await page.goto(`/progreso?code=${studentCode}`);
    await expect(page.locator("body")).toContainText(/Progreso|Sesiones|Precisión/);

    const progressText = await page.locator("body").innerText();
    for (const pattern of TECHNICAL_ID_PATTERNS) {
      expect(progressText).not.toMatch(pattern);
    }

    await page.goto(`/reporte?code=${studentCode}`);
    await expect(page.locator("body")).toContainText(/INGENIUM|Reporte/);

    const reportText = await page.locator("body").innerText();
    for (const pattern of TECHNICAL_ID_PATTERNS) {
      expect(reportText).not.toMatch(pattern);
    }

    const response = await page.goto(`/reporte/datos?code=${studentCode}&format=json`);
    expect(response?.status()).toBe(200);
    const json = await response?.json();
    expect(json).toHaveProperty("studentCode");
    expect(json).toHaveProperty("summary");
    expect(json.summary).toHaveProperty("totalAttempts");
    expect(json.summary).toHaveProperty("skills");
    expect(Array.isArray(json.summary.skills)).toBe(true);
    expect(json.summary.skills.length).toBeGreaterThanOrEqual(7);
  });
});

test.describe("Simulator covers all canonical skills", () => {
  test("simulator session includes exercises from multiple skill families", async ({ page }) => {
    await page.goto("/simulaciones");
    await expect(page.getByRole("button", { name: "Empezar simulación" })).toBeVisible();
    await page.getByRole("button", { name: "Empezar simulación" }).click();

    const skillsSeen = new Set<string>();

    for (let attempt = 0; attempt < 20; attempt++) {
      const resultVisible = await page.getByText("Resultado de la simulación").isVisible().catch(() => false);
      if (resultVisible) break;

      const readingIntro = page.getByText("Comenzar preguntas");
      if (await readingIntro.isVisible().catch(() => false)) {
        await readingIntro.click();
        continue;
      }

      const skillBadge = page.locator("article span.rounded-lg.bg-slate-100");
      if ((await skillBadge.count()) > 0) {
        const text = await skillBadge.first().innerText().catch(() => "");
        if (text) skillsSeen.add(text);
      }

      const options = page.locator('[data-testid="answer-option"]');
      if ((await options.count()) > 0) {
        await options.first().click({ timeout: 5000 }).catch(() => {});
      }

      const finishBtn = page.getByRole("button", { name: "Finalizar" });
      if (await finishBtn.isVisible().catch(() => false)) {
        await finishBtn.click();
        continue;
      }

      const nextBtn = page.getByRole("button", { name: "Siguiente" });
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
      }
    }

    await expect(page.getByText("Resultado de la simulación")).toBeVisible();

    expect(
      skillsSeen.size,
      `Simulator should cover at least 4 different skill families, but only covered: ${[...skillsSeen].join(", ")}`,
    ).toBeGreaterThanOrEqual(4);

    const resultText = await page.locator("body").innerText();
    expect(resultText).toContain("correctas");
  });
});
