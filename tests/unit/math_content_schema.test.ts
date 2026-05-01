import { describe, expect, it } from "vitest";
import {
  isMathNode,
  normalizeAcceptedAnswers,
  normalizeMathContent,
} from "../../src/math/math_content.ts";

describe("math content schema", () => {
  it("normalizes semantic nodes across text, expr, figure and steps", () => {
    const content = normalizeMathContent([
      "Calculá:",
      { type: "expr", inline: true, mathml: "<math><mn>2</mn><mo>+</mo><mn>2</mn></math>" },
      {
        type: "figure",
        kind: "rectangle",
        svg: "<svg viewBox='0 0 10 10'></svg>",
        labels: ["base: 4 cm", "altura: 2 cm"],
      },
      {
        type: "steps",
        items: [["Paso 1"], [{ type: "text", text: "Paso 2" }]],
      },
    ]);

    expect(content).toHaveLength(4);
    expect(content[0]).toEqual({ type: "text", text: "Calculá:" });
    expect(content[1]).toMatchObject({ type: "expr", inline: true });
    expect(content[2]).toMatchObject({ type: "figure", kind: "rectangle" });
    expect(content[3]).toMatchObject({ type: "steps" });
  });

  it("normalizes equivalent accepted answers and removes duplicates", () => {
    const normalized = normalizeAcceptedAnswers([" 2/4 ", "1/2", "0,5", "0.50", "2"]);
    expect(normalized).toEqual(["1/2", "0.5", "2"]);
  });

  it("rejects invalid node shapes", () => {
    expect(isMathNode({ type: "expr", mathml: "" })).toBe(false);
    expect(() => normalizeMathContent([{ type: "figure", kind: "triangle" }])).toThrow(/invalid/i);
  });
});
