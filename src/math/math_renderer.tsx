import type { MathExprNode, MathFigureNode } from "./math_content.ts";

type MathExprProps = {
  node: MathExprNode;
};

type FigureProps = {
  node: MathFigureNode;
};

export function MathInline({ node }: MathExprProps) {
  return (
    <span
      className="math-inline"
      role="math"
      aria-label={node.spokenText ?? "expresión matemática"}
      dangerouslySetInnerHTML={{ __html: node.mathml }}
    />
  );
}

export function MathBlock({ node }: MathExprProps) {
  return (
    <div
      className="math-block"
      role="math"
      aria-label={node.spokenText ?? "expresión matemática"}
      dangerouslySetInnerHTML={{ __html: node.mathml }}
    />
  );
}

export function FigureBlock({ node }: FigureProps) {
  return (
    <figure className="math-figure" data-kind={node.kind}>
      <div className="math-figure-svg" dangerouslySetInnerHTML={{ __html: node.svg }} />
      {node.labels.length > 0 ? (
        <figcaption className="math-figure-caption">{node.labels.join(" · ")}</figcaption>
      ) : null}
    </figure>
  );
}
