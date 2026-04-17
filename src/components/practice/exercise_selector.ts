import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export * from "../../practice/exercise_selector.ts";

export type MasteryLevel = 1 | 2 | 3 | 4;

export type MasteryMapNode = {
  id: string;
  name: string;
  type: "skill" | "subskill";
  parent_skill?: string;
  recommended_mastery: MasteryLevel;
  unlock_points: number;
  unlocks: string[];
};

export type RecommendedSubskill = {
  id: string;
  name: string;
  parentSkill: string;
  masteryLevel: MasteryLevel;
  recommendedMastery: MasteryLevel;
};

type SkillRelationship = {
  skill_origen: string;
  skill_destino: string;
  tipo: "sequential" | "prerequisite" | "reinforcement";
  fuerza: "alta" | "media" | "baja";
};

type RecommendationInput = {
  currentFocus: string;
  masteryByFocus: Record<string, number>;
};

type MasteryMapFile = {
  mastery_map: MasteryMapNode[];
};

type RelationshipsFile = {
  relationships: SkillRelationship[];
};

const engineDir = resolve(process.cwd(), "docs/04_exercise_engine");

export function getLenguaMasteryMap(): MasteryMapNode[] {
  return loadMasteryMap();
}

export function recommendNextSubskill({
  currentFocus,
  masteryByFocus,
}: RecommendationInput): RecommendedSubskill | null {
  const masteryMap = loadMasteryMap();
  const relationships = loadRelationships();
  const currentNode = findMasteryNode(currentFocus);
  const candidates = relationships
    .filter((relationship) => relationship.skill_origen === currentFocus)
    .map((relationship) => ({
      node: findMasteryNode(relationship.skill_destino),
      relationship,
    }))
    .filter((candidate): candidate is { node: MasteryMapNode; relationship: SkillRelationship } => (
      Boolean(candidate.node)
    ))
    .sort((left, right) => getRelationshipRank(left.relationship) - getRelationshipRank(right.relationship));

  const underRecommended = candidates.find(({ node }) => {
    const masteryLevel = getMasteryLevel(node.id, masteryByFocus);

    return masteryLevel < node.recommended_mastery;
  });

  const selected = underRecommended?.node ?? candidates[0]?.node ?? currentNode ?? null;

  if (!selected) {
    return null;
  }

  const subskill = selected.type === "subskill"
    ? selected
    : masteryMap.find((node) => (
      node.type === "subskill" &&
      node.parent_skill === selected.id &&
      getMasteryLevel(node.id, masteryByFocus) < node.recommended_mastery
    )) ?? selected;

  return {
    id: subskill.id,
    name: subskill.name,
    parentSkill: subskill.parent_skill ?? subskill.id,
    masteryLevel: getMasteryLevel(subskill.id, masteryByFocus),
    recommendedMastery: subskill.recommended_mastery,
  };
}

function loadMasteryMap(): MasteryMapNode[] {
  return (readJsonFile("lengua_mastery_map.json") as MasteryMapFile).mastery_map;
}

function loadRelationships(): SkillRelationship[] {
  return (readJsonFile("lengua_skill_relationships.json") as RelationshipsFile).relationships;
}

function readJsonFile(fileName: string): unknown {
  return JSON.parse(readFileSync(resolve(engineDir, fileName), "utf8"));
}

function findMasteryNode(id: string): MasteryMapNode | undefined {
  const masteryMap = loadMasteryMap();

  return masteryMap.find((node) => node.id === id);
}

function getMasteryLevel(id: string, masteryByFocus: Record<string, number>): MasteryLevel {
  const value = masteryByFocus[id] ?? 1;

  if (value >= 4) {
    return 4;
  }

  if (value >= 3) {
    return 3;
  }

  if (value >= 2) {
    return 2;
  }

  return 1;
}

function getRelationshipRank(relationship: SkillRelationship): number {
  const typeRank = relationship.tipo === "sequential" ? 0 : relationship.tipo === "prerequisite" ? 1 : 2;
  const forceRank = relationship.fuerza === "alta" ? 0 : relationship.fuerza === "media" ? 1 : 2;

  return typeRank * 10 + forceRank;
}
