import { expect, test } from "@playwright/test";

test("student code is preserved in key home links", async ({ page }) => {
  await page.goto("/?newStudent=1&code=qa_e2e_code");

  await expect(page.getByRole("link", { name: /Iniciar Entrenamiento/ })).toHaveAttribute(
    "href",
    "/practice?mode=training&skill=comprension-global-del-texto&code=qa_e2e_code",
  );
  await expect(page.getByRole("link", { name: "Ver todas" })).toHaveAttribute(
    "href",
    "/habilidades?code=qa_e2e_code",
  );
  await expect(page.getByRole("link", { name: "Progreso" })).toHaveAttribute(
    "href",
    "/progreso?code=qa_e2e_code",
  );
});

test("profile saves alias and selected avatar locally", async ({ page }) => {
  await page.goto("/perfil?code=qa_e2e_profile");

  await page.getByPlaceholder("Estudiante").fill("Alumno QA");
  await page.getByTestId("avatar-option-9").click();
  await expect(page.getByTestId("avatar-option-9")).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Guardar perfil" }).click();
  await expect(page.getByText("Guardado", { exact: true })).toBeVisible();

  await page.goto("/?code=qa_e2e_profile");

  await expect(page.getByRole("heading", { name: "Alumno QA" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Continuar Lengua|Iniciar Entrenamiento/ })).toHaveAttribute(
    "href",
    /code=qa_e2e_profile/,
  );
});
