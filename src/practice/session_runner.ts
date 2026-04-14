import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadProgress, saveSessionResult } from "../storage/local_progress_store.ts";

type Result = "correct" | "incorrect";

type Exercise = {
  id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  type: "multiple_choice";
  prompt: string;
  options: string[];
  correct_answer: string;
  feedback_correct: string;
  feedback_incorrect: string;
};

type ExerciseFile = {
  metadata?: {
    validated_by?: string;
    audit_file?: string;
  };
  exercises?: Exercise[];
};

type HistoryItem = {
  exercise_id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  result: Result;
};

type SkillStats = Record<
  string,
  {
    correct: number;
    incorrect: number;
  }
>;

type SkillState = "weak" | "developing" | "mastered";
type Consistency = "alta" | "baja";

type ProgressMetric = {
  skill_id: string;
  accuracy: number;
  attempts: number;
  error_rate: number;
  consistency: Consistency;
  state: SkillState;
};

const SESSION_LENGTH = 10;
const exercisesPath = resolve(
  process.cwd(),
  "docs/04_exercise_engine/lengua_exercises_v1.json",
);

function loadExercises(): Exercise[] {
  const raw = readFileSync(exercisesPath, "utf8");
  const parsed = JSON.parse(raw) as ExerciseFile | Exercise[];
  const exercises = Array.isArray(parsed) ? parsed : parsed.exercises;

  if (!exercises?.length) {
    throw new Error("No exercises found in lengua_exercises_v1.json");
  }

  return exercises;
}

function getNextExercise(history: HistoryItem[], exercises: Exercise[]): Exercise {
  const last = history.at(-1);

  if (!last) {
    return pickExercise(exercises.filter((exercise) => exercise.difficulty === 1));
  }

  const skillStats = buildSkillStats(history);
  const recentBySkill = history.filter((item) => item.skill_id === last.skill_id).slice(-3);
  const recentErrors = recentBySkill.filter((item) => item.result === "incorrect");
  const recentErrorCount = recentErrors.length;
  const forcedSkillChange = countConsecutiveSkill(history, last.skill_id) >= 3;
  const consistentCorrect =
    recentBySkill.length >= 2 && recentBySkill.slice(-2).every((item) => item.result === "correct");

  const prioritySkill = forcedSkillChange
    ? chooseLeastPracticedSkill(history, exercises, last.skill_id)
    : choosePrioritySkill(history, exercises, skillStats, last, recentErrorCount);
  const targetDifficulty = chooseDifficulty(last, recentErrorCount, consistentCorrect);
  const lastExerciseId = last.exercise_id;
  const excludedSubskill = recentErrorCount >= 3 ? last.subskill : undefined;

  const candidates = exercises.filter(
    (exercise) =>
      exercise.skill_id === prioritySkill &&
      exercise.difficulty === targetDifficulty &&
      exercise.subskill !== excludedSubskill &&
      exercise.id !== lastExerciseId,
  );

  if (candidates.length > 0) {
    return pickExercise(candidates);
  }

  const fallbackSameSkill = exercises.filter(
    (exercise) =>
      exercise.skill_id === prioritySkill &&
      exercise.subskill !== excludedSubskill &&
      exercise.id !== lastExerciseId,
  );

  if (fallbackSameSkill.length > 0) {
    return pickExercise(fallbackSameSkill);
  }

  const fallbackSameSkillAnySubskill = exercises.filter(
    (exercise) => exercise.skill_id === prioritySkill && exercise.id !== lastExerciseId,
  );

  if (fallbackSameSkillAnySubskill.length > 0) {
    return pickExercise(fallbackSameSkillAnySubskill);
  }

  const fallbackAnySkill = exercises.filter((exercise) => exercise.id !== lastExerciseId);

  if (fallbackAnySkill.length > 0) {
    return pickExercise(fallbackAnySkill);
  }

  return pickExercise(exercises);
}

