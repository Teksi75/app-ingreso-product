import { describe, expect, it } from "vitest";
import { isAcceptedFreeAnswer } from "../../src/practice/answer_evaluation";

describe("answer evaluation", () => {
  it("accepts equivalent free answers from accepted_answers", () => {
    expect(isAcceptedFreeAnswer("0,50", "1/2", [" 2/4 ", "0.5"])).toBe(true);
    expect(isAcceptedFreeAnswer("3/6", "1/2", ["0,5"])).toBe(true);
  });

  it("rejects free answers not present in accepted equivalence set", () => {
    expect(isAcceptedFreeAnswer("0.6", "1/2", ["2/4", "0,5"])).toBe(false);
  });

  it("accepts SIMELA conversion answers with thousands separator", () => {
    expect(isAcceptedFreeAnswer("1.500", "1500", ["1500"])).toBe(true);
    expect(isAcceptedFreeAnswer("2.500", "2500", ["2500"])).toBe(true);
  });
});
