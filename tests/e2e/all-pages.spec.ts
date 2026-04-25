import { test } from "@playwright/test";

test("capture all pages", async ({ page }) => {
  test.setTimeout(90_000);
  const pages = [
    { url: "http://localhost:3000/", name: "dashboard" },
    { url: "http://localhost:3000/habilidades", name: "habilidades" },
    { url: "http://localhost:3000/simulaciones", name: "simulaciones" },
    { url: "http://localhost:3000/progreso", name: "progreso" },
    { url: "http://localhost:3000/perfil", name: "perfil" },
  ];

  for (const { url, name } of pages) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: `.screenshots/screenshot-${name}-desktop.png`,
      fullPage: true,
    });

    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: `.screenshots/screenshot-${name}-mobile.png`,
      fullPage: true,
    });

    console.log(`Screenshots captured for ${name}`);
  }
});
