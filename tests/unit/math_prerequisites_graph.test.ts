import { describe, expect, it } from "vitest";
import {
  getMathSkillNode,
  getMathSkillNodes,
  getRecommendedMathSkillOrder,
} from "../../src/math/math_prerequisites.ts";

describe("math prerequisites graph", () => {
  it("builds a complete A1→A9 sequence", () => {
    const nodes = getMathSkillNodes();
    expect(nodes).toHaveLength(9);
    expect(nodes.map((node) => node.id)).toEqual([
      "A1",
      "A2",
      "A3",
      "A4",
      "A5",
      "A6",
      "A7",
      "A8",
      "A9",
    ]);
  });

  it("returns recommended order honoring prerequisites", () => {
    expect(getRecommendedMathSkillOrder()).toEqual([
      "A1",
      "A3",
      "A4",
      "A2",
      "A5",
      "A6",
      "A7",
      "A8",
      "A9",
    ]);
  });

  it("resolves node metadata and dependencies", () => {
    const a1 = getMathSkillNode("A1");
    expect(a1?.title).toMatch(/operaciones/i);
    expect(a1?.prerequisites).toEqual([]);

    const a9 = getMathSkillNode("A9");
    expect(a9?.prerequisites).toEqual(["A8"]);
  });
});