function simulateAnswer(exercise: Exercise): string {
  const shouldAnswerCorrectly = Math.random() < chanceByDifficulty(exercise.difficulty);

  if (shouldAnswerCorrectly) {
    return exercise.correct_answer;
  }

  const distractors = exercise.options.filter((option) => option !== exercise.correct_answer);
  return pickValue(distractors);
}

function runSession(): void {
  const exercises = loadExercises();
  const progress = loadProgress();
  const history: HistoryItem[] = [];

  console.log(`Progreso cargado: ${progress.sessions.length} sesiones previas`);
  console.log("");

  let currentExercise = getNextExercise(history, exercises);

  for (let index = 0; index < SESSION_LENGTH; index += 1) {
    const selectedAnswer = simulateAnswer(currentExercise);
    const result: Result =
      selectedAnswer === currentExercise.correct_answer ? "correct" : "incorrect";
    const feedback =
      result === "correct"
        ? currentExercise.feedback_correct
        : currentExercise.feedback_incorrect;

    console.log(`[${currentExercise.skill_id}] ${currentExercise.prompt}`);
    console.log(`Respuesta elegida: ${selectedAnswer}`);
    console.log(`Resultado: ${result === "correct" ? "Correcto" : "Incorrecto"}`);
    console.log(`Feedback: ${feedback}`);
    console.log("");

    history.push({
      exercise_id: currentExercise.id,
      skill_id: currentExercise.skill_id,
      subskill: currentExercise.subskill,
      difficulty: currentExercise.difficulty,
      result,
    });

    currentExercise = getNextExercise(history, exercises);
  }

  const progressMetrics = printSummary(history);
  const totalCorrect = history.filter((item) => item.result === "correct").length;
  const totalErrors = history.length - totalCorrect;

  saveSessionResult({
    mode: "practice",
    total_attempts: history.length,
    total_correct: totalCorrect,
    total_errors: totalErrors,
    skill_results: progressMetrics.map((metric) => ({
      skill_id: metric.skill_id,
      attempts: metric.attempts,
      correct: Math.round(metric.accuracy * metric.attempts),
      state: metric.state,
    })),
  });

  console.log("Progreso guardado en data/progress.json");
}

function choosePrioritySkill(
  history: HistoryItem[],
  exercises: Exercise[],
  skillStats: SkillStats,
  last: HistoryItem,
  recentErrorCount: number,
): string {
  if (last.result === "incorrect" || recentErrorCount > 0) {
    return last.skill_id;
  }

  const weakestSkill = Object.entries(skillStats).sort(
    ([, a], [, b]) => b.incorrect - a.incorrect,
  )[0]?.[0];

  if (weakestSkill && skillStats[weakestSkill].incorrect > 0) {
    return weakestSkill;
  }

  return chooseLeastPracticedSkill(history, exercises) ?? last.skill_id;
}

function buildSkillStats(history: HistoryItem[]): SkillStats {
  return history.reduce<SkillStats>((stats, item) => {
    stats[item.skill_id] ??= { correct: 0, incorrect: 0 };
    stats[item.skill_id][item.result === "correct" ? "correct" : "incorrect"] += 1;
    return stats;
  }, {});
}

function chooseLeastPracticedSkill(
  history: HistoryItem[],
  exercises: Exercise[],
  excludedSkillId?: string,
): string {
  const skillCounts = history.reduce<Record<string, number>>((counts, item) => {
    counts[item.skill_id] = (counts[item.skill_id] ?? 0) + 1;
    return counts;
  }, {});

  const availableSkills = Array.from(new Set(exercises.map((exercise) => exercise.skill_id))).filter(
    (skillId) => skillId !== excludedSkillId,
  );

  return availableSkills.sort((a, b) => (skillCounts[a] ?? 0) - (skillCounts[b] ?? 0))[0];
}

