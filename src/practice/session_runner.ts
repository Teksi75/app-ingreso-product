import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  getPracticeProgressSnapshot,
  getSeenSkills,
  loadProgressAsync,
  markSkillsSeen,
  markSkillsSeenAsync,
  saveSessionResultAsync,
  saveSessionResult,
  type SessionMode,
  type SkillState,
  type StoredProgress,
} from "../storage/local_progress_store.ts";
import { type ReadingUnit } from "../types/reading_unit.ts";
import {
  listLenguaExerciseFiles,
  loadLenguaSelectionGraph,
  type MasteryNode,
  normalizeSkillId,
  normalizeSubskillId,
  selectNextExerciseDetailed,
  type Difficulty,
  type Exercise as SelectorExercise,
  type MasteryLevel,
  type Result,
  type UserSkillState,
} from "./exercise_selector.ts";

export type { MasteryNode } from "./exercise_selector.ts";
import {
  staticExerciseEngineFiles,
  staticReadingUnits,
  staticContentExercises,
  staticExerciseEngineFileNames,
  staticReadingUnitFileNames,
  staticContentExerciseFileNames,
} from "../data/static_content.ts";

export type Exercise = {
  id: string;
  skill_id: string;
  subskill: string;
  difficulty: Difficulty;
  mastery_level: MasteryLevel;
  type: string;
  text?: string;
  readingUnitId?: string;
  reading_unit_id?: string;
  reading_unit?: ReadingUnit;
  prompt: string;
  options: string[];
  correct_answer: string;
  correct_answers?: string[];
  parts?: ExercisePart[];
  fragment?: string;
  categorization?: CategorizationExercise;
  feedback_correct: string;
  feedback_incorrect: string;
  source_file?: string;
  related_skills: string[];
};

