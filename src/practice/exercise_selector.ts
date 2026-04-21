import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  staticRelationships,
  staticMasteryMap,
  staticExerciseEngineFiles,
  staticExerciseEngineFileNames,
} from "../data/static_content";

export type Result = "correct" | "incorrect";
export type Difficulty = 1 | 2 | 3;
export type MasteryLevel = 1 | 2 | 3 | 4;

export type UserSkillState = {
  skill: string;
  subskill: string;
  accuracy: number;
  streak: number;
  attempts?: number;
  lastResult: Result;
  masteryLevel?: MasteryLevel;
};

export type Exercise = {
  id: string;
  skill: string;
  subskill: string;
  difficulty: Difficulty;
  masteryLevel?: MasteryLevel;
  sourceFile?: string;
};

export type LenguaRelationship = {
  skill_origen: string;
  skill_destino: string;
  tipo: "sequential" | "prerequisite" | "reinforcement";
  fuerza: "alta" | "media" | string;
};

export type MasteryNode = {
  id: string;
  name: string;
  type: "skill" | "subskill";
  parent_skill?: string;
  recommended_mastery: MasteryLevel;
  unlock_points: number;
  unlocks: string[];
};

export type LenguaSelectionGraph = {
  relationships: LenguaRelationship[];
  masteryMap: MasteryNode[];
  masteryById: Map<string, MasteryNode>;
  skillNameToId: Map<string, string>;
  subskillNameToId: Map<string, string>;
};

type RuleApplied = "A" | "B" | "C" | "D" | "E";
type DifficultyMode = "exact" | "same_or_lower" | "same_or_higher";

type Target = {
  skill: string;
  subskill?: string;
  difficulty: Difficulty;
  difficultyMode: DifficultyMode;
};

export type SelectionOptions = {
  seenSkills?: string[];
  hasSeenSkill?: (skillId: string) => boolean;
  lastExerciseId?: string;
  usedExerciseIds?: string[];
  masteryBySkill?: Record<string, MasteryLevel>;
  selectionGraph?: LenguaSelectionGraph;
};

export type SelectionResult = {
  exercise: Exercise;
  ruleApplied: RuleApplied;
};

const EXERCISE_ENGINE_DIR = resolve(process.cwd(), "docs/04_exercise_engine");
const RELATIONSHIPS_FILE = "lengua_skill_relationships.json";
const MASTERY_FILE = "lengua_mastery_map.json";
const CONTENT_INDEX_FILE = "lengua_content_index.json";

const LEGACY_SKILL_IDS: Record<string, string> = {
  "LEN-COMP-001": "lengua.skill_1",
  "LEN-COMP-002": "lengua.skill_1",
  "LEN-COMP-003": "lengua.skill_1",
  "LEN-COMP-004": "lengua.skill_1",
  "LEN-VOC-001": "lengua.skill_1",
  "LEN-VOC-002": "lengua.skill_1",
  "LEN-TEXT-001": "lengua.skill_2",
  "LEN-TEXT-002": "lengua.skill_2",
  "LEN-TEXT-003": "lengua.skill_2",
  "LEN-WRIT-001": "lengua.skill_3",
  "LEN-WRIT-002": "lengua.skill_3",
  "LEN-WRIT-003": "lengua.skill_3",
  "LEN-GRAM-001": "lengua.skill_5",
  "LEN-GRAM-002": "lengua.skill_4",
  "LEN-GRAM-003": "lengua.skill_4",
  "LEN-NORM-001": "lengua.skill_6",
  "LEN-NORM-002": "lengua.skill_6",
  "LEN-NORM-003": "lengua.skill_6",
  "LEN-PUNC-001": "lengua.skill_7",
  "LEN-PUNC-002": "lengua.skill_7",
  "LEN-PUNC-003": "lengua.skill_7",
};

let cachedGraph: LenguaSelectionGraph | null = null;

function isFsAvailable(baseDir: string): boolean {
  try {
    return existsSync(baseDir);
  } catch {
    return false;
  }
}

