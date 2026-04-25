import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/content_analysis/**/*.test.ts",
      "src/components/practice/**/*.test.ts",
      "src/practice/**/*.test.ts",
      "src/recommendation/**/*.test.ts",
      "src/skills/**/*.test.ts",
    ],
    exclude: ["tests/e2e/**"],
    fileParallelism: false,
  },
});
