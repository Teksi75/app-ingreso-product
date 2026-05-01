import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderExerciseMathContent, renderExerciseFeedbackSteps } from "../../src/math/practice_render";

describe("practice question math rendering", () => {
  it("renders structured math content nodes in prompt area", () => {
    const html = renderToStaticMarkup(createElement("div", null, renderExerciseMathContent([
      { type: "text", text: "Resolvé" },
      { type: "expr", inline: true, mathml: "<math><mfrac><mn>3</mn><mn>4</mn></mfrac></math>" },
    ])));

    expect(html).toContain("Resolvé");
    expect(html).toContain("<mfrac>");
  });

  it("renders feedback steps as ordered textbook process", () => {
    const html = renderToStaticMarkup(createElement("div", null, renderExerciseFeedbackSteps({
      type: "steps",
      items: [
        [{ type: "text", text: "Paso 1" }],
        [{ type: "expr", mathml: "<math><mn>2</mn><mo>+</mo><mn>2</mn></math>" }],
      ],
    })));

    expect(html).toContain("Pasos de resolución");
    expect(html).toContain("Paso 1");
    expect(html).toContain("<math>");
  });
});
