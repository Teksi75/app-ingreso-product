import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/recommendation/**/*.test.ts",
      "src/skills/**/*.test.ts",
    ],
    exclude: ["tests/e2e/**"],
  },
});
