import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  selectNextExerciseDetailed,
  type Exercise as SelectorExercise,
  type UserSkillState,
} from "./exercise_selector.ts";

export type Exercise = {
  id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  type: string;
  text?: string;
  prompt: string;
  options: string[];
  correct_answer: string;
  feedback_correct: string;
  feedback_incorrect: string;
};

export type Result = "correct" | "incorrect";

export type HistoryItem = {
  exercise_id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  result: Result;
};

type ExerciseFile = {
  metadata?: Record<string, string>;
  exercises?: Exercise[];
};

type AttemptRecord = {
  step: number;
  exerciseId: string;
  skill: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  answer: string;
  result: Result;
  ruleApplied: string;
};

type SessionConfig = {
  maxSteps: number;
  datasetPath?: string;
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
  exercise: Exercise;
  exercisePool: Exercise[];
  usedExerciseIds: string[];
};

type AnswerProvider = (exercise: Exercise, step: number) => string;

const DEFAULT_MAX_STEPS = 10;
const DEFAULT_DATASET_PATH = resolve(
  process.cwd(),
  "docs/04_exercise_engine/lengua_exercises_modulo3.json",
);

function toSelectorExercise(ex: Exercise): SelectorExercise {
  return {
    id: ex.id,
    skill: ex.skill_id,
    subskill: ex.subskill,
    difficulty: ex.difficulty,
  };
}

export function loadExercises(path: string): Exercise[] {
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw) as ExerciseFile | Exercise[];
  const exercises = Array.isArray(parsed) ? parsed : parsed.exercises;

  if (!exercises?.length) {
    throw new Error(`No exercises found in ${path}`);
  }

  return exercises;
}

function evaluateAnswer(exercise: Exercise, answer: string): Result {
  return answer === exercise.correct_answer ? "correct" : "incorrect";
}

function computeAccuracy(history: AttemptRecord[], skill: string, subskill: string): number {
  const relevant = history.filter((h) => h.skill === skill && h.subskill === subskill);

  if (relevant.length === 0) return 0;

  const correct = relevant.filter((h) => h.result === "correct").length;
  return correct / relevant.length;
}