export function listLenguaExerciseFiles(baseDir = EXERCISE_ENGINE_DIR): string[] {
  if (isFsAvailable(baseDir)) {
    return readdirSync(baseDir)
      .filter((fileName) => (
        fileName.startsWith("lengua_") &&
        fileName.endsWith(".json") &&
        !fileName.startsWith("lengua_textgroup_") &&
        ![RELATIONSHIPS_FILE, MASTERY_FILE, CONTENT_INDEX_FILE].includes(fileName)
      ))
      .sort((left, right) => left.localeCompare(right));
  }

  return staticExerciseEngineFileNames;
}

export function loadLenguaSelectionGraph(baseDir = EXERCISE_ENGINE_DIR): LenguaSelectionGraph {
  if (cachedGraph && baseDir === EXERCISE_ENGINE_DIR) {
    return cachedGraph;
  }

  let relationshipsFile: { relationships?: LenguaRelationship[] };
  let masteryFile: { mastery_map?: MasteryNode[] };

  if (isFsAvailable(baseDir)) {
    relationshipsFile = JSON.parse(
      readFileSync(join(baseDir, RELATIONSHIPS_FILE), "utf8"),
    ) as { relationships?: LenguaRelationship[] };
    masteryFile = JSON.parse(
      readFileSync(join(baseDir, MASTERY_FILE), "utf8"),
    ) as { mastery_map?: MasteryNode[] };
  } else {
    relationshipsFile = staticRelationships as { relationships?: LenguaRelationship[] };
    masteryFile = staticMasteryMap as { mastery_map?: MasteryNode[] };
  }

  const masteryMap = masteryFile.mastery_map ?? [];
  const masteryById = new Map(masteryMap.map((node) => [node.id, node]));
  const skillNameToId = new Map<string, string>();
  const subskillNameToId = new Map<string, string>();

  for (const node of masteryMap) {
    const key = normalizeText(node.name);
    if (node.type === "skill") {
      skillNameToId.set(key, node.id);
    } else {
      subskillNameToId.set(key, node.id);
    }
  }

  const graph = {
    relationships: relationshipsFile.relationships ?? [],
    masteryMap,
    masteryById,
    skillNameToId,
    subskillNameToId,
  };

  if (baseDir === EXERCISE_ENGINE_DIR) {
    cachedGraph = graph;
  }

  return graph;
}

export function loadLenguaSelectorExercises(baseDir = EXERCISE_ENGINE_DIR): Exercise[] {
  const graph = loadLenguaSelectionGraph(baseDir);
  const exercises: Exercise[] = [];
  const useFs = isFsAvailable(baseDir);

  for (const fileName of listLenguaExerciseFiles(baseDir)) {
    const parsed = useFs
      ? JSON.parse(readFileSync(join(baseDir, fileName), "utf8")) as unknown
      : staticExerciseEngineFiles[fileName];
    if (parsed) {
      exercises.push(...extractSelectorExercises(parsed, fileName, graph));
    }
  }

  return dedupeExercises(exercises);
}

export function normalizeSkillId(
  value: unknown,
  graph: LenguaSelectionGraph = loadLenguaSelectionGraph(),
): string {
  if (typeof value === "number") {
    return `lengua.skill_${value}`;
  }

  if (typeof value === "object" && value !== null) {
    const maybeSkill = value as { id?: unknown; name?: unknown };
    return normalizeSkillId(maybeSkill.id ?? maybeSkill.name, graph);
  }

  if (typeof value !== "string") {
    return "lengua.skill_1";
  }

  if (value.startsWith("lengua.skill_")) {
    return value.split(".subskill_")[0];
  }

  const legacyId = LEGACY_SKILL_IDS[value.toUpperCase()];
  if (legacyId) {
    return legacyId;
  }

  return graph.skillNameToId.get(normalizeText(value)) ?? "lengua.skill_1";
}

export function normalizeSubskillId(
  value: unknown,
  skillId: string,
  graph: LenguaSelectionGraph = loadLenguaSelectionGraph(),
): string {
  if (typeof value === "string" && value.startsWith("lengua.skill_")) {
    return value;
  }

  const key = normalizeText(typeof value === "string" ? value : "");
  const direct = graph.subskillNameToId.get(key);
  if (direct) {
    return direct;
  }

  const fallback = resolveKnownSubskill(key, skillId);
  if (fallback) {
    return fallback;
  }

  const firstSubskill = graph.masteryMap.find(
    (node) => node.type === "subskill" && node.parent_skill === skillId,
  );

  return firstSubskill?.id ?? `${skillId}.subskill_1`;
}

