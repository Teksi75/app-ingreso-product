import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadProgress, saveSessionResult } from "../storage/local_progress_store.ts";

type Result = "correct" | "incorrect";
type SkillState = "weak" | "developing" | "mastered";

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

type SimulatorResult = {
  exercise_id: string;
  skill_id: string;
  result: Result;
  time_seconds: number;
};

type SkillStats = Record<
  string,
  {
    correct: number;
    incorrect: number;
  }
>;

type SimulatorSkillResult = {
  skill_id: string;
  attempts: number;
  correct: number;
  state: SkillState;
};

const SIMULATOR_LENGTH = 10;
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

function selectSimulatorExercises(exercises: Exercise[]): Exercise[] {
  const bySkill = groupBySkill(shuffle(exercises));
  const selected: Exercise[] = [];

  while (selected.length < SIMULATOR_LENGTH && hasAvailableExercises(bySkill)) {
    for (const skillId of Object.keys(bySkill).sort()) {
      const exercise = bySkill[skillId].shift();

      if (!exercise) {
        continue;
      }

      selected.push(exercise);

      if (selected.length === SIMULATOR_LENGTH) {
        break;
      }
    }
  }

  return selected;
}

function runSimulator(): void {
  const exercises = loadExercises();
  const progress = loadProgress();
  const simulatorExercises = selectSimulatorExercises(exercises);
  const results: SimulatorResult[] = [];

  console.log(`Progreso cargado: ${progress.sessions.length} sesiones previas`);
  console.log("");

  for (const exercise of simulatorExercises) {
    const selectedAnswer = simulateAnswer(exercise);
    const result: Result =
      selectedAnswer === exercise.correct_answer ? "correct" : "incorrect";
    const timeSeconds = simulateTimeSeconds();

    console.log(`[${exercise.skill_id}] ${exercise.prompt}`);
    console.log(`Respuesta elegida: ${selectedAnswer}`);
    console.log("");

    results.push({
      exercise_id: exercise.id,
      skill_id: exercise.skill_id,
      result,
      time_seconds: timeSeconds,
    });
  }

  const skillResults = printFinalResults(results);
  const totalCorrect = results.filter((item) => item.result === "correct").length;
  const totalErrors = results.length - totalCorrect;

  saveSessionResult({
    mode: "simulator",
    total_attempts: results.length,
    total_correct: totalCorrect,
    total_errors: totalErrors,
    skill_results: skillResults,
  });

  console.log("Progreso guardado en data/progress.json");
}

function simulateAnswer(exercise: Exercise): string {
  const shouldAnswerCorrectly = Math.random() < chanceByDifficulty(exercise.difficulty);

  if (shouldAnswerCorrectly) {
    return exercise.correct_answer;
  }

  const distractors = exercise.options.filter((option) => option !== exercise.correct_answer);
  return pickValue(distractors);
}

function simulateTimeSeconds(): number {
  return randomInt(25, 85);
}

function printFinalResults(results: SimulatorResult[]): SimulatorSkillResult[] {
  const totalCorrect = results.filter((item) => item.result === "correct").length;
  const totalErrors = results.length - totalCorrect;
  const totalTime = results.reduce((sum, item) => sum + item.time_seconds, 0);
  const averageTime = results.length === 0 ? 0 : totalTime / results.length;
  const skillStats = buildSkillStats(results);
  const skillResults = buildSkillResults(skillStats);

  console.log("## RESULTADO GENERAL");
  console.log(`total aciertos: ${totalCorrect}`);
  console.log(`total errores: ${totalErrors}`);
  console.log(`porcentaje general: ${formatPercent(totalCorrect / results.length)}`);
  console.log("");

  console.log("## RESULTADO POR SKILL");

  for (const skillResult of skillResults) {
    const accuracy = skillResult.attempts === 0 ? 0 : skillResult.correct / skillResult.attempts;

    console.log(`[${skillResult.skill_id}]`);
    console.log(`accuracy: ${formatPercent(accuracy)}`);
    console.log(`estado: ${skillResult.state}`);
    console.log("");
  }

  console.log("## TIEMPO");
  console.log(`tiempo total: ${totalTime}s`);
  console.log(`tiempo promedio por pregunta: ${Math.round(averageTime)}s`);

  return skillResults;
}

function buildSkillStats(results: SimulatorResult[]): SkillStats {
  return results.reduce<SkillStats>((stats, item) => {
    stats[item.skill_id] ??= { correct: 0, incorrect: 0 };
    stats[item.skill_id][item.result === "correct" ? "correct" : "incorrect"] += 1;
    return stats;
  }, {});
}

function buildSkillResults(skillStats: SkillStats): SimulatorSkillResult[] {
  return Object.entries(skillStats)
    .map(([skillId, stats]) => {
      const attempts = stats.correct + stats.incorrect;
      const accuracy = attempts === 0 ? 0 : stats.correct / attempts;

      return {
        skill_id: skillId,
        attempts,
        correct: stats.correct,
        state: classifySkill(accuracy),
      };
    })
    .sort((a, b) => a.skill_id.localeCompare(b.skill_id));
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

function chanceByDifficulty(difficulty: 1 | 2 | 3): number {
  if (difficulty === 1) {
    return 0.7;
  }

  if (difficulty === 2) {
    return 0.5;
  }

  return 0.3;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }

  return copy;
}

function pickValue<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

runSimulator();
