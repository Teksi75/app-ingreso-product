export type MathSkillId = "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8" | "A9";

export type MathSkillNode = {
  id: MathSkillId;
  title: string;
  prerequisites: MathSkillId[];
};

const MATH_SKILL_NODES: MathSkillNode[] = [
  { id: "A1", title: "Operaciones y problemas aritméticos", prerequisites: [] },
  { id: "A2", title: "Potencias y raíces exactas", prerequisites: ["A1"] },
  { id: "A3", title: "Fracción-decimal, simplificación y comparación", prerequisites: ["A1"] },
  { id: "A4", title: "Divisores, múltiplos, MCM y MCD", prerequisites: ["A3"] },
  { id: "A5", title: "Porcentajes y proporcionalidad", prerequisites: ["A4", "A2"] },
  { id: "A6", title: "Ecuaciones simples", prerequisites: ["A5"] },
  { id: "A7", title: "SIMELA conversiones", prerequisites: ["A6"] },
  { id: "A8", title: "Perímetros y áreas", prerequisites: ["A7"] },
  { id: "A9", title: "Comunicación del procedimiento", prerequisites: ["A8"] },
];

const RECOMMENDED_ORDER: MathSkillId[] = ["A1", "A3", "A4", "A2", "A5", "A6", "A7", "A8", "A9"];

export function getMathSkillNodes(): MathSkillNode[] {
  return MATH_SKILL_NODES.map((node) => ({ ...node, prerequisites: [...node.prerequisites] }));
}

export function getMathSkillNode(id: MathSkillId): MathSkillNode | undefined {
  const node = MATH_SKILL_NODES.find((item) => item.id === id);
  return node ? { ...node, prerequisites: [...node.prerequisites] } : undefined;
}

export function getRecommendedMathSkillOrder(): MathSkillId[] {
  return [...RECOMMENDED_ORDER];
}