export function selectNextExerciseDetailed(
  exercises: Exercise[],
  userState: UserSkillState[],
  options: SelectionOptions = {},
): SelectionResult {
  if (exercises.length === 0) {
    throw new Error("selectNextExercise requires at least one exercise");
  }

  const graph = options.selectionGraph ?? loadLenguaSelectionGraph();
  const activeExercises = filterImmediateRepeats(filterUnlockedExercises(exercises, userState, options, graph), options);
  const pool = activeExercises.length > 0 ? activeExercises : filterImmediateRepeats(exercises, options);
  const selectionPool = pool.length > 0 ? pool : exercises;

  const explorationExercise = pickUnseenSkillExercise(selectionPool, options, graph);
  if (explorationExercise) {
    logSelection("E", explorationExercise);
    return { exercise: explorationExercise, ruleApplied: "E" };
  }

  if (userState.length === 0) {
    const selected = pickLowestMasteryGap(selectionPool, [], options, graph) ?? pickDeterministic(selectionPool);
    logSelection("E", selected);
    return { exercise: selected, ruleApplied: "E" };
  }

  const currentState = pickCurrentState(userState);
  const referenceDifficulty = getReferenceDifficulty(selectionPool, currentState);
  const { ruleApplied, target } = resolveRuleTarget(selectionPool, userState, currentState, referenceDifficulty, options, graph);

  const selected =
    pickStrictCandidate(selectionPool, target) ??
    pickRelatedCandidate(selectionPool, currentState, options, graph) ??
    pickLowestMasteryGap(selectionPool, userState, options, graph) ??
    pickFallbackCandidate(selectionPool, target) ??
    pickDeterministic(selectionPool);

  logSelection(ruleApplied, selected);
  return { exercise: selected, ruleApplied };
}

export function selectNextExercise(
  exercises: Exercise[],
  userState: UserSkillState[],
  options: SelectionOptions = {},
): Exercise {
  return selectNextExerciseDetailed(exercises, userState, options).exercise;
}

function extractSelectorExercises(
  parsed: unknown,
  sourceFile: string,
  graph: LenguaSelectionGraph,
): Exercise[] {
  const root = parsed as {
    exercises?: unknown[];
    subskills?: unknown[];
  };

  if (Array.isArray(root.exercises)) {
    return root.exercises.map((exercise) => normalizeSelectorExercise(exercise, sourceFile, graph));
  }

  if (!Array.isArray(root.subskills)) {
    return [];
  }

  return root.subskills.flatMap((rawSubskill) => {
    const subskill = rawSubskill as {
      skill?: unknown;
      skill_id?: unknown;
      skill_name?: unknown;
      canonical_subskill?: unknown;
      subskill?: unknown;
      exercises?: unknown[];
    };
    const skillId = normalizeSkillId(subskill.skill ?? subskill.skill_id ?? subskill.skill_name, graph);
    const subskillId = normalizeSubskillId(
      subskill.canonical_subskill ?? subskill.subskill,
      skillId,
      graph,
    );

    return (subskill.exercises ?? []).map((exercise) => normalizeSelectorExercise(
      { ...(exercise as Record<string, unknown>), skill: skillId, subskill: subskillId },
      sourceFile,
      graph,
    ));
  });
}

function normalizeSelectorExercise(
  rawExercise: unknown,
  sourceFile: string,
  graph: LenguaSelectionGraph,
): Exercise {
  const exercise = rawExercise as {
    id?: unknown;
    skill?: unknown;
    skill_id?: unknown;
    skill_name?: unknown;
    subskill?: unknown;
    canonical_subskill?: unknown;
    difficulty?: unknown;
    mastery_level?: unknown;
    metadata?: { difficulty?: unknown; dificultad?: unknown; mastery_level?: unknown; mastery_target?: unknown };
  };
  const skillId = normalizeSkillId(exercise.skill ?? exercise.skill_id ?? exercise.skill_name, graph);
  const subskillId = normalizeSubskillId(exercise.subskill ?? exercise.canonical_subskill, skillId, graph);

  return {
    id: String(exercise.id),
    skill: skillId,
    subskill: subskillId,
    difficulty: normalizeDifficulty(exercise.difficulty ?? exercise.metadata?.difficulty ?? exercise.metadata?.dificultad),
    masteryLevel: normalizeMasteryLevel(exercise.mastery_level ?? exercise.metadata?.mastery_level ?? exercise.metadata?.mastery_target),
    sourceFile,
  };
}

