import {
  saveSessionResultAsync,
  saveSessionResult,
  type SessionSkillResult,
  type SkillState,
  type StoredProgress,
} from "../storage/local_progress_store.ts";
import { loadLenguaExercises, type Exercise } from "./session_runner.ts";
import { type ReadingUnit } from "../types/reading_unit.ts";

export type SimulatorExercise = Pick<
  Exercise,
  "id" | "skill_id" | "subskill" | "difficulty" | "prompt" | "options" | "correct_answer"
> & {
  block_id: string;
  reading_unit_id?: string;
};

export type SimulatorReadingUnit = Pick<
  ReadingUnit,
  "id" | "title" | "subtitle" | "text" | "sourceLabel"
>;

export type SimulatorBlock = {
  id: string;
  type: "reading_unit" | "standalone";
  title: string;
  exerciseIds: string[];
  readingUnit?: SimulatorReadingUnit;
};

export type SimulatorSession = {
  mode: "simulator";
  blocks: SimulatorBlock[];
  exercises: SimulatorExercise[];
  totalQuestions: number;
};

export type SimulatorSessionOptions = {
  maxQuestions?: number;
};

export type SimulatorAnswer = {
  exerciseId: string;
  answer: string;
  timeSeconds?: number;
};

export type SimulatorQuestionResult = {
  exercise_id: string;
  skill_id: string;
  subskill: string;
  result: "correct" | "incorrect";
  selected_answer: string | null;
  correct_answer: string;
  time_seconds?: number;
};

export type SimulatorEvaluation = {
  mode: "simulator";
  area: "lengua";
  total_attempts: number;
  total_correct: number;
  total_errors: number;
  score_percentage: number;
  duration_seconds?: number;
  exercise_ids: string[];
  results: SimulatorQuestionResult[];
  skill_results: SessionSkillResult[];
};

export type SimulatorSessionProgressResult = SimulatorEvaluation & {
  progress: StoredProgress;
};

const DEFAULT_SIMULATOR_LENGTH = 10;
const READING_BLOCK_TARGET_SIZE = 4;
const SECOND_READING_BLOCK_MIN_LENGTH = 14;

export function startSimulatorSession(options: SimulatorSessionOptions = {}): SimulatorSession {
  const exercises = loadLenguaExercises();
  const selectedSession = selectSimulatorSession(exercises, options);

  if (selectedSession.exercises.length === 0) {
    throw new Error("No simulator-compatible exercises available");
  }

  return {
    mode: "simulator",
    blocks: selectedSession.blocks,
    exercises: selectedSession.exercises,
    totalQuestions: selectedSession.exercises.length,
  };
}

export const createSimulatorSession = startSimulatorSession;

export function selectSimulatorSession(
  exercises: Exercise[],
  options: SimulatorSessionOptions = {},
): Pick<SimulatorSession, "blocks" | "exercises"> {
  const maxQuestions = Math.max(1, options.maxQuestions ?? DEFAULT_SIMULATOR_LENGTH);
  const readingBlocks = buildReadingBlocks(exercises, maxQuestions);
  const selectedBlocks: SimulatorBlock[] = [];
  const selectedExercises: SimulatorExercise[] = [];
  const selectedIds = new Set<string>();

  const primaryReadingBlock = readingBlocks[0];
  if (primaryReadingBlock) {
    selectedBlocks.push(primaryReadingBlock.block);
    selectedExercises.push(...primaryReadingBlock.exercises);
    primaryReadingBlock.exercises.forEach((exercise) => selectedIds.add(exercise.id));
  }

  const shouldUseSecondReadingBlock = maxQuestions >= SECOND_READING_BLOCK_MIN_LENGTH && readingBlocks.length > 1;
  const secondReadingBlock = shouldUseSecondReadingBlock ? readingBlocks[1] : null;
  const remainingForStandalone = Math.max(
    0,
    maxQuestions - selectedExercises.length - (secondReadingBlock?.exercises.length ?? 0),
  );
  const standaloneExercises = selectStandaloneSimulatorExercises(
    exercises,
    selectedIds,
    remainingForStandalone,
  );

  if (standaloneExercises.length > 0) {
    selectedBlocks.push(createStandaloneBlock(standaloneExercises));
    selectedExercises.push(...standaloneExercises);
    standaloneExercises.forEach((exercise) => selectedIds.add(exercise.id));
  }

  if (secondReadingBlock && selectedExercises.length + secondReadingBlock.exercises.length <= maxQuestions) {
    selectedBlocks.push(secondReadingBlock.block);
    selectedExercises.push(...secondReadingBlock.exercises);
    secondReadingBlock.exercises.forEach((exercise) => selectedIds.add(exercise.id));
  }

  if (selectedExercises.length < maxQuestions) {
    const fillerExercises = selectStandaloneSimulatorExercises(
      exercises,
      selectedIds,
      maxQuestions - selectedExercises.length,
    );

    if (fillerExercises.length > 0) {
      const lastStandaloneBlock = selectedBlocks.findLast((block) => block.type === "standalone");

      if (lastStandaloneBlock) {
        lastStandaloneBlock.exerciseIds.push(...fillerExercises.map((exercise) => exercise.id));
      } else {
        selectedBlocks.push(createStandaloneBlock(fillerExercises));
      }

      selectedExercises.push(...fillerExercises);
    }
  }

  return {
    blocks: selectedBlocks,
    exercises: selectedExercises.slice(0, maxQuestions),
  };
}

