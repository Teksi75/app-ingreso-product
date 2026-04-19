import { test } from "@playwright/test";

test("capture dashboard screenshot", async ({ page }) => {
  // Navigate to the dashboard
  await page.goto("http://localhost:3000/");
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");
  
  // Wait for animations to complete
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({
    path: ".screenshots/teksi75-dashboard.png",
    fullPage: true,
  });
  
  console.log("Screenshot saved to teksi75-dashboard.png");
});