export type ExercisePart = {
  id: string;
  label?: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type CategorizationExercise = {
  categories: string[];
  items: string[];
  answers: Record<string, string>;
};

export type HistoryItem = {
  exercise_id: string;
  readingUnitId?: string;
  reading_unit_id?: string;
  skill_id: string;
  subskill: string;
  difficulty: Difficulty;
  result: Result;
};

type ExerciseFile = {
  metadata?: Record<string, unknown>;
  exercises?: unknown[];
  reading_units?: unknown[];
  readingUnits?: unknown[];
  subskills?: unknown[];
};

type ContentLenguaExerciseFile = {
  readingUnitId?: string;
  exercises?: ContentLenguaExercise[];
};

type ContentLenguaExercise = {
  id: string;
  readingUnitId?: string;
  skill: string;
  subskill?: string;
  difficulty?: unknown;
  mastery_level?: unknown;
  masteryLevel?: unknown;
  type?: string;
  question?: string;
  prompt?: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  correct_answer?: string;
  parts?: ExercisePart[];
  fragment?: string;
  categorization?: CategorizationExercise;
  feedback_correct?: string;
  feedback_incorrect?: string;
  feedbackCorrect?: string;
  feedbackIncorrect?: string;
  related_skills?: unknown;
  relatedSkills?: unknown;
};

type AttemptRecord = {
  step: number;
  exerciseId: string;
  readingUnitId?: string;
  skill: string;
  subskill: string;
  difficulty: Difficulty;
  masteryLevel: MasteryLevel;
  answer: string;
  result: Result;
  ruleApplied: string;
};

type SessionConfig = {
  maxSteps: number;
  datasetPath?: string;
  forceNewStudent?: boolean;
};

type SessionResult = {
  history: AttemptRecord[];
  finalState: UserSkillState[];
  summary: {
    total: number;
    correct: number;
    incorrect: number;
  };
};

export type PracticeSelection = {
  mode: PracticeMode;
  sessionType: PracticeSessionType;
  sessionTitle: string;
  exercise: Exercise;
  exercisePool: Exercise[];
  sessionExercises: Exercise[];
  usedExerciseIds: string[];
  readingUnit?: ReadingUnit;
};

export type ReadingUnitSelection = PracticeSelection & {
  sessionType: "reading-based";
  readingUnit: ReadingUnit;
};

type PracticeSessionOptions = {
  forceNewStudent?: boolean;
  focusSubskill?: string;
  includeReadingUnits?: boolean;
  maxQuestions?: number;
  persistSeenSkills?: boolean;
  progress?: StoredProgress;
  studentCode?: string;
};

export type PracticeMode = "training" | "reading";

export type PracticeSessionType = "reading-based" | "standalone-exercises";

export type PracticeSessionProgressInput = {
  sessionType: PracticeSessionType;
  currentFocus: string;
  skillId: string;
  attempts: number;
  correct: number;
  currentMastery: MasteryLevel;
  readingUnitId?: string;
  focusResults?: PracticeSessionFocusResult[];
};

export type PracticeSessionFocusResult = {
  focusId: string;
  skillId: string;
  attempts: number;
  correct: number;
  currentMastery: MasteryLevel;
};

export type RecommendedSubskill = {
  id: string;
  name: string;
  parentSkill: string;
  masteryLevel: MasteryLevel;
  recommendedMastery: MasteryLevel;
};

export type ReadingUnitCandidate = {
  id: string;
  title: string;
  source: ReadingUnit["source"];
  skillIds: string[];
  exerciseCount: number;
};

export type PracticeSessionProgressResult = {
  masteryLevel: MasteryLevel;
  recommendation: RecommendedSubskill | null;
};

type AnswerProvider = (exercise: Exercise, step: number) => string;

const DEFAULT_MAX_STEPS = 10;
const DEFAULT_PRACTICE_SESSION_SIZE = 10;
const EXERCISE_ENGINE_DIR = resolve(process.cwd(), "docs/04_exercise_engine");
const CONTENT_LENGUA_UNITS_DIR = resolve(process.cwd(), "content/lengua/reading_units");
const CONTENT_LENGUA_EXERCISES_DIR = resolve(process.cwd(), "content/lengua/exercises");

function toSelectorExercise(exercise: Exercise): SelectorExercise {
  return {
    id: exercise.id,
    skill: exercise.skill_id,
    subskill: exercise.subskill,
    difficulty: exercise.difficulty,
    masteryLevel: exercise.mastery_level,
    sourceFile: exercise.source_file,
  };
}

export function loadExercises(path: string): Exercise[] {
  const graph = loadLenguaSelectionGraph();
  const parsed = JSON.parse(readFileSync(path, "utf8")) as ExerciseFile | unknown[];
  const sourceFile = path.split(/[\\/]/).at(-1) ?? path;
  const exercises = normalizeExerciseFile(parsed, sourceFile, graph);

  if (!exercises.length) {
    throw new Error(`No exercises found in ${path}`);
  }

  return exercises;
}

function isFsAvailable(dir: string): boolean {
  try {
    return existsSync(dir);
  } catch {
    return false;
  }
}

export function loadLenguaExercises(baseDir = EXERCISE_ENGINE_DIR): Exercise[] {
  const graph = loadLenguaSelectionGraph(baseDir);
  const useFs = isFsAvailable(baseDir);
  const fileNames = useFs ? listLenguaExerciseFiles(baseDir) : staticExerciseEngineFileNames;

  const exercises = fileNames.flatMap((fileName) => {
    const parsed = useFs
      ? JSON.parse(readFileSync(join(baseDir, fileName), "utf8")) as ExerciseFile | unknown[]
      : staticExerciseEngineFiles[fileName];
    return parsed ? normalizeExerciseFile(parsed as ExerciseFile | unknown[], fileName, graph) : [];
  });

  const contentExercises = loadContentLenguaExercises(graph);
  const merged = [...exercises, ...contentExercises];

  return Array.from(new Map(merged.map((exercise) => [exercise.id, exercise])).values());
}

function loadContentLenguaExercises(graph: ReturnType<typeof loadLenguaSelectionGraph>): Exercise[] {
  const useFs = isFsAvailable(CONTENT_LENGUA_UNITS_DIR) && isFsAvailable(CONTENT_LENGUA_EXERCISES_DIR);
  const readingUnits = new Map<string, ReadingUnit>();

  const unitFileNames = useFs
    ? readdirSync(CONTENT_LENGUA_UNITS_DIR).filter((f) => f.endsWith(".json")).sort()
    : staticReadingUnitFileNames;

  for (const fileName of unitFileNames) {
    const rawUnit = useFs
      ? JSON.parse(readFileSync(join(CONTENT_LENGUA_UNITS_DIR, fileName), "utf8")) as Record<string, unknown>
      : staticReadingUnits[fileName] as Record<string, unknown> | undefined;
    if (!rawUnit) continue;

    const id = normalizeTextField(rawUnit.id);
    if (!id) continue;

    const unit: ReadingUnit = {
      id,
      title: String(rawUnit.title),
      subtitle: normalizeTextField(rawUnit.subtitle),
      text: String(rawUnit.text),
      difficulty: normalizeDifficulty(rawUnit.difficulty),
      textType: normalizeTextType(rawUnit.textType ?? rawUnit.text_type),
      source: normalizeReadingSource(rawUnit.source),
      sourceLabel: normalizeTextField(rawUnit.sourceLabel ?? rawUnit.source_label),
      license: normalizeTextField(rawUnit.license),
      moduleFit: normalizeStringArray(rawUnit.moduleFit ?? rawUnit.module_fit),
      wordCountApprox: normalizeOptionalNumber(rawUnit.wordCountApprox ?? rawUnit.word_count_approx),
      glossary: normalizeGlossary(rawUnit.glossary),
      image: normalizeReadingImage(rawUnit.image),
    };

    readingUnits.set(id, unit);
  }

  const exercises: Exercise[] = [];
  const exerciseFileNames = useFs
    ? readdirSync(CONTENT_LENGUA_EXERCISES_DIR).filter((f) => f.endsWith(".json")).sort()
    : staticContentExerciseFileNames;

  for (const fileName of exerciseFileNames) {
    const parsed = useFs
      ? JSON.parse(readFileSync(join(CONTENT_LENGUA_EXERCISES_DIR, fileName), "utf8")) as ContentLenguaExerciseFile
      : staticContentExercises[fileName] as ContentLenguaExerciseFile | undefined;
    if (!parsed) continue;

    const fileUnitId = normalizeTextField(parsed.readingUnitId);

    for (const rawExercise of parsed.exercises ?? []) {
      const exerciseUnitId = normalizeTextField(rawExercise.readingUnitId ?? fileUnitId);
      const readingUnit = exerciseUnitId ? readingUnits.get(exerciseUnitId) : undefined;
      const skillId = normalizeSkillId(rawExercise.skill, graph);
      const subskillId = normalizeSubskillId(rawExercise.subskill ?? rawExercise.skill, skillId, graph);
      const parts = normalizeExerciseParts(rawExercise.parts);
      const categorization = normalizeCategorization(rawExercise.categorization);
      const correctAnswers = normalizeCorrectAnswers(rawExercise.correctAnswers ?? rawExercise.correctAnswer ?? rawExercise.correct_answer);
      const options = normalizeContentOptions(
        rawExercise.options ?? flattenPartOptions(parts) ?? categorization?.categories,
        correctAnswers,
      );
      const correctAnswer = correctAnswers[0] ?? parts?.[0]?.correctAnswer ?? categorization?.categories[0] ?? "";

      exercises.push({
        id: String(rawExercise.id),
        skill_id: skillId,
        subskill: subskillId,
        difficulty: normalizeDifficulty(rawExercise.difficulty ?? readingUnit?.difficulty),
        mastery_level: normalizeMasteryLevel(rawExercise.mastery_level ?? rawExercise.masteryLevel),
        type: String(rawExercise.type ?? "multiple_choice"),
        text: readingUnit?.text,
        readingUnitId: exerciseUnitId,
        reading_unit_id: exerciseUnitId,
        reading_unit: readingUnit,
        prompt: String(rawExercise.question ?? rawExercise.prompt ?? ""),
        options: ensureContentOptions(options, correctAnswer),
        correct_answer: correctAnswer,
        correct_answers: correctAnswers,
        parts,
        fragment: normalizeTextField(rawExercise.fragment),
        categorization,
        feedback_correct: String(rawExercise.feedback_correct ?? rawExercise.feedbackCorrect ?? "Correcto."),
        feedback_incorrect: String(rawExercise.feedback_incorrect ?? rawExercise.feedbackIncorrect ?? "Incorrecto."),
        source_file: fileName,
        related_skills: normalizeRelatedSkills(rawExercise.related_skills ?? rawExercise.relatedSkills),
      });
    }
  }

  return exercises;
}

function normalizeExerciseFile(
  parsed: ExerciseFile | unknown[],
  sourceFile: string,
  graph: ReturnType<typeof loadLenguaSelectionGraph>,
): Exercise[] {
  if (Array.isArray(parsed)) {
    return parsed.map((exercise) => normalizeExercise(exercise, sourceFile, graph, new Map()));
  }

  const readingUnits = normalizeReadingUnits(parsed.reading_units ?? parsed.readingUnits, sourceFile);

  if (Array.isArray(parsed.exercises)) {
    return parsed.exercises.map((exercise) => normalizeExercise(exercise, sourceFile, graph, readingUnits));
  }

  if (!Array.isArray(parsed.subskills)) {
    return [];
  }

  return parsed.subskills.flatMap((rawSubskill) => {
    const subskill = rawSubskill as {
      skill?: unknown;
      skill_id?: unknown;
      skill_name?: unknown;
      canonical_subskill?: unknown;
      subskill?: unknown;
      exercises?: unknown[];
    };
    const skillId = normalizeSkillId(subskill.skill ?? subskill.skill_id ?? subskill.skill_name, graph);
    const subskillId = normalizeSubskillId(subskill.canonical_subskill ?? subskill.subskill, skillId, graph);

    return (subskill.exercises ?? []).map((exercise) => normalizeExercise(
      { ...(exercise as Record<string, unknown>), skill: skillId, subskill: subskillId },
      sourceFile,
      graph,
      readingUnits,
    ));
  });
}

function normalizeExercise(
  rawExercise: unknown,
  sourceFile: string,
  graph: ReturnType<typeof loadLenguaSelectionGraph>,
  readingUnits: Map<string, ReadingUnit>,
): Exercise {
  const exercise = rawExercise as Record<string, unknown>;
  const metadata = (exercise.metadata ?? {}) as Record<string, unknown>;
  const skillId = normalizeSkillId(exercise.skill ?? exercise.skill_id ?? exercise.skill_name, graph);
  const subskillId = normalizeSubskillId(exercise.subskill ?? exercise.canonical_subskill, skillId, graph);
  const answer = exercise.answer ?? exercise.correct_answer;
  const options = normalizeOptions(exercise.options, answer);
  const correctAnswer = normalizeCorrectAnswer(answer, exercise.options, options, exercise);
  const feedback = normalizeFeedback(exercise);
  const readingUnitId = normalizeTextField(exercise.readingUnitId ?? exercise.reading_unit_id);
  const readingUnit = readingUnitId ? readingUnits.get(readingUnitId) : undefined;

  if (readingUnitId && !readingUnit) {
    throw new Error(`Exercise ${String(exercise.id)} references missing reading unit ${readingUnitId} in ${sourceFile}`);
  }

  return {
    id: String(exercise.id),
    skill_id: skillId,
    subskill: subskillId,
    difficulty: normalizeDifficulty(exercise.difficulty ?? metadata.difficulty ?? metadata.dificultad),
    mastery_level: normalizeMasteryLevel(exercise.mastery_level ?? metadata.mastery_level ?? metadata.mastery_target),
    type: String(exercise.type ?? "multiple_choice"),
    text: normalizeTextField(exercise.text ?? exercise.stem) ?? readingUnit?.text,
    readingUnitId,
    reading_unit_id: readingUnitId,
    reading_unit: readingUnit,
    prompt: String(exercise.prompt ?? ""),
    options: ensureOptions(options, correctAnswer, exercise),
    correct_answer: correctAnswer,
    feedback_correct: feedback.correct,
    feedback_incorrect: feedback.incorrect,
    source_file: sourceFile,
    related_skills: normalizeRelatedSkills(metadata.combines_skills),
  };
}

function normalizeReadingUnits(value: unknown, sourceFile: string): Map<string, ReadingUnit> {
  if (!Array.isArray(value)) {
    return new Map();
  }

  return new Map(value.map((rawUnit) => {
    const unit = rawUnit as Record<string, unknown>;
    const id = normalizeTextField(unit.id);
    const title = normalizeTextField(unit.title);
    const text = normalizeTextField(unit.text);
    const source = unit.source ?? "generated";

    if (!id || !title || !text) {
      throw new Error(`Invalid reading unit in ${sourceFile}: id, title and text are required`);
    }

    if (source !== "generated" && source !== "original_interno") {
      throw new Error(`Reading unit ${id} in ${sourceFile} must use source "generated" or "original_interno"`);
    }

    const normalizedUnit: ReadingUnit = {
      id,
      title,
      text,
      difficulty: normalizeDifficulty(unit.difficulty),
      textType: normalizeTextType(unit.textType ?? unit.text_type),
      source,
      subtitle: normalizeTextField(unit.subtitle),
      sourceLabel: normalizeTextField(unit.sourceLabel ?? unit.source_label),
      license: normalizeTextField(unit.license),
      moduleFit: normalizeStringArray(unit.moduleFit ?? unit.module_fit),
      wordCountApprox: normalizeOptionalNumber(unit.wordCountApprox ?? unit.word_count_approx),
      glossary: normalizeGlossary(unit.glossary),
      image: normalizeReadingImage(unit.image),
    };

    return [
      id,
      normalizedUnit,
    ] as const;
  }));
}

function normalizeTextType(value: unknown): ReadingUnit["textType"] {
  if (value === "biografia") return "biografia";
  if (value === "narrative") return "narrative";
  return "informative";
}

function evaluateAnswer(exercise: Exercise, answer: string): Result {
  return answer === exercise.correct_answer ? "correct" : "incorrect";
}

function buildUserState(history: AttemptRecord[]): UserSkillState[] {
  const keys = Array.from(new Set(history.map((item) => `${item.skill}|${item.subskill}`)));

  return keys.map((key) => {
    const [skill, subskill] = key.split("|");
    const relevant = history.filter((item) => item.skill === skill && item.subskill === subskill);
    const correct = relevant.filter((item) => item.result === "correct").length;
    const accuracy = relevant.length > 0 ? correct / relevant.length : 0;

    return {
      skill,
      subskill,
      accuracy,
      streak: computeStreak(relevant),
      attempts: relevant.length,
      lastResult: relevant[relevant.length - 1].result,
      masteryLevel: computeMasteryLevel(accuracy, relevant.length),
    };
  });
}

function buildMasteryBySkill(userState: UserSkillState[]): Record<string, MasteryLevel> {
  const masteryBySkill: Record<string, MasteryLevel> = {};

  for (const state of userState) {
    masteryBySkill[state.subskill] = state.masteryLevel ?? 1;
    masteryBySkill[state.skill] = Math.max(
      masteryBySkill[state.skill] ?? 1,
      state.masteryLevel ?? 1,
    ) as MasteryLevel;
  }

  return masteryBySkill;
}

function computeStreak(history: AttemptRecord[]): number {
  let streak = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].result === "correct") {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function computeMasteryLevel(accuracy: number, attempts: number): MasteryLevel {
  if (attempts >= 4 && accuracy >= 0.9) return 4;
  if (attempts >= 3 && accuracy >= 0.75) return 3;
  if (attempts >= 2 && accuracy >= 0.4) return 2;
  return 1;
}

function clampMasteryLevel(value: number | undefined): MasteryLevel {
  if (value && value >= 4) return 4;
  if (value && value >= 3) return 3;
  if (value && value >= 2) return 2;
  return 1;
}

function getSkillState(masteryLevel: MasteryLevel): SkillState {
  if (masteryLevel >= 3) {
    return "mastered";
  }

  if (masteryLevel === 2) {
    return "developing";
  }

  return "weak";
}

function getStoredSessionMode(sessionType: PracticeSessionType): SessionMode {
  return sessionType === "reading-based" ? "reading" : "practice";
}

function calculateUpdatedMastery(input: PracticeSessionProgressInput): MasteryLevel {
  const accuracy = input.attempts > 0 ? input.correct / input.attempts : 0;
  const delta = accuracy >= 0.8 ? 1 : accuracy < 0.5 ? -1 : 0;
  return clampMasteryLevel(input.currentMastery + delta);
}

function getPracticeSelectionContext(forceNewStudent = false, progress?: StoredProgress): {
  seenSkills: string[];
  masteryByFocus: Record<string, MasteryLevel>;
} {
  if (forceNewStudent) {
    return {
      seenSkills: [],
      masteryByFocus: {},
    };
  }

  const snapshot = getPracticeProgressSnapshot(progress);

  return {
    seenSkills: snapshot.seenSkills,
    masteryByFocus: Object.fromEntries(
      Object.entries(snapshot.masteryByFocus).map(([skillId, masteryLevel]) => [
        skillId,
        clampMasteryLevel(masteryLevel),
      ]),
    ),
  };
}

function buildPlannedSessionExercises(
  exercises: Exercise[],
  usedExerciseIds: string[],
  options: {
    focusSubskill?: string;
    forceNewStudent?: boolean;
    maxQuestions?: number;
    progress?: StoredProgress;
  },
): { sessionExercises: Exercise[]; activeUsedExerciseIds: string[] } {
  const graph = loadLenguaSelectionGraph();
  const maxQuestions = Math.min(options.maxQuestions ?? DEFAULT_PRACTICE_SESSION_SIZE, exercises.length);
  const focusedPool = options.focusSubskill
    ? exercises.filter((exercise) => exercise.subskill === options.focusSubskill)
    : exercises;
  const basePool = focusedPool.length > 0 ? focusedPool : exercises;
  const unusedExercises = basePool.filter((exercise) => !usedExerciseIds.includes(exercise.id));
  const activePool = unusedExercises.length > 0 ? unusedExercises : basePool;
  const activeUsedExerciseIds = unusedExercises.length > 0 ? usedExerciseIds : [];
  const context = getPracticeSelectionContext(options.forceNewStudent, options.progress);
  const coveredSkills = new Set<string>(context.seenSkills);
  const plannedUsedIds = new Set<string>(activeUsedExerciseIds);
  const sessionExercises: Exercise[] = [];

  while (sessionExercises.length < maxQuestions) {
    const selectionPool = activePool.filter((exercise) => !plannedUsedIds.has(exercise.id));

    if (selectionPool.length === 0) {
      break;
    }

    const selection = selectNextExerciseDetailed(
      selectionPool.map(toSelectorExercise),
      [],
      {
        seenSkills: Array.from(coveredSkills),
        hasSeenSkill: (skillId: string) => coveredSkills.has(skillId),
        usedExerciseIds: Array.from(plannedUsedIds),
        masteryBySkill: context.masteryByFocus,
        selectionGraph: graph,
      },
    );
    const exercise = findExercise(activePool, selection.exercise);
    sessionExercises.push(exercise);
    plannedUsedIds.add(exercise.id);
    coveredSkills.add(exercise.skill_id);
  }

  return {
    sessionExercises,
    activeUsedExerciseIds,
  };
}

function buildReadingBlockSessionExercises(
  exercises: Exercise[],
  usedExerciseIds: string[],
  focusSubskill?: string,
): { sessionExercises: Exercise[]; activeUsedExerciseIds: string[] } {
  const focusedPool = focusSubskill
    ? exercises.filter((exercise) => exercise.subskill === focusSubskill)
    : exercises;
  const basePool = focusedPool.length > 0 ? focusedPool : exercises;
  const unusedExercises = basePool.filter((exercise) => !usedExerciseIds.includes(exercise.id));

  return {
    sessionExercises: unusedExercises.length > 0 ? unusedExercises : basePool,
    activeUsedExerciseIds: unusedExercises.length > 0 ? usedExerciseIds : [],
  };
}

function getReadingUnitForPool(exercises: Exercise[]): ReadingUnit | undefined {
  const readingUnit = exercises[0]?.reading_unit;

  if (!readingUnit) {
    return undefined;
  }

  return exercises.every((exercise) => exercise.reading_unit?.id === readingUnit.id)
    ? readingUnit
    : undefined;
}

function buildReadingUnitCandidates(exercises: Exercise[]): ReadingUnitCandidate[] {
  const byUnit = new Map<string, ReadingUnitCandidate>();

  for (const exercise of exercises) {
    const readingUnit = exercise.reading_unit;

    if (!readingUnit) {
      continue;
    }

    const previous = byUnit.get(readingUnit.id);

    byUnit.set(readingUnit.id, {
      id: readingUnit.id,
      title: readingUnit.title,
      source: readingUnit.source,
      exerciseCount: (previous?.exerciseCount ?? 0) + 1,
      skillIds: Array.from(new Set([
        ...(previous?.skillIds ?? []),
        exercise.skill_id,
      ])).sort((left, right) => left.localeCompare(right)),
    });
  }

  return [...byUnit.values()];
}

function compareReadingUnitCandidates(
  left: ReadingUnitCandidate,
  right: ReadingUnitCandidate,
  preferredSkillId: string | null,
): number {
  const leftMatches = preferredSkillId && left.skillIds.includes(preferredSkillId) ? 0 : 1;
  const rightMatches = preferredSkillId && right.skillIds.includes(preferredSkillId) ? 0 : 1;
  const leftSourceRank = left.source === "original_interno" ? 0 : 1;
  const rightSourceRank = right.source === "original_interno" ? 0 : 1;

  return leftMatches - rightMatches ||
    leftSourceRank - rightSourceRank ||
    right.exerciseCount - left.exerciseCount ||
    left.title.localeCompare(right.title);
}

export function getReadingUnitCandidates(): ReadingUnitCandidate[] {
  return buildReadingUnitCandidates(loadLenguaExercises())
    .sort((left, right) => compareReadingUnitCandidates(left, right, null));
}

export function pickReadingUnitCandidate(preferredSkillId: string | null): ReadingUnitCandidate | null {
  return [...getReadingUnitCandidates()]
    .sort((left, right) => compareReadingUnitCandidates(left, right, preferredSkillId))[0] ?? null;
}

function createPracticeSelection(
  mode: PracticeMode,
  exercisePool: Exercise[],
  sessionExercises: Exercise[],
  usedExerciseIds: string[],
): PracticeSelection {
  const exercise = sessionExercises[0];

  if (!exercise) {
    throw new Error("No exercise available for practice session");
  }

  const readingUnit = getReadingUnitForPool(exercisePool);

  return {
    mode,
    sessionType: readingUnit ? "reading-based" : "standalone-exercises",
    sessionTitle: readingUnit ? readingUnit.title : "Entrenamiento de habilidades",
    exercise,
    exercisePool,
    sessionExercises,
    usedExerciseIds,
    readingUnit,
  };
}

export function getLenguaMasteryMap(): MasteryNode[] {
  return loadLenguaSelectionGraph().masteryMap;
}

export function recommendNextPracticeSubskill({
  currentFocus,
  masteryByFocus,
}: {
  currentFocus: string;
  masteryByFocus: Record<string, number>;
}): RecommendedSubskill | null {
  const graph = loadLenguaSelectionGraph();
  const currentNode = graph.masteryById.get(currentFocus);
  const candidates = graph.relationships
    .filter((relationship) => relationship.skill_origen === currentFocus)
    .map((relationship) => ({
      relationship,
      node: graph.masteryById.get(relationship.skill_destino),
    }))
    .filter((candidate): candidate is { relationship: typeof graph.relationships[number]; node: MasteryNode } => (
      Boolean(candidate.node)
    ))
    .sort((left, right) => getRelationshipRank(left.relationship) - getRelationshipRank(right.relationship));

  const selected = candidates.find(({ node }) => (
    clampMasteryLevel(masteryByFocus[node.id]) < node.recommended_mastery
  ))?.node ?? candidates[0]?.node ?? currentNode ?? null;

  if (!selected) {
    return null;
  }

  const subskill = selected.type === "subskill"
    ? selected
    : graph.masteryMap.find((node) => (
      node.type === "subskill" &&
      node.parent_skill === selected.id &&
      clampMasteryLevel(masteryByFocus[node.id]) < node.recommended_mastery
    )) ?? selected;

  return {
    id: subskill.id,
    name: subskill.name,
    parentSkill: subskill.parent_skill ?? subskill.id,
    masteryLevel: clampMasteryLevel(masteryByFocus[subskill.id]),
    recommendedMastery: subskill.recommended_mastery,
  };
}

function getRelationshipRank(relationship: ReturnType<typeof loadLenguaSelectionGraph>["relationships"][number]): number {
  const typeRank = relationship.tipo === "sequential" ? 0 : relationship.tipo === "prerequisite" ? 1 : 2;
  const forceRank = relationship.fuerza === "alta" ? 0 : relationship.fuerza === "media" ? 1 : 2;

  return typeRank * 10 + forceRank;
}

export async function savePracticeSessionProgress(
  input: PracticeSessionProgressInput,
  studentCode?: string,
): Promise<PracticeSessionProgressResult> {
  "use server";

  const focusResults = normalizePracticeSessionFocusResults(input);
  const activeFocus = focusResults.find((focus) => focus.focusId === input.currentFocus) ?? focusResults[0];
  const masteryLevel = calculateUpdatedMastery({
    ...input,
    attempts: activeFocus?.attempts ?? input.attempts,
    correct: activeFocus?.correct ?? input.correct,
    currentMastery: activeFocus?.currentMastery ?? input.currentMastery,
  });
  const skillState = getSkillState(masteryLevel);
  const progress = await saveSessionResultAsync(
    {
      mode: getStoredSessionMode(input.sessionType),
      total_attempts: input.attempts,
      total_correct: input.correct,
      total_errors: input.attempts - input.correct,
      skill_results: buildSessionSkillResults(focusResults),
      readingUnitId: input.readingUnitId,
    },
    studentCode,
  );
  const snapshot = getPracticeProgressSnapshot(progress);

  return {
    masteryLevel,
    recommendation: recommendNextPracticeSubskill({
      currentFocus: input.currentFocus,
      masteryByFocus: snapshot.masteryByFocus,
    }),
  };
}

function normalizePracticeSessionFocusResults(
  input: PracticeSessionProgressInput,
): PracticeSessionFocusResult[] {
  if (!input.focusResults || input.focusResults.length === 0) {
    return [{
      focusId: input.currentFocus,
      skillId: input.skillId,
      attempts: input.attempts,
      correct: input.correct,
      currentMastery: input.currentMastery,
    }];
  }

  const byFocus = new Map<string, PracticeSessionFocusResult>();

  for (const focusResult of input.focusResults) {
    const previous = byFocus.get(focusResult.focusId);

    byFocus.set(focusResult.focusId, {
      focusId: focusResult.focusId,
      skillId: focusResult.skillId,
      attempts: (previous?.attempts ?? 0) + focusResult.attempts,
      correct: (previous?.correct ?? 0) + focusResult.correct,
      currentMastery: clampMasteryLevel(Math.max(previous?.currentMastery ?? 1, focusResult.currentMastery)),
    });
  }

  return [...byFocus.values()];
}

function buildSessionSkillResults(
  focusResults: PracticeSessionFocusResult[],
): Array<{
  skill_id: string;
  attempts: number;
  correct: number;
  state: SkillState;
  mastery_level: MasteryLevel;
}> {
  const bySkill = new Map<string, PracticeSessionFocusResult>();

  for (const focusResult of focusResults) {
    const previous = bySkill.get(focusResult.skillId);

    bySkill.set(focusResult.skillId, {
      focusId: focusResult.skillId,
      skillId: focusResult.skillId,
      attempts: (previous?.attempts ?? 0) + focusResult.attempts,
      correct: (previous?.correct ?? 0) + focusResult.correct,
      currentMastery: clampMasteryLevel(Math.max(previous?.currentMastery ?? 1, focusResult.currentMastery)),
    });
  }

  const toStoredResult = (entry: PracticeSessionFocusResult) => {
    const mastery_level = calculateUpdatedMastery({
      sessionType: "standalone-exercises",
      currentFocus: entry.focusId,
      skillId: entry.skillId,
      attempts: entry.attempts,
      correct: entry.correct,
      currentMastery: entry.currentMastery,
    });

    return {
      skill_id: entry.focusId,
      attempts: entry.attempts,
      correct: entry.correct,
      state: getSkillState(mastery_level),
      mastery_level,
    };
  };

  return [
    ...[...bySkill.values()].map(toStoredResult),
    ...focusResults.map(toStoredResult),
  ];
}

function findExercise(fullExercises: Exercise[], selectorExercise: SelectorExercise): Exercise {
  const found = fullExercises.find((exercise) => exercise.id === selectorExercise.id);

  if (!found) {
    throw new Error(`Exercise ${selectorExercise.id} not found in full dataset`);
  }

  return found;
}

export function runSession(
  fullExercises: Exercise[],
  answerProvider: AnswerProvider,
  config?: Partial<SessionConfig>,
): SessionResult {
  const maxSteps = config?.maxSteps ?? DEFAULT_MAX_STEPS;
  const graph = loadLenguaSelectionGraph();
  const allSelectorExercises = fullExercises.map(toSelectorExercise);
  const history: AttemptRecord[] = [];
  const usedExerciseIds: Set<string> = new Set();
  const forceNewStudent = config?.forceNewStudent ?? false;
  const coveredSkills: Set<string> = new Set(forceNewStudent ? [] : getSeenSkills());
  let userState: UserSkillState[] = [];

  console.log("=== SESION DE PRACTICA ===");
  console.log(`Ejercicios disponibles: ${fullExercises.length}`);
  console.log(`Pasos configurados: ${maxSteps}`);
  console.log("");

  const availableExercises = (): SelectorExercise[] => {
    const filtered = allSelectorExercises.filter((exercise) => !usedExerciseIds.has(exercise.id));
    return filtered.length > 0 ? filtered : allSelectorExercises;
  };

  const selectNext = (): ReturnType<typeof selectNextExerciseDetailed> => {
    const available = availableExercises();
    return selectNextExerciseDetailed(available, userState, {
      seenSkills: Array.from(coveredSkills),
      hasSeenSkill: (skillId: string) => coveredSkills.has(skillId),
      lastExerciseId: history.at(-1)?.exerciseId,
      usedExerciseIds: Array.from(usedExerciseIds),
      masteryBySkill: buildMasteryBySkill(userState),
      selectionGraph: graph,
    });
  };

  const firstSelection = selectNext();
  let currentSelectorExercise = firstSelection.exercise;
  let lastRuleApplied = firstSelection.ruleApplied;

  for (let step = 1; step <= maxSteps; step += 1) {
    const currentFull = findExercise(fullExercises, currentSelectorExercise);
    usedExerciseIds.add(currentFull.id);
    coveredSkills.add(currentFull.skill_id);

    if (!forceNewStudent) {
      markSkillsSeen([currentFull.skill_id]);
    }

    const answer = answerProvider(currentFull, step);
    const result = evaluateAnswer(currentFull, answer);
    const feedback =
      result === "correct" ? currentFull.feedback_correct : currentFull.feedback_incorrect;

    console.log(`--- Paso ${step} ---`);
    console.log(`  Ejercicio: ${currentFull.id}`);
    if (currentFull.reading_unit_id) {
      console.log(`  ReadingUnit: ${currentFull.reading_unit_id}`);
    }
    console.log(`  Skill: ${currentFull.skill_id} > ${currentFull.subskill}`);
    console.log(`  Dificultad: ${currentFull.difficulty}`);
    console.log(`  Mastery: ${currentFull.mastery_level}`);
    console.log(`  Regla aplicada: ${lastRuleApplied}`);
    console.log(`  Respuesta: ${answer}`);
    console.log(`  Resultado: ${result === "correct" ? "Correcto" : "Incorrecto"}`);
    console.log(`  Feedback: ${feedback}`);

    history.push({
      step,
      exerciseId: currentFull.id,
      readingUnitId: currentFull.reading_unit_id,
      skill: currentFull.skill_id,
      subskill: currentFull.subskill,
      difficulty: currentFull.difficulty,
      masteryLevel: currentFull.mastery_level,
      answer,
      result,
      ruleApplied: lastRuleApplied,
    });

    userState = buildUserState(history);

    if (step < maxSteps) {
      const selection = selectNext();
      currentSelectorExercise = selection.exercise;
      lastRuleApplied = selection.ruleApplied;
    }
  }

  const totalCorrect = history.filter((item) => item.result === "correct").length;
  const totalIncorrect = history.length - totalCorrect;

  console.log("");
  console.log("=== RESUMEN ===");
  console.log(`Total ejercicios: ${history.length}`);
  console.log(`Correctos: ${totalCorrect}`);
  console.log(`Incorrectos: ${totalIncorrect}`);
  console.log(`Precision general: ${history.length > 0 ? Math.round((totalCorrect / history.length) * 100) : 0}%`);

  for (const state of userState) {
    console.log(
      `  [${state.skill}/${state.subskill}] accuracy=${Math.round(state.accuracy * 100)}%, mastery=${state.masteryLevel}, streak=${state.streak}, lastResult=${state.lastResult}`,
    );
  }

  return {
    history,
    finalState: userState,
    summary: {
      total: history.length,
      correct: totalCorrect,
      incorrect: totalIncorrect,
    },
  };
}

export function runDeterministicSession(config?: Partial<SessionConfig>): SessionResult {
  const fullExercises = config?.datasetPath ? loadExercises(config.datasetPath) : loadLenguaExercises();
  const deterministicAnswer: AnswerProvider = (exercise) => exercise.correct_answer;

  return runSession(fullExercises, deterministicAnswer, config);
}

export function runMixedSession(config?: Partial<SessionConfig>): SessionResult {
  const fullExercises = config?.datasetPath ? loadExercises(config.datasetPath) : loadLenguaExercises();

  const mixedAnswer: AnswerProvider = (exercise, step) => {
    if (step <= 3) return exercise.correct_answer;
    if (step <= 5) return exercise.options.find((option) => option !== exercise.correct_answer) ?? exercise.correct_answer;
    return exercise.correct_answer;
  };

  return runSession(fullExercises, mixedAnswer, config);
}

export function startPracticeSession(
  skillId: string | null,
  usedExerciseIds: string[] = [],
  options: PracticeSessionOptions = {},
): PracticeSelection {
  const exercises = loadLenguaExercises();
  const graph = loadLenguaSelectionGraph();
  const canonicalSkillId = skillId ? normalizeSkillId(skillId, graph) : null;

  const skillFilter = canonicalSkillId
    ? (e: Exercise) => e.skill_id === canonicalSkillId
    : () => true;

  const filtered = exercises.filter(skillFilter);
  const basePool = filtered.length > 0 ? filtered : exercises;
  const includeReadingUnits = options.includeReadingUnits ?? true;
  const standalonePool = basePool.filter((exercise) => !exercise.readingUnitId);
  const trainingSourcePool = includeReadingUnits || standalonePool.length === 0 ? exercises : standalonePool;
  const startingPool = canonicalSkillId && includeReadingUnits
    ? buildSkillTrainingPool(trainingSourcePool, usedExerciseIds, skillFilter)
    : trainingSourcePool.filter(skillFilter);
  const activeStartingPool = startingPool.length > 0 ? startingPool : trainingSourcePool;

  const readingUnit = getReadingUnitForPool(activeStartingPool);
  const { sessionExercises, activeUsedExerciseIds } = readingUnit
    ? buildReadingBlockSessionExercises(activeStartingPool, usedExerciseIds, options.focusSubskill)
    : buildPlannedSessionExercises(
      activeStartingPool,
      usedExerciseIds,
      {
        focusSubskill: options.focusSubskill,
        forceNewStudent: options.forceNewStudent,
        maxQuestions: options.maxQuestions,
        progress: options.progress,
      },
    );
  const session = createPracticeSelection(
    "training",
    activeStartingPool,
    sessionExercises,
    [...activeUsedExerciseIds, sessionExercises[0]?.id].filter((value): value is string => Boolean(value)),
  );

  if (!options.forceNewStudent && options.persistSeenSkills !== false) {
    markSkillsSeen([session.exercise.skill_id]);
  }

  return session;
}

export async function startPracticeSessionAsync(
  skillId: string | null,
  usedExerciseIds: string[] = [],
  options: PracticeSessionOptions = {},
): Promise<PracticeSelection> {
  const progress = options.forceNewStudent ? undefined : await loadProgressAsync(options.studentCode);
  const session = startPracticeSession(skillId, usedExerciseIds, {
    ...options,
    persistSeenSkills: false,
    progress,
  });

  if (!options.forceNewStudent) {
    await markSkillsSeenAsync([session.exercise.skill_id], options.studentCode);
  }

  return session;
}

function buildSkillTrainingPool(
  basePool: Exercise[],
  usedExerciseIds: string[],
  skillFilter: (exercise: Exercise) => boolean,
): Exercise[] {
  const readingExercises = basePool.filter((exercise) => Boolean(exercise.readingUnitId) && skillFilter(exercise));
  const standaloneExercises = basePool.filter((exercise) => !exercise.readingUnitId && skillFilter(exercise));

  if (readingExercises.length === 0) {
    return standaloneExercises.length > 0 ? standaloneExercises : basePool;
  }

  const usedIds = new Set(usedExerciseIds);
  const usedReadingUnitIds = readingExercises
    .filter((exercise) => usedIds.has(exercise.id))
    .map((exercise) => exercise.readingUnitId)
    .filter((readingUnitId): readingUnitId is string => Boolean(readingUnitId));
  const candidateUnitIds = [
    ...usedReadingUnitIds,
    ...readingExercises
      .map((exercise) => exercise.readingUnitId)
      .filter((readingUnitId): readingUnitId is string => Boolean(readingUnitId))
      .sort((left, right) => (
        countReadingUnitExercises(readingExercises, right) - countReadingUnitExercises(readingExercises, left) ||
        left.localeCompare(right)
      )),
  ];

  for (const readingUnitId of Array.from(new Set(candidateUnitIds))) {
    const unitExercises = basePool
      .filter((exercise) => exercise.readingUnitId === readingUnitId)
      .sort((left, right) => left.difficulty - right.difficulty || left.id.localeCompare(right.id));
    const hasUnused = unitExercises.some((exercise) => !usedIds.has(exercise.id));

    if (hasUnused) {
      return unitExercises;
    }
  }

  return standaloneExercises.length > 0 ? standaloneExercises : basePool;
}

function countReadingUnitExercises(exercises: Exercise[], readingUnitId: string): number {
  return exercises.filter((exercise) => exercise.readingUnitId === readingUnitId).length;
}

export function startReadingUnitSession(
  readingUnitId: string | null = null,
  usedExerciseIds: string[] = [],
  options: PracticeSessionOptions = {},
): ReadingUnitSelection {
  const exercises = loadLenguaExercises();
  const readingExercises = exercises.filter((exercise) => exercise.reading_unit);

  if (readingExercises.length === 0) {
    throw new Error("No reading unit exercises available");
  }

  const selectedUnitId = readingUnitId ?? pickReadingUnitCandidate(null)?.id ?? readingExercises
    .map((exercise) => exercise.reading_unit_id)
    .filter((id): id is string => Boolean(id))
    .sort()[0];
  const startingPool = readingExercises.filter((exercise) => exercise.reading_unit_id === selectedUnitId);

  if (startingPool.length === 0) {
    throw new Error(`Reading unit ${selectedUnitId} has no exercises`);
  }
  const readingUnit = startingPool[0].reading_unit;

  if (!readingUnit) {
    throw new Error(`Reading unit ${selectedUnitId} could not be resolved`);
  }

  const { sessionExercises, activeUsedExerciseIds } = buildReadingBlockSessionExercises(
    startingPool,
    usedExerciseIds,
    options.focusSubskill,
  );
  const session = createPracticeSelection(
    "reading",
    startingPool,
    sessionExercises,
    [...activeUsedExerciseIds, sessionExercises[0]?.id].filter((value): value is string => Boolean(value)),
  );

  if (!options.forceNewStudent && options.persistSeenSkills !== false) {
    markSkillsSeen([session.exercise.skill_id]);
  }

  return {
    ...session,
    sessionType: "reading-based",
    readingUnit,
  };
}

export async function startReadingUnitSessionAsync(
  readingUnitId: string | null,
  usedExerciseIds: string[] = [],
  options: PracticeSessionOptions = {},
): Promise<ReadingUnitSelection> {
  const progress = options.forceNewStudent ? undefined : await loadProgressAsync(options.studentCode);
  const session = startReadingUnitSession(readingUnitId, usedExerciseIds, {
    ...options,
    persistSeenSkills: false,
    progress,
  });

  if (!options.forceNewStudent) {
    await markSkillsSeenAsync([session.exercise.skill_id], options.studentCode);
  }

  return session;
}

function normalizeOptions(rawOptions: unknown, answer: unknown): string[] {
  if (Array.isArray(rawOptions)) {
    return rawOptions.map((option) => {
      if (typeof option === "string") {
        return option;
      }

      const objectOption = option as { text?: unknown; id?: unknown };
      return String(objectOption.text ?? objectOption.id ?? "");
    }).filter(Boolean);
  }

  if (typeof answer === "string") {
    return [answer];
  }

  return [];
}

function normalizeCorrectAnswer(
  answer: unknown,
  rawOptions: unknown,
  options: string[],
  exercise: Record<string, unknown>,
): string {
  if (typeof answer === "string") {
    if (Array.isArray(rawOptions)) {
      const matchingObject = rawOptions.find((option) => (
        typeof option === "object" &&
        option !== null &&
        String((option as { id?: unknown }).id) === answer
      )) as { text?: unknown } | undefined;

      if (matchingObject?.text) {
        return String(matchingObject.text);
      }
    }

    const matchingOption = options.find((option) => option === answer);
    return matchingOption ?? options[0] ?? answer;
  }

  if (Array.isArray(answer)) {
    return formatAnswerArray(answer, exercise);
  }

  if (typeof answer === "object" && answer !== null) {
    return formatAnswerObject(answer as Record<string, unknown>, exercise);
  }

  const acceptedAnswer = [
    ...normalizeStringArray(exercise.accepted_answers),
    ...normalizeStringArray(exercise.acceptable_answers),
  ][0];

  if (acceptedAnswer) {
    return acceptedAnswer;
  }

  return options[0] ?? "";
}

function ensureOptions(options: string[], correctAnswer: string, exercise: Record<string, unknown>): string[] {
  const fromAccepted = [
    ...normalizeStringArray(exercise.accepted_answers),
    ...normalizeStringArray(exercise.acceptable_answers),
  ];
  const generated = buildGeneratedOptions(correctAnswer, exercise);
  const merged = Array.from(new Set(
    [...options, correctAnswer, ...fromAccepted, ...generated]
      .map((option) => option.trim())
      .filter(Boolean),
  ));

  if (merged.length >= 2) {
    return merged;
  }

  return Array.from(new Set([correctAnswer, "No corresponde"].filter(Boolean)));
}

function buildGeneratedOptions(correctAnswer: string, exercise: Record<string, unknown>): string[] {
  const type = String(exercise.type ?? "");

  if (type === "ordering" && Array.isArray(exercise.answer)) {
    return buildOrderingOptions(exercise.answer, exercise);
  }

  if (typeof exercise.answer === "object" && exercise.answer !== null && !Array.isArray(exercise.answer)) {
    return buildObjectAnswerOptions(exercise.answer as Record<string, unknown>, exercise);
  }

  if (type === "highlight_selection") {
    return buildHighlightOptions(correctAnswer, exercise);
  }

  return buildFallbackOptions(correctAnswer, exercise);
}

function buildOrderingOptions(answer: unknown[], exercise: Record<string, unknown>): string[] {
  const values = answer.map((item) => resolveItemLabel(item, exercise)).filter(Boolean);

  if (values.length < 2) {
    return [];
  }

  const swapped = [...values];
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];

  return [
    values.join(" | "),
    swapped.join(" | "),
    [...values].reverse().join(" | "),
  ];
}

