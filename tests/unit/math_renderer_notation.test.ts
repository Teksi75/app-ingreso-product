import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FigureBlock, MathBlock, MathInline } from "../../src/math/math_renderer.tsx";

describe("math renderer notation", () => {
  it("renders exponent and root notation as textbook math", () => {
    const exponent = renderToStaticMarkup(
      createElement(MathInline, {
        node: { type: "expr", inline: true, mathml: "<math><msup><mi>x</mi><mn>2</mn></msup></math>" },
      }),
    );
    const root = renderToStaticMarkup(
      createElement(MathBlock, {
        node: { type: "expr", mathml: "<math><msqrt><mn>81</mn></msqrt></math>" },
      }),
    );

    expect(exponent).toContain("<msup>");
    expect(root).toContain("<msqrt>");
    expect(exponent).not.toContain("x^2");
    expect(root).not.toContain("sqrt(81)");
  });

  it("renders fraction notation and readable figure labels", () => {
    const fraction = renderToStaticMarkup(
      createElement(MathBlock, {
        node: { type: "expr", mathml: "<math><mfrac><mn>1</mn><mn>2</mn></mfrac></math>" },
      }),
    );
    const figure = renderToStaticMarkup(
      createElement(FigureBlock, {
        node: {
          type: "figure",
          kind: "triangle",
          svg: "<svg viewBox='0 0 120 120'><polygon points='60,10 10,110 110,110' /></svg>",
          labels: ["base = 6 cm", "altura = 4 cm"],
        },
      }),
    );

    expect(fraction).toContain("<mfrac>");
    expect(fraction).not.toContain("1/2");
    expect(figure).toContain("<svg");
    expect(figure).toContain("base = 6 cm");
    expect(figure).toContain("altura = 4 cm");
  });
});
