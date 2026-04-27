import { expect, test } from "@playwright/test";

test("student code is preserved in key navigation links", async ({ page }) => {
  await page.goto("/?newStudent=1&code=qa_e2e_code");

  await expect(page.getByRole("link", { name: /Practicar ahora/ })).toBeVisible();
  await expect(page.locator('a[href*="habilidades"][href*="qa_e2e_code"]').first()).toBeVisible();
  await expect(page.locator('a[href*="progreso"][href*="qa_e2e_code"]').first()).toBeVisible();
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
  await expect(page.getByRole("link", { name: /Practicar ahora/ })).toBeVisible();
});
