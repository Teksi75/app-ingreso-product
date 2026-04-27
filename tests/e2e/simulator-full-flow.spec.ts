import { expect, test } from "@playwright/test";

test("simulator full flow: start → answer → results", async ({ page }) => {
  await page.goto("/simulaciones");

  await expect(page.getByText("Simulación de Lengua")).toBeVisible();
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

    const radioButtons = page.locator('input[type="radio"]');
    if ((await radioButtons.count()) > 0) {
      await radioButtons.first().click({ timeout: 5000 }).catch(() => {});
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
  await expect(page.getByText(/\d+ \/ \d+ correctas/).first()).toBeVisible();
});

test("simulator saves progress to student code", async ({ page }) => {
  const studentCode = `qa_sim_${Date.now()}`;
  await page.goto(`/simulaciones?code=${studentCode}`);

  await page.getByRole("button", { name: "Empezar simulación" }).click();

  for (let attempt = 0; attempt < 20; attempt++) {
    const resultVisible = await page.getByText("Resultado de la simulación").isVisible().catch(() => false);
    if (resultVisible) break;

    const readingIntro = page.getByText("Comenzar preguntas");
    if (await readingIntro.isVisible().catch(() => false)) {
      await readingIntro.click();
      continue;
    }

    const radioButtons = page.locator('input[type="radio"]');
    if ((await radioButtons.count()) > 0) {
      await radioButtons.first().click({ timeout: 5000 }).catch(() => {});
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

  await page.goto(`/dashboard?code=${studentCode}`);
  await expect(page.locator("body")).toContainText(/Sesiones|Ejercicios|Precisión/);
});