export function selectSimulatorExercises(
  exercises: Exercise[],
  options: SimulatorSessionOptions = {},
  excludedExerciseIds: Set<string> = new Set(),
): SimulatorExercise[] {
  const maxQuestions = Math.max(1, options.maxQuestions ?? DEFAULT_SIMULATOR_LENGTH);
  const bySkill = groupBySkill(
    exercises
      .filter(isSimulatorCompatibleExercise)
      .filter((exercise) => !excludedExerciseIds.has(exercise.id))
      .sort(compareExercisesForSimulator),
  );
  const selected: SimulatorExercise[] = [];
  const selectedIds = new Set<string>();

  while (selected.length < maxQuestions && hasAvailableExercises(bySkill)) {
    for (const skillId of Object.keys(bySkill).sort((left, right) => left.localeCompare(right))) {
      const exercise = takeNextUnusedExercise(bySkill[skillId], selectedIds);

      if (!exercise) {
        continue;
      }

      selected.push(toSimulatorExercise(exercise));
      selectedIds.add(exercise.id);

      if (selected.length === maxQuestions) {
        break;
      }
    }
  }

  return selected;
}

export function evaluateSimulatorSession(
  session: SimulatorSession,
  answers: Record<string, string> | SimulatorAnswer[],
): SimulatorEvaluation {
  const answerByExerciseId = normalizeAnswers(answers);
  const results = session.exercises.map((exercise) => {
    const answer = answerByExerciseId.get(exercise.id);
    const selectedAnswer = answer?.answer ?? null;
    const result = selectedAnswer === exercise.correct_answer ? "correct" : "incorrect";

    return {
      exercise_id: exercise.id,
      skill_id: exercise.skill_id,
      subskill: exercise.subskill,
      result,
      selected_answer: selectedAnswer,
      correct_answer: exercise.correct_answer,
      time_seconds: answer?.timeSeconds,
    } satisfies SimulatorQuestionResult;
  });
  const totalCorrect = results.filter((item) => item.result === "correct").length;
  const durationSeconds = sumDurationSeconds(results);

  return {
    mode: "simulator",
    area: "lengua",
    total_attempts: results.length,
    total_correct: totalCorrect,
    total_errors: results.length - totalCorrect,
    score_percentage: calculateScorePercentage(totalCorrect, results.length),
    duration_seconds: durationSeconds,
    exercise_ids: results.map((result) => result.exercise_id),
    results,
    skill_results: buildSimulatorSkillResults(results),
  };
}

export function saveSimulatorSessionProgress(
  session: SimulatorSession,
  answers: Record<string, string> | SimulatorAnswer[],
): SimulatorSessionProgressResult {
  const evaluation = evaluateSimulatorSession(session, answers);
  const progress = saveSessionResult({
    mode: "simulator",
    area: evaluation.area,
    total_attempts: evaluation.total_attempts,
    total_correct: evaluation.total_correct,
    total_errors: evaluation.total_errors,
    score_percentage: evaluation.score_percentage,
    duration_seconds: evaluation.duration_seconds,
    exercise_ids: evaluation.exercise_ids,
    skill_results: evaluation.skill_results,
  });

  return {
    ...evaluation,
    progress,
  };
}

