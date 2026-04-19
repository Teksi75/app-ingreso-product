import { test } from "@playwright/test";

test("capture dashboard at different viewport sizes", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: ".screenshots/teksi75-dashboard-mobile.png",
    fullPage: true,
  });

  // Tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: ".screenshots/teksi75-dashboard-tablet.png",
    fullPage: true,
  });

  // Desktop viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: ".screenshots/teksi75-dashboard-desktop.png",
    fullPage: true,
  });

  console.log("Screenshots captured: mobile, tablet, and desktop");
});
