import { test, expect } from "@playwright/test";

test("entra a práctica de Matemática desde habilidades", async ({ page }) => {
  await page.goto("/habilidades");
  const action = page.locator('a[href*="subject=matematica"]');
  await expect(action).toBeVisible();
  await action.click();
  await expect(page).toHaveURL(/practice\?mode=training&subject=matematica|subject=matematica/);
});
