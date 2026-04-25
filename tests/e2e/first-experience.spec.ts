import { expect, test } from "@playwright/test";

test("homepage presents a first-session experience with real CTAs", async ({ page }) => {
  await page.goto("/?newStudent=1");

  await expect(page.getByRole("heading", { name: /¡Empecemos!,/ })).toBeVisible();
  await expect(page.getByText("Empieza tu entrenamiento hoy para ver tu progreso.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Iniciar Entrenamiento/ })).toHaveAttribute(
    "href",
    "/practice?mode=training&skill=comprension-global-del-texto",
  );
  await expect(page.getByRole("link", { name: /Ver Desafío/ })).toHaveAttribute(
    "href",
    /\/practice\?mode=reading&unit=/,
  );
});

test("dashboard shows contextual empty state and recommendation", async ({ page }) => {
  await page.goto("/dashboard?newStudent=1");

  await expect(page.getByText("Todavía no hay sesiones registradas")).toBeVisible();
  await expect(page.getByText("Empezá con una actividad guiada")).toBeVisible();
  await expect(page.getByText("Siguiente paso sugerido")).toBeVisible();
  await expect(page.getByRole("link", { name: "Iniciar lectura con actividades" }).first()).toHaveAttribute(
    "href",
    /\/practice\?mode=reading&unit=/,
  );
  await expect(page.getByText("Próximas habilidades a descubrir")).toBeVisible();
  await expect(page.getByText("0 de 7 habilidades registradas")).toBeVisible();
});

test("practice without query params renders a question", async ({ page }) => {
  await page.goto("/practice");

  await expect(page.getByText(/Pregunta \d+ de \d+/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();
});
