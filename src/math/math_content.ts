export type MathTextNode = { type: "text"; text: string };
export type MathExprNode = { type: "expr"; mathml: string; inline?: boolean; spokenText?: string };
export type MathFigureKind = "rectangle" | "triangle" | "composite";
export type MathFigureNode = {
  type: "figure";
  kind: MathFigureKind;
  svg: string;
  labels: string[];
};
export type MathStepsNode = { type: "steps"; items: MathNode[][] };

export type MathNode = MathTextNode | MathExprNode | MathFigureNode | MathStepsNode;

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

export function isMathNode(value: unknown): value is MathNode {
  if (!isObject(value) || typeof value.type !== "string") return false;

  if (value.type === "text") {
    return typeof value.text === "string" && value.text.trim().length > 0;
  }

  if (value.type === "expr") {
    return typeof value.mathml === "string" && value.mathml.trim().length > 0;
  }

  if (value.type === "figure") {
    return (
      (value.kind === "rectangle" || value.kind === "triangle" || value.kind === "composite") &&
      typeof value.svg === "string" &&
      value.svg.trim().length > 0 &&
      Array.isArray(value.labels) &&
      value.labels.every((label) => typeof label === "string")
    );
  }

  if (value.type === "steps") {
    return Array.isArray(value.items);
  }

  return false;
}

function normalizeNode(value: unknown): MathNode {
  if (typeof value === "string" && value.trim().length > 0) {
    return { type: "text", text: value.trim() };
  }

  if (!isMathNode(value)) {
    throw new Error("Invalid MathNode shape");
  }

  if (value.type === "text") {
    return { type: "text", text: value.text.trim() };
  }

  if (value.type === "expr") {
    return {
      type: "expr",
      mathml: value.mathml.trim(),
      inline: value.inline === true,
      spokenText: typeof value.spokenText === "string" ? value.spokenText.trim() : undefined,
    };
  }

  if (value.type === "figure") {
    return {
      type: "figure",
      kind: value.kind,
      svg: value.svg.trim(),
      labels: value.labels.map((label) => label.trim()).filter(Boolean),
    };
  }

  return {
    type: "steps",
    items: value.items.map((line) => {
      if (!Array.isArray(line)) {
        throw new Error("Invalid MathNode shape in steps");
      }
      return line.map((item) => normalizeNode(item));
    }),
  };
}

export function normalizeMathContent(content: unknown[]): MathNode[] {
  return content.map((node) => normalizeNode(node));
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function normalizeFraction(input: string): string | null {
  const match = input.match(/^(-?\d+)\/(\d+)$/);
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator === 0) {
    return null;
  }
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

export function normalizeAcceptedAnswers(answers: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawAnswer of answers) {
    const compact = rawAnswer.trim().replace(/\s+/g, "").replace(",", ".");
    if (!compact) continue;

    const thousandsNormalized = compact.match(/^\d{1,3}(\.\d{3})+$/)
      ? compact.replace(/\./g, "")
      : compact;
    const fraction = normalizeFraction(compact);
    const normalized = fraction
      ?? (thousandsNormalized.match(/^\d+\.\d+$/) ? String(Number(thousandsNormalized)) : thousandsNormalized);

    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result;
}