function buildObjectAnswerOptions(
  answer: Record<string, unknown>,
  exercise: Record<string, unknown>,
): string[] {
  const keys = Object.keys(answer);

  if (!keys.length) {
    return [];
  }

  if (keys.every((key) => typeof answer[key] === "string")) {
    const values = keys.map((key) => String(answer[key]));

    if (values.length < 2) {
      return [];
    }

    const rotated = keys.reduce<Record<string, string>>((accumulator, key, index) => {
      accumulator[key] = values[(index + 1) % values.length];
      return accumulator;
    }, {});

    return [
      formatAnswerObject(answer, exercise),
      formatAnswerObject(rotated, exercise),
    ];
  }

  if (keys.every((key) => Array.isArray(answer[key]))) {
    const groups = keys.map((key) => answer[key] as unknown[]);

    if (groups.length < 2) {
      return [];
    }

    const swapped = keys.reduce<Record<string, unknown[]>>((accumulator, key, index) => {
      accumulator[key] = groups[(index + 1) % groups.length];
      return accumulator;
    }, {});

    return [
      formatAnswerObject(answer, exercise),
      formatAnswerObject(swapped, exercise),
    ];
  }

  return [formatAnswerObject(answer, exercise)];
}

function buildHighlightOptions(correctAnswer: string, exercise: Record<string, unknown>): string[] {
  const tokens = normalizeStringArray(exercise.tokens);
  const items = normalizeStringArray(exercise.items);
  const candidates = tokens.length > 0 ? tokens : items;

  if (!candidates.length) {
    return [];
  }

  const correctParts = new Set(correctAnswer.split(" | ").map((item) => item.trim()));
  const wrong = candidates.filter((item) => !correctParts.has(item));

  return [
    correctAnswer,
    wrong.slice(0, Math.max(1, correctParts.size)).join(" | "),
    candidates.slice(0, Math.max(1, correctParts.size)).join(" | "),
  ];
}

