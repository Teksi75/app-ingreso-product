import { expect, test } from "@playwright/test";

test("home Lengua CTA opens a real practice question", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Entrenar" }).click();

  await expect(page).toHaveURL(/\/practice\?mode=training&skill=/);
  await expect(page.getByText("Habilidad en entrenamiento")).toBeVisible();
  await expect(page.getByText(/Pregunta 1 de/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();
});

test("skills Lengua CTA opens a real practice question", async ({ page }) => {
  await page.goto("/habilidades");

  await page.getByRole("link", { name: /Entrenar Ahora/ }).click();

  await expect(page).toHaveURL(/\/practice\?mode=training&skill=comprension-global-del-texto/);
  await expect(page.getByText("Habilidad en entrenamiento")).toBeVisible();
  await expect(page.getByText(/Pregunta 1 de/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();
});

test("reading practice renders text base and associated activities", async ({ page }) => {
  await page.goto("/practice?mode=reading&unit=RU-LEN-BIO-001");

  await expect(page.getByText("Lectura y actividades")).toBeVisible();
  await expect(page.getByText("Texto de práctica")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Violeta Parra/ })).toBeVisible();
  await expect(page.getByText(/Pregunta 1 de/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();
});

test("reading practice accepts slug-based reading unit URL", async ({ page }) => {
  await page.goto("/practice?mode=reading&unit=violeta-parra-la-voz-que-pintaba-canciones");

  await expect(page.getByText("Lectura y actividades")).toBeVisible();
  await expect(page.getByText("Texto de práctica")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Violeta Parra/ })).toBeVisible();
  await expect(page.getByText(/Pregunta 1 de/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();
});