function resolveRuleTarget(
  exercises: Exercise[],
  userState: UserSkillState[],
  state: UserSkillState,
  referenceDifficulty: Difficulty,
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): { ruleApplied: RuleApplied; target: Target } {
  if (hasRecurrentError(userState, state.skill, state.subskill)) {
    return {
      ruleApplied: "D",
      target: {
        skill: state.skill,
        subskill: state.subskill,
        difficulty: Math.max(referenceDifficulty - 1, 1) as Difficulty,
        difficultyMode: "same_or_lower",
      },
    };
  }

  if (state.lastResult === "incorrect") {
    return {
      ruleApplied: "A",
      target: {
        skill: state.skill,
        subskill: state.subskill,
        difficulty: referenceDifficulty,
        difficultyMode: "same_or_lower",
      },
    };
  }

  if (state.streak >= 2 && isAtRecommendedMastery(state, options, graph)) {
    const related = findRelatedTarget(exercises, state, ["sequential", "reinforcement"], options, graph);

    return {
      ruleApplied: "B",
      target: related ?? {
        skill: state.skill,
        subskill: state.subskill,
        difficulty: Math.min(referenceDifficulty + 1, 3) as Difficulty,
        difficultyMode: "same_or_higher",
      },
    };
  }

  if (state.accuracy >= 0.85) {
    const alternativeSubskill = findAlternativeSubskill(exercises, state.skill, state.subskill);

    return {
      ruleApplied: "C",
      target: {
        skill: state.skill,
        subskill: alternativeSubskill ?? state.subskill,
        difficulty: referenceDifficulty,
        difficultyMode: "exact",
      },
    };
  }

  if (state.accuracy < 0.6) {
    return {
      ruleApplied: "D",
      target: {
        skill: state.skill,
        subskill: state.subskill,
        difficulty: Math.max(referenceDifficulty - 1, 1) as Difficulty,
        difficultyMode: "exact",
      },
    };
  }

  return {
    ruleApplied: "E",
    target: {
      skill: state.skill,
      subskill: state.subskill,
      difficulty: referenceDifficulty,
      difficultyMode: "exact",
    },
  };
}

function filterUnlockedExercises(
  exercises: Exercise[],
  userState: UserSkillState[],
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): Exercise[] {
  const unlocked = exercises.filter((exercise) => isExerciseUnlocked(exercise, userState, options, graph));
  return unlocked.length > 0 ? unlocked : exercises;
}

function isExerciseUnlocked(
  exercise: Exercise,
  userState: UserSkillState[],
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): boolean {
  const prerequisites = graph.relationships.filter((relationship) => (
    relationship.tipo === "prerequisite" &&
    matchesNode(exercise, relationship.skill_destino)
  ));

  return prerequisites.every((relationship) => {
    const sourceNode = graph.masteryById.get(relationship.skill_origen);
    const requiredLevel = sourceNode?.recommended_mastery ?? 2;
    return getMasteryLevel(relationship.skill_origen, userState, options, graph) >= requiredLevel;
  });
}

function pickRelatedCandidate(
  exercises: Exercise[],
  state: UserSkillState,
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): Exercise | null {
  const target = findRelatedTarget(exercises, state, ["sequential", "reinforcement"], options, graph);
  return target ? pickStrictCandidate(exercises, target) : null;
}

function findRelatedTarget(
  exercises: Exercise[],
  state: UserSkillState,
  allowedTypes: LenguaRelationship["tipo"][],
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): Target | null {
  const relatedIds = graph.relationships
    .filter((relationship) => (
      allowedTypes.includes(relationship.tipo) &&
      matchesState(state, relationship.skill_origen)
    ))
    .sort((left, right) => relationWeight(right) - relationWeight(left))
    .map((relationship) => relationship.skill_destino);

  for (const relatedId of relatedIds) {
    const candidate = exercises.find((exercise) => (
      matchesNode(exercise, relatedId) &&
      isExerciseUnlocked(exercise, [state], options, graph)
    ));

    if (candidate) {
      return {
        skill: candidate.skill,
        subskill: candidate.subskill,
        difficulty: candidate.difficulty,
        difficultyMode: "exact",
      };
    }
  }

  return null;
}