function computeStreak(history: AttemptRecord[], skill: string, subskill: string): number {
  const relevant = history.filter((h) => h.skill === skill && h.subskill === subskill);
  let streak = 0;

  for (let i = relevant.length - 1; i >= 0; i -= 1) {
    if (relevant[i].result === "correct") {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function buildUserState(history: AttemptRecord[]): UserSkillState[] {
  if (history.length === 0) return [];

  const last = history[history.length - 1];

  return [
    {
      skill: last.skill,
      subskill: last.subskill,
      accuracy: computeAccuracy(history, last.skill, last.subskill),
      streak: computeStreak(history, last.skill, last.subskill),
      lastResult: last.result,
    },
  ];
}

function findExercise(fullExercises: Exercise[], selectorExercise: SelectorExercise): Exercise {
  const found = fullExercises.find((ex) => ex.id === selectorExercise.id);

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
  const allSelectorExercises = fullExercises.map(toSelectorExercise);
  const history: AttemptRecord[] = [];
  const usedExerciseIds: Set<string> = new Set();
  let userState: UserSkillState[] = [];

  console.log("=== SESION DE PRACTICA ===");
  console.log(`Ejercicios disponibles: ${fullExercises.length}`);
  console.log(`Pasos configurados: ${maxSteps}`);
  console.log("");

  const availableExercises = (): SelectorExercise[] => {
    const filtered = allSelectorExercises.filter((ex) => !usedExerciseIds.has(ex.id));
    return filtered.length > 0 ? filtered : allSelectorExercises;
  };

  const firstSelection = selectNextExerciseDetailed(availableExercises(), userState);
  let currentSelectorExercise = firstSelection.exercise;
  let lastRuleApplied = firstSelection.ruleApplied;

  for (let step = 1; step <= maxSteps; step += 1) {
    const currentFull = findExercise(fullExercises, currentSelectorExercise);
    usedExerciseIds.add(currentFull.id);
    const answer = answerProvider(currentFull, step);
    const result = evaluateAnswer(currentFull, answer);
    const feedback =
      result === "correct" ? currentFull.feedback_correct : currentFull.feedback_incorrect;

    console.log(`--- Paso ${step} ---`);
    console.log(`  Ejercicio: ${currentFull.id}`);
    console.log(`  Skill: ${currentFull.skill_id} > ${currentFull.subskill}`);
    console.log(`  Dificultad: ${currentFull.difficulty}`);
    console.log(`  Regla aplicada: ${lastRuleApplied}`);
    console.log(`  Respuesta: ${answer}`);
    console.log(`  Resultado: ${result === "correct" ? "Correcto" : "Incorrecto"}`);
    console.log(`  Feedback: ${feedback}`);

    history.push({
      step,
      exerciseId: currentFull.id,
      skill: currentFull.skill_id,
      subskill: currentFull.subskill,
      difficulty: currentFull.difficulty,
      answer,
      result,
      ruleApplied: lastRuleApplied,
    });

    userState = buildUserState(history);

    if (step < maxSteps) {
      const selection = selectNextExerciseDetailed(availableExercises(), userState);
      currentSelectorExercise = selection.exercise;
      lastRuleApplied = selection.ruleApplied;
    }
  }

  const totalCorrect = history.filter((h) => h.result === "correct").length;
  const totalIncorrect = history.length - totalCorrect;

  console.log("");
  console.log("=== RESUMEN ===");
  console.log(`Total ejercicios: ${history.length}`);
  console.log(`Correctos: ${totalCorrect}`);
  console.log(`Incorrectos: ${totalIncorrect}`);
  console.log(`Precision general: ${history.length > 0 ? Math.round((totalCorrect / history.length) * 100) : 0}%`);

  const skillsUsed = [...new Set(history.map((h) => h.skill))];
  console.log("");

  for (const skill of skillsUsed) {
    const skillHistory = history.filter((h) => h.skill === skill);
    const skillCorrect = skillHistory.filter((h) => h.result === "correct").length;
    const skillAccuracy = Math.round((skillCorrect / skillHistory.length) * 100);
    console.log(`  [${skill}] ${skillHistory.length} intentos, ${skillAccuracy}% precision`);
  }

  const subskillsUsed = [...new Set(history.map((h) => `${h.skill}/${h.subskill}`))];
  console.log("");

  for (const key of subskillsUsed) {
    const [skill, subskill] = key.split("/");
    const subHistory = history.filter((h) => h.skill === skill && h.subskill === subskill);
    const subCorrect = subHistory.filter((h) => h.result === "correct").length;
    const subAccuracy = Math.round((subCorrect / subHistory.length) * 100);
    const lastRule = subHistory[subHistory.length - 1].ruleApplied;
    console.log(`    ${subskill}: ${subHistory.length} intentos, ${subAccuracy}% precision, regla=${lastRule}`);
  }

  console.log("");
  console.log("Estado final del usuario:");

  for (const state of userState) {
    console.log(
      `  [${state.skill}/${state.subskill}] accuracy=${Math.round(state.accuracy * 100)}%, streak=${state.streak}, lastResult=${state.lastResult}`,
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
  const datasetPath = config?.datasetPath ?? DEFAULT_DATASET_PATH;
  const fullExercises = loadExercises(datasetPath);

  const deterministicAnswer: AnswerProvider = (exercise, _step) => exercise.correct_answer;

  return runSession(fullExercises, deterministicAnswer, config);
}

export function runMixedSession(config?: Partial<SessionConfig>): SessionResult {
  const datasetPath = config?.datasetPath ?? DEFAULT_DATASET_PATH;
  const fullExercises = loadExercises(datasetPath);

  const mixedAnswer: AnswerProvider = (exercise, step) => {
    if (step <= 3) return exercise.correct_answer;
    if (step <= 5) return exercise.options.find((o) => o !== exercise.correct_answer) ?? exercise.correct_answer;
    return exercise.correct_answer;
  };

  return runSession(fullExercises, mixedAnswer, config);
}

export function startPracticeSession(
  skillId: string | null,
  usedExerciseIds: string[] = [],
): PracticeSelection {
  const exercises = loadExercises(DEFAULT_DATASET_PATH);
  const focusedExercises = skillId
    ? exercises.filter((ex) => ex.skill_id === skillId)
    : exercises;
  const startingPool = focusedExercises.length > 0 ? focusedExercises : exercises;
  const unusedExercises = startingPool.filter((ex) => !usedExerciseIds.includes(ex.id));
  const selectionPool = unusedExercises.length > 0 ? unusedExercises : startingPool;
  const activeUsedIds = unusedExercises.length > 0 ? usedExerciseIds : [];

  const selectorExercises = selectionPool.map(toSelectorExercise);
  const selection = selectNextExerciseDetailed(selectorExercises, []);
  const exercise = findExercise(exercises, selection.exercise);

  return {
    exercise,
    exercisePool: startingPool,
    usedExerciseIds: [...activeUsedIds, exercise.id],
  };
}

if (process.argv[1]?.endsWith("session_runner.ts")) {
  runMixedSession();
}