function chooseDifficulty(
  last: HistoryItem,
  recentErrorCount: number,
  consistentCorrect: boolean,
): 1 | 2 | 3 {
  if (recentErrorCount >= 2) {
    return lowerDifficulty(last.difficulty);
  }

  if (last.result === "incorrect") {
    return last.difficulty;
  }

  if (consistentCorrect) {
    return higherDifficulty(last.difficulty);
  }

  return last.difficulty;
}

function lowerDifficulty(difficulty: 1 | 2 | 3): 1 | 2 | 3 {
  return difficulty === 1 ? 1 : ((difficulty - 1) as 1 | 2);
}

function higherDifficulty(difficulty: 1 | 2 | 3): 1 | 2 | 3 {
  return difficulty === 3 ? 3 : ((difficulty + 1) as 2 | 3);
}

function chanceByDifficulty(difficulty: 1 | 2 | 3): number {
  if (difficulty === 1) {
    return 0.7;
  }

  if (difficulty === 2) {
    return 0.5;
  }

  return 0.3;
}

function countConsecutiveSkill(history: HistoryItem[], skillId: string): number {
  let count = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].skill_id !== skillId) {
      break;
    }

    count += 1;
  }

  return count;
}

function pickExercise(exercises: Exercise[]): Exercise {
  if (exercises.length === 0) {
    throw new Error("Cannot pick an exercise from an empty list");
  }

  return pickValue(exercises);
}

function pickValue<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function printSummary(history: HistoryItem[]): ProgressMetric[] {
  const skillStats = buildSkillStats(history);
  const totalCorrect = history.filter((item) => item.result === "correct").length;
  const totalErrors = history.length - totalCorrect;
  const progressMetrics = buildProgressMetrics(history, skillStats);

  console.log("Resumen");
  console.log(`Total aciertos: ${totalCorrect}`);
  console.log(`Total errores: ${totalErrors}`);
  console.log("Errores por skill:");

  const skillsWithErrors = Object.entries(skillStats).filter(([, stats]) => stats.incorrect > 0);

  if (skillsWithErrors.length === 0) {
    console.log("- ninguno");
  } else {
    for (const [skillId, stats] of skillsWithErrors) {
      console.log(`- ${skillId}: ${stats.incorrect}`);
    }
  }

  console.log("");
  console.log("Metricas por skill:");

  for (const metric of progressMetrics) {
    console.log(`[${metric.skill_id}]`);
    console.log(`accuracy: ${formatPercent(metric.accuracy)}`);
    console.log(`attempts: ${metric.attempts}`);
    console.log(`error_rate: ${formatPercent(metric.error_rate)}`);
    console.log(`consistency: ${metric.consistency}`);
    console.log(`estado: ${metric.state}`);
    console.log("");
  }

  return progressMetrics;
}

function buildProgressMetrics(history: HistoryItem[], skillStats: SkillStats): ProgressMetric[] {
  return Object.entries(skillStats)
    .map(([skillId, stats]) => {
      const attempts = stats.correct + stats.incorrect;
      const accuracy = attempts === 0 ? 0 : stats.correct / attempts;
      const errorRate = attempts === 0 ? 0 : stats.incorrect / attempts;

      return {
        skill_id: skillId,
        accuracy,
        attempts,
        error_rate: errorRate,
        consistency: calculateConsistency(history, skillId),
        state: classifySkill(accuracy),
      };
    })
    .sort((a, b) => a.skill_id.localeCompare(b.skill_id));
}

function calculateConsistency(history: HistoryItem[], skillId: string): Consistency {
  const recentResults = history
    .filter((item) => item.skill_id === skillId)
    .slice(-3)
    .map((item) => item.result);

  const hasTwoCorrectInARow = recentResults.some(
    (result, index) => result === "correct" && recentResults[index + 1] === "correct",
  );

  return hasTwoCorrectInARow ? "alta" : "baja";
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

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

runSession();