function pickLowestMasteryGap(
  exercises: Exercise[],
  userState: UserSkillState[],
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): Exercise | null {
  const candidates = [...exercises].sort((left, right) => {
    const leftGap = getMasteryGap(left, userState, options, graph);
    const rightGap = getMasteryGap(right, userState, options, graph);
    return rightGap - leftGap ||
      (left.masteryLevel ?? 1) - (right.masteryLevel ?? 1) ||
      left.difficulty - right.difficulty ||
      left.id.localeCompare(right.id);
  });

  return candidates[0] ?? null;
}

function pickCurrentState(userState: UserSkillState[]): UserSkillState {
  return [...userState].sort((left, right) => {
    const leftWeakness = (left.lastResult === "incorrect" ? 2 : 0) + (1 - left.accuracy);
    const rightWeakness = (right.lastResult === "incorrect" ? 2 : 0) + (1 - right.accuracy);
    return rightWeakness - leftWeakness;
  })[0];
}

function hasRecurrentError(userState: UserSkillState[], skill: string, subskill: string): boolean {
  const state = userState.find((item) => item.skill === skill && item.subskill === subskill);
  return Boolean(state && state.attempts && state.attempts >= 3 && state.accuracy <= 1 / 3);
}

function isAtRecommendedMastery(
  state: UserSkillState,
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): boolean {
  const node = graph.masteryById.get(state.subskill) ?? graph.masteryById.get(state.skill);
  const recommended = node?.recommended_mastery ?? 3;
  return getMasteryLevel(state.subskill, [state], options, graph) >= recommended;
}

function getMasteryGap(
  exercise: Exercise,
  userState: UserSkillState[],
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): number {
  const node = graph.masteryById.get(exercise.subskill) ?? graph.masteryById.get(exercise.skill);
  const recommended = node?.recommended_mastery ?? 3;
  return recommended - getMasteryLevel(exercise.subskill, userState, options, graph);
}

function getMasteryLevel(
  nodeId: string,
  userState: UserSkillState[],
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): MasteryLevel {
  const explicit = options.masteryBySkill?.[nodeId];
  if (explicit) {
    return explicit;
  }

  const childStates = userState.filter((state) => matchesState(state, nodeId));
  if (childStates.length === 0) {
    return 1;
  }

  const average = childStates.reduce((sum, state) => sum + (state.masteryLevel ?? accuracyToMastery(state.accuracy)), 0) / childStates.length;
  const parent = graph.masteryById.get(nodeId);
  if (parent?.type === "skill") {
    return clampMastery(Math.floor(average) as MasteryLevel);
  }

  return clampMastery(Math.round(average) as MasteryLevel);
}

function accuracyToMastery(accuracy: number): MasteryLevel {
  if (accuracy >= 0.9) return 4;
  if (accuracy >= 0.75) return 3;
  if (accuracy >= 0.4) return 2;
  return 1;
}

function filterImmediateRepeats(exercises: Exercise[], options: SelectionOptions): Exercise[] {
  const blocked = new Set([...(options.usedExerciseIds ?? []), options.lastExerciseId].filter(Boolean));
  const filtered = exercises.filter((exercise) => !blocked.has(exercise.id));
  return filtered.length > 0 ? filtered : exercises.filter((exercise) => exercise.id !== options.lastExerciseId);
}

