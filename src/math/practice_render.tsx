import type { ReactNode } from "react";
import { FigureBlock, MathBlock, MathInline } from "./math_renderer";
import type { MathNode, MathStepsNode } from "./math_content";

export function renderExerciseMathContent(nodes: MathNode[]): ReactNode {
  return nodes.map((node, index) => renderMathNode(node, `math-node-${index}`));
}

export function renderExerciseFeedbackSteps(steps: MathStepsNode | MathNode | MathNode[]): ReactNode {
  const stepsNode = Array.isArray(steps)
    ? steps.find((node): node is MathStepsNode => node.type === "steps")
    : steps.type === "steps"
      ? steps
      : null;

  if (!stepsNode) return null;

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white/60 p-3" data-testid="math-feedback-steps">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Pasos de resolución</p>
      <ol className="grid gap-2 pl-4 text-sm text-slate-700">
        {stepsNode.items.map((line, index) => (
          <li key={`step-${index}`}>{line.map((item, nodeIdx) => renderMathNode(item, `step-${index}-${nodeIdx}`))}</li>
        ))}
      </ol>
    </div>
  );
}

function renderMathNode(node: MathNode, key: string): ReactNode {
  if (node.type === "text") return <span key={key}>{node.text} </span>;
  if (node.type === "expr") {
    return node.inline
      ? <MathInline key={key} node={node} />
      : <MathBlock key={key} node={node} />;
  }
  if (node.type === "figure") return <FigureBlock key={key} node={node} />;
  return renderExerciseFeedbackSteps(node);
}
