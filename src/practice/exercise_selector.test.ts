import { describe, it } from "vitest";
import { testSelector } from "./exercise_selector.ts";

describe("exercise selector", () => {
  it("passes the built-in selector smoke test", () => {
    testSelector();
  });
});