function buildFallbackOptions(correctAnswer: string, exercise: Record<string, unknown>): string[] {
  const values = [...normalizeStringArray(exercise.items), ...normalizeStringArray(exercise.tokens)]
    .map((item) => resolveItemLabel(item, exercise))
    .filter((item) => item && item !== correctAnswer);

  const alternatives = [oppositeShortAnswer(correctAnswer), removeAccents(correctAnswer), ...values]
    .filter((option): option is string => Boolean(option && option !== correctAnswer));

  return [correctAnswer, ...alternatives, "No corresponde"];
}

function formatAnswerArray(answer: unknown[], exercise: Record<string, unknown>): string {
  if (answer.length === 0) {
    return "No corresponde";
  }

  return answer.map((item) => resolveItemLabel(item, exercise)).join(" | ");
}

function formatAnswerObject(answer: Record<string, unknown>, exercise: Record<string, unknown>): string {
  return Object.entries(answer)
    .map(([key, value]) => `${key}: ${formatAnswerValue(value, exercise)}`)
    .join("; ");
}

function formatAnswerValue(value: unknown, exercise: Record<string, unknown>): string {
  if (Array.isArray(value)) {
    return value.map((item) => resolveItemLabel(item, exercise)).join(", ");
  }

  if (typeof value === "object" && value !== null) {
    return formatAnswerObject(value as Record<string, unknown>, exercise);
  }

  return resolveItemLabel(value, exercise);
}