export async function saveSimulatorSessionProgressAsync(
  session: SimulatorSession,
  answers: Record<string, string> | SimulatorAnswer[],
): Promise<SimulatorSessionProgressResult> {
  const evaluation = evaluateSimulatorSession(session, answers);
  const progress = await saveSessionResultAsync({
    mode: "simulator",
    area: evaluation.area,
    total_attempts: evaluation.total_attempts,
    total_correct: evaluation.total_correct,
    total_errors: evaluation.total_errors,
    score_percentage: evaluation.score_percentage,
    duration_seconds: evaluation.duration_seconds,
    exercise_ids: evaluation.exercise_ids,
    skill_results: evaluation.skill_results,
  });

  return {
    ...evaluation,
    progress,
  };
}

export function buildSimulatorSkillResults(results: SimulatorQuestionResult[]): SessionSkillResult[] {
  const byFocus = new Map<string, { attempts: number; correct: number }>();

  for (const result of results) {
    addFocusResult(byFocus, result.skill_id, result.result);
    addFocusResult(byFocus, result.subskill, result.result);
  }

  return [...byFocus.entries()]
    .map(([skillId, stats]) => {
      const accuracy = stats.attempts > 0 ? stats.correct / stats.attempts : 0;

      return {
        skill_id: skillId,
        attempts: stats.attempts,
        correct: stats.correct,
        state: classifySkill(accuracy),
        mastery_level: accuracyToMasteryLevel(accuracy, stats.attempts),
      };
    })
    .sort((left, right) => left.skill_id.localeCompare(right.skill_id));
}

export function runSimulator(options: SimulatorSessionOptions = {}): SimulatorEvaluation {
  const session = startSimulatorSession(options);
  return saveSimulatorSessionProgress(
    session,
    session.exercises.map((exercise) => ({
      exerciseId: exercise.id,
      answer: simulateAnswer(exercise),
      timeSeconds: simulateTimeSeconds(),
    })),
  );
}

function isSimulatorCompatibleExercise(exercise: Exercise): boolean {
  return exercise.type === "multiple_choice" &&
    exercise.options.length >= 2 &&
    exercise.correct_answer.trim().length > 0 &&
    exercise.options.includes(exercise.correct_answer);
}

function toSimulatorExercise(exercise: Exercise, blockId = "standalone"): SimulatorExercise {
  return {
    id: exercise.id,
    skill_id: exercise.skill_id,
    subskill: exercise.subskill,
    difficulty: exercise.difficulty,
    prompt: exercise.prompt,
    options: exercise.options,
    correct_answer: exercise.correct_answer,
    block_id: blockId,
    reading_unit_id: exercise.reading_unit_id,
  };
}

function buildReadingBlocks(
  exercises: Exercise[],
  maxQuestions: number,
): Array<{ block: SimulatorBlock; exercises: SimulatorExercise[] }> {
  const blocks: Array<{ block: SimulatorBlock; exercises: SimulatorExercise[] }> = [];

  for (const unitExercises of Object.values(groupByReadingUnit(exercises.filter(isSimulatorCompatibleReadingExercise)))) {
    const readingUnit = unitExercises[0]?.reading_unit;

    if (!readingUnit) {
      continue;
    }

    const blockId = `reading:${readingUnit.id}`;
    const selectedExercises = unitExercises
      .sort(compareExercisesForSimulator)
      .slice(0, Math.min(maxQuestions, READING_BLOCK_TARGET_SIZE))
      .map((exercise) => toSimulatorExercise(exercise, blockId));

    if (selectedExercises.length === 0) {
      continue;
    }

    blocks.push({
      block: {
        id: blockId,
        type: "reading_unit",
        title: readingUnit.title,
        exerciseIds: selectedExercises.map((exercise) => exercise.id),
        readingUnit: {
          id: readingUnit.id,
          title: readingUnit.title,
          subtitle: readingUnit.subtitle,
          text: readingUnit.text,
          sourceLabel: readingUnit.sourceLabel,
        },
      },
      exercises: selectedExercises,
    });
  }

  return blocks.sort(compareReadingBlocks);
}

function isSimulatorCompatibleReadingExercise(exercise: Exercise): boolean {
  return isSimulatorCompatibleExercise(exercise) && Boolean(exercise.reading_unit);
}

function groupByReadingUnit(exercises: Exercise[]): Record<string, Exercise[]> {
  return exercises.reduce<Record<string, Exercise[]>>((groups, exercise) => {
    const readingUnitId = exercise.reading_unit?.id ?? exercise.reading_unit_id;

    if (!readingUnitId) {
      return groups;
    }

    groups[readingUnitId] ??= [];
    groups[readingUnitId].push(exercise);
    return groups;
  }, {});
}

