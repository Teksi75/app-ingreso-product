import { expect, test } from "@playwright/test";

test("home Lengua CTA opens a real practice question", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Entrenar" }).click();

  await expect(page).toHaveURL(/\/practice\?.*skill=lengua\.skill_1/);
  await expect(page.getByText("Habilidad en entrenamiento")).toBeVisible();
  await expect(page.getByText(/Pregunta 1 de/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();
});

test("skills Lengua CTA opens a real practice question", async ({ page }) => {
  await page.goto("/habilidades");

  await page.getByRole("link", { name: /Entrenar Ahora/ }).click();

  await expect(page).toHaveURL(/\/practice\?.*skill=lengua\.skill_1/);
  await expect(page.getByText("Habilidad en entrenamiento")).toBeVisible();
  await expect(page.getByText(/Pregunta 1 de/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();
});