function resolveItemLabel(value: unknown, exercise: Record<string, unknown>): string {
  const rawValue = String(value);
  const items = Array.isArray(exercise.items) ? exercise.items : [];
  const matchingItem = items.find((item) => (
    typeof item === "object" &&
    item !== null &&
    String((item as { id?: unknown }).id) === rawValue
  )) as { text?: unknown } | undefined;

  return String(matchingItem?.text ?? rawValue);
}

function oppositeShortAnswer(answer: string): string | undefined {
  const opposites: Record<string, string> = {
    b: "v",
    v: "b",
    c: "s",
    s: "c",
    z: "s",
  };

  return opposites[answer.toLowerCase()];
}

function removeAccents(value: string): string | undefined {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized === value ? undefined : normalized;
}

function normalizeFeedback(exercise: Record<string, unknown>): { correct: string; incorrect: string } {
  const feedback = (exercise.feedback ?? {}) as Record<string, unknown>;

  return {
    correct: String(exercise.feedback_correct ?? feedback.correct ?? feedback.correcto ?? "Correcto."),
    incorrect: String(exercise.feedback_incorrect ?? feedback.incorrect ?? feedback.incorrecto ?? "Incorrecto."),
  };
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeRelatedSkills(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeTextField(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeContentOptions(options: unknown, correctAnswer: unknown): string[] {
  if (Array.isArray(options)) {
    return options.map((o) => String(o)).filter(Boolean);
  }

  const answers = normalizeCorrectAnswers(correctAnswer);
  if (answers.length > 0) {
    return answers;
  }

  return [];
}

function ensureContentOptions(options: string[], correctAnswer: string): string[] {
  return Array.from(new Set([...options, correctAnswer].filter(Boolean)));
}

function normalizeReadingSource(value: unknown): ReadingUnit["source"] {
  return value === "original_interno" ? "original_interno" : "generated";
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function normalizeCorrectAnswers(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function normalizeExerciseParts(value: unknown): ExercisePart[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const parts = value.map((part, index) => {
    const rawPart = part as Record<string, unknown>;
    const options = Array.isArray(rawPart.options)
      ? rawPart.options.map((option) => String(option)).filter(Boolean)
      : [];

    return {
      id: String(rawPart.id ?? index + 1),
      label: normalizeTextField(rawPart.label),
      question: String(rawPart.question ?? ""),
      options,
      correctAnswer: String(rawPart.correctAnswer ?? ""),
    };
  }).filter((part) => part.question && part.options.length > 0 && part.correctAnswer);

  return parts.length > 0 ? parts : undefined;
}

function flattenPartOptions(parts: ExercisePart[] | undefined): string[] | undefined {
  if (!parts) {
    return undefined;
  }

  return parts.flatMap((part) => part.options);
}

function normalizeCategorization(value: unknown): CategorizationExercise | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const categories = normalizeStringArray(raw.categories);
  const items = normalizeStringArray(raw.items);
  const answers = typeof raw.answers === "object" && raw.answers !== null
    ? Object.fromEntries(
      Object.entries(raw.answers as Record<string, unknown>).map(([item, category]) => [item, String(category)]),
    )
    : {};

  if (categories.length === 0 || items.length === 0 || Object.keys(answers).length === 0) {
    return undefined;
  }

  return { categories, items, answers };
}

function normalizeGlossary(value: unknown): ReadingUnit["glossary"] {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const glossary = value.map((entry) => {
    const raw = entry as Record<string, unknown>;
    return {
      word: String(raw.word ?? raw.palabra ?? ""),
      definition: String(raw.definition ?? raw.definicion ?? ""),
    };
  }).filter((entry) => entry.word && entry.definition);

  return glossary.length > 0 ? glossary : undefined;
}

function normalizeReadingImage(value: unknown): ReadingUnit["image"] {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const src = normalizeTextField(raw.src);
  const alt = normalizeTextField(raw.alt);

  if (!src || !alt) {
    return undefined;
  }

  return {
    src,
    alt,
    caption: normalizeTextField(raw.caption),
    attribution: normalizeTextField(raw.attribution),
    sourceUrl: normalizeTextField(raw.sourceUrl ?? raw.source_url),
  };
}

function normalizeDifficulty(value: unknown): Difficulty {
  if (typeof value === "number") {
    if (value >= 3) return 3;
    if (value >= 2) return 2;
    return 1;
  }

  const normalized = String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized === "alta") return 3;
  if (normalized === "media") return 2;
  return 1;
}

function normalizeMasteryLevel(value: unknown): MasteryLevel {
  if (typeof value === "number") {
    if (value >= 4) return 4;
    if (value >= 3) return 3;
    if (value >= 2) return 2;
  }

  return 1;
}

if (process.argv[1]?.endsWith("session_runner.ts")) {
  runMixedSession();
}