function compareReadingBlocks(
  left: { block: SimulatorBlock; exercises: SimulatorExercise[] },
  right: { block: SimulatorBlock; exercises: SimulatorExercise[] },
): number {
  return right.exercises.length - left.exercises.length ||
    left.block.title.localeCompare(right.block.title);
}

function selectStandaloneSimulatorExercises(
  exercises: Exercise[],
  excludedExerciseIds: Set<string>,
  maxQuestions: number,
): SimulatorExercise[] {
  if (maxQuestions <= 0) {
    return [];
  }

  return selectSimulatorExercises(
    exercises.filter((exercise) => !exercise.reading_unit),
    { maxQuestions },
    excludedExerciseIds,
  );
}

function createStandaloneBlock(exercises: SimulatorExercise[]): SimulatorBlock {
  return {
    id: "standalone",
    type: "standalone",
    title: "Ejercicios sueltos",
    exerciseIds: exercises.map((exercise) => exercise.id),
  };
}

function groupBySkill(exercises: Exercise[]): Record<string, Exercise[]> {
  return exercises.reduce<Record<string, Exercise[]>>((groups, exercise) => {
    groups[exercise.skill_id] ??= [];
    groups[exercise.skill_id].push(exercise);
    return groups;
  }, {});
}

function hasAvailableExercises(groups: Record<string, Exercise[]>): boolean {
  return Object.values(groups).some((items) => items.length > 0);
}

function takeNextUnusedExercise(exercises: Exercise[], selectedIds: Set<string>): Exercise | null {
  while (exercises.length > 0) {
    const exercise = exercises.shift();

    if (exercise && !selectedIds.has(exercise.id)) {
      return exercise;
    }
  }

  return null;
}

function compareExercisesForSimulator(left: Exercise, right: Exercise): number {
  return left.skill_id.localeCompare(right.skill_id) ||
    left.difficulty - right.difficulty ||
    left.subskill.localeCompare(right.subskill) ||
    left.id.localeCompare(right.id);
}

function normalizeAnswers(
  answers: Record<string, string> | SimulatorAnswer[],
): Map<string, { answer: string; timeSeconds?: number }> {
  if (Array.isArray(answers)) {
    return new Map(
      answers.map((answer) => [
        answer.exerciseId,
        {
          answer: answer.answer,
          timeSeconds: answer.timeSeconds,
        },
      ]),
    );
  }

  return new Map(
    Object.entries(answers).map(([exerciseId, answer]) => [
      exerciseId,
      { answer },
    ]),
  );
}

function addFocusResult(
  byFocus: Map<string, { attempts: number; correct: number }>,
  focusId: string,
  result: SimulatorQuestionResult["result"],
): void {
  const previous = byFocus.get(focusId) ?? { attempts: 0, correct: 0 };
  byFocus.set(focusId, {
    attempts: previous.attempts + 1,
    correct: previous.correct + (result === "correct" ? 1 : 0),
  });
}

function calculateScorePercentage(correct: number, attempts: number): number {
  return attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
}

function sumDurationSeconds(results: SimulatorQuestionResult[]): number | undefined {
  const durations = results
    .map((result) => result.time_seconds)
    .filter((value): value is number => typeof value === "number");

  if (durations.length === 0) {
    return undefined;
  }

  return durations.reduce((sum, value) => sum + value, 0);
}

function classifySkill(accuracy: number): SkillState {
  if (accuracy < 0.5) {
    return "weak";
  }

  if (accuracy <= 0.75) {
    return "developing";
  }

  return "mastered";
}

function accuracyToMasteryLevel(accuracy: number, attempts: number): 1 | 2 | 3 | 4 {
  if (attempts >= 6 && accuracy >= 0.9) {
    return 4;
  }

  if (attempts >= 3 && accuracy > 0.75) {
    return 3;
  }

  if (attempts >= 2 && accuracy >= 0.5) {
    return 2;
  }

  return 1;
}

function simulateAnswer(exercise: SimulatorExercise): string {
  const shouldAnswerCorrectly = Math.random() < chanceByDifficulty(exercise.difficulty);

  if (shouldAnswerCorrectly) {
    return exercise.correct_answer;
  }

  return pickValue(exercise.options.filter((option) => option !== exercise.correct_answer));
}

function simulateTimeSeconds(): number {
  return randomInt(25, 85);
}

function chanceByDifficulty(difficulty: SimulatorExercise["difficulty"]): number {
  if (difficulty === 1) {
    return 0.7;
  }

  if (difficulty === 2) {
    return 0.5;
  }

  return 0.3;
}

function pickValue<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
