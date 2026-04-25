import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/recommendation/**/*.test.ts"],
    exclude: ["tests/e2e/**"],
  },
});