function findAlternativeSubskill(
  exercises: Exercise[],
  skill: string,
  currentSubskill: string,
): string | null {
  const options = Array.from(
    new Set(
      exercises
        .filter((exercise) => exercise.skill === skill)
        .map((exercise) => exercise.subskill),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return options.find((option) => option !== currentSubskill) ?? null;
}

function getReferenceDifficulty(exercises: Exercise[], state: UserSkillState): Difficulty {
  const candidates = exercises.filter(
    (exercise) => exercise.skill === state.skill && exercise.subskill === state.subskill,
  );

  if (candidates.length === 0) {
    return 1;
  }

  const sorted = candidates.map((exercise) => exercise.difficulty).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] as Difficulty;
}

function pickStrictCandidate(exercises: Exercise[], target: Target): Exercise | null {
  const candidates = exercises.filter((exercise) => {
    if (exercise.skill !== target.skill) {
      return false;
    }

    if (target.subskill && exercise.subskill !== target.subskill) {
      return false;
    }

    if (target.difficultyMode === "same_or_lower") {
      return exercise.difficulty <= target.difficulty;
    }

    if (target.difficultyMode === "same_or_higher") {
      return exercise.difficulty >= target.difficulty;
    }

    return exercise.difficulty === target.difficulty;
  });

  if (candidates.length === 0) {
    return null;
  }

  if (target.difficultyMode === "same_or_lower") {
    return [...candidates].sort((a, b) => b.difficulty - a.difficulty || a.id.localeCompare(b.id))[0];
  }

  return pickDeterministic(candidates);
}

function pickFallbackCandidate(exercises: Exercise[], target: Target): Exercise | null {
  const sameSkill = exercises.filter((exercise) => exercise.skill === target.skill);

  if (sameSkill.length === 0) {
    return null;
  }

  const sameDifficulty = sameSkill.filter((exercise) => {
    if (target.difficultyMode === "same_or_lower") {
      return exercise.difficulty <= target.difficulty;
    }

    if (target.difficultyMode === "same_or_higher") {
      return exercise.difficulty >= target.difficulty;
    }

    return exercise.difficulty === target.difficulty;
  });

  return sameDifficulty.length > 0 ? pickDeterministic(sameDifficulty) : pickDeterministic(sameSkill);
}

function pickUnseenSkillExercise(
  exercises: Exercise[],
  options: SelectionOptions,
  graph: LenguaSelectionGraph,
): Exercise | null {
  if (!options.hasSeenSkill && !options.seenSkills) {
    return null;
  }

  const seenSkills = new Set(options.seenSkills ?? []);
  const hasSeenSkill = options.hasSeenSkill ?? ((skillId: string) => seenSkills.has(skillId));
  const unseen = exercises
    .filter((exercise) => !hasSeenSkill(exercise.skill))
    .sort((left, right) => {
      const leftNode = graph.masteryById.get(left.skill);
      const rightNode = graph.masteryById.get(right.skill);
      return (leftNode?.unlock_points ?? 0) - (rightNode?.unlock_points ?? 0) ||
        left.difficulty - right.difficulty ||
        left.id.localeCompare(right.id);
    });

  return unseen[0] ?? null;
}

function matchesState(state: UserSkillState, nodeId: string): boolean {
  return state.skill === nodeId || state.subskill === nodeId || state.subskill.startsWith(`${nodeId}.`);
}

function matchesNode(exercise: Exercise, nodeId: string): boolean {
  return exercise.skill === nodeId || exercise.subskill === nodeId || exercise.subskill.startsWith(`${nodeId}.`);
}

function relationWeight(relationship: LenguaRelationship): number {
  const typeWeight = relationship.tipo === "prerequisite" ? 3 : relationship.tipo === "sequential" ? 2 : 1;
  const forceWeight = relationship.fuerza === "alta" ? 2 : 1;
  return typeWeight + forceWeight;
}

function dedupeExercises(exercises: Exercise[]): Exercise[] {
  return Array.from(new Map(exercises.map((exercise) => [exercise.id, exercise])).values());
}

function pickDeterministic(candidates: Exercise[]): Exercise {
  return [...candidates].sort((a, b) => a.id.localeCompare(b.id))[0];
}

function normalizeDifficulty(value: unknown): Difficulty {
  if (typeof value === "number") {
    return clampDifficulty(value);
  }

  const normalized = normalizeText(String(value));
  if (normalized === "alta") return 3;
  if (normalized === "media") return 2;
  return 1;
}

function normalizeMasteryLevel(value: unknown): MasteryLevel {
  if (typeof value === "number") {
    return clampMastery(value);
  }

  return 1;
}

function clampDifficulty(value: number): Difficulty {
  if (value >= 3) return 3;
  if (value >= 2) return 2;
  return 1;
}

function clampMastery(value: number): MasteryLevel {
  if (value >= 4) return 4;
  if (value >= 3) return 3;
  if (value >= 2) return 2;
  return 1;
}

function resolveKnownSubskill(key: string, skillId: string): string | null {
  const rules: Array<[string, string, RegExp]> = [
    ["lengua.skill_1", "lengua.skill_1.subskill_1", /explicita|puntual|textual|directa|dato/],
    ["lengua.skill_1", "lengua.skill_1.subskill_2", /infer|causa|consecuencia|motivo|intencion|estado|pista|significado|sinonimo|acepcion|intensidad/],
    ["lengua.skill_1", "lengua.skill_1.subskill_3", /sintesis|tema|titulo|global|central/],
    ["lengua.skill_2", "lengua.skill_2.subskill_1", /orden|cronologico|logico|secuencia|narrativo|instructivo/],
    ["lengua.skill_2", "lengua.skill_2.subskill_2", /ruptura|coherencia|proposito/],
    ["lengua.skill_2", "lengua.skill_2.subskill_3", /conexion|conector|segmento/],
    ["lengua.skill_3", "lengua.skill_3.subskill_1", /redaccion|formato|oracion|funcional/],
    ["lengua.skill_3", "lengua.skill_3.subskill_2", /dato|relevante|seleccion/],
    ["lengua.skill_3", "lengua.skill_3.subskill_3", /revision|claridad|foco/],
    ["lengua.skill_4", "lengua.skill_4.subskill_1", /categoria|gramatical|sustantivo|adjetivo|adverbio/],
    ["lengua.skill_4", "lengua.skill_4.subskill_2", /concordancia/],
    ["lengua.skill_4", "lengua.skill_4.subskill_3", /funcion|sintactica|sujeto|predicado/],
    ["lengua.skill_5", "lengua.skill_5.subskill_1", /tiempo|modo|verbal/],
    ["lengua.skill_5", "lengua.skill_5.subskill_2", /transformacion|voz/],
    ["lengua.skill_5", "lengua.skill_5.subskill_3", /continuidad|cohesion|temporal|anterioridad|posterioridad/],
    ["lengua.skill_6", "lengua.skill_6.subskill_1", /grafia|ortografia|lexica|b\/v|c\/s|s\/z/],
    ["lengua.skill_6", "lengua.skill_6.subskill_2", /acentuacion|tilde|diptongo|hiato|triptongo|silaba/],
    ["lengua.skill_6", "lengua.skill_6.subskill_3", /edicion|correccion|error/],
    ["lengua.skill_7", "lengua.skill_7.subskill_1", /coma|enumeracion|aposicion|insercion/],
    ["lengua.skill_7", "lengua.skill_7.subskill_2", /desambiguacion|sentido|vocativo/],
    ["lengua.skill_7", "lengua.skill_7.subskill_3", /segmentacion|enunciado|punto|mayuscula/],
  ];

  return rules.find(([ruleSkill, , pattern]) => ruleSkill === skillId && pattern.test(key))?.[1] ?? null;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function logSelection(ruleApplied: RuleApplied, exercise: Exercise): void {
  console.log({
    ruleApplied,
    selectedExerciseId: exercise.id,
    skill: exercise.skill,
    subskill: exercise.subskill,
    difficulty: exercise.difficulty,
    masteryLevel: exercise.masteryLevel ?? 1,
  });
}

export function testSelector(): void {
  const mockExercises: Exercise[] = [
    { id: "a", skill: "lengua.skill_1", subskill: "lengua.skill_1.subskill_1", difficulty: 1, masteryLevel: 1 },
    { id: "b", skill: "lengua.skill_1", subskill: "lengua.skill_1.subskill_1", difficulty: 2, masteryLevel: 2 },
    { id: "c", skill: "lengua.skill_1", subskill: "lengua.skill_1.subskill_2", difficulty: 2, masteryLevel: 2 },
  ];

  const selection = selectNextExercise(mockExercises, [
    {
      skill: "lengua.skill_1",
      subskill: "lengua.skill_1.subskill_1",
      accuracy: 1,
      streak: 2,
      attempts: 2,
      lastResult: "correct",
      masteryLevel: 2,
    },
  ]);

  if (!selection.id) {
    throw new Error("Selector returned an invalid exercise");
  }

  console.log("testSelector passed");
}
