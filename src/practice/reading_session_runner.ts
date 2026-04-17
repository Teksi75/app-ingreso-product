import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { type ReadingUnit } from "../types/reading_unit.ts";
import { type Exercise } from "./session_runner.ts";

type ReadingExerciseFile = {
  readingUnitId?: string;
  exercises?: RawReadingExercise[];
};

type RawReadingExercise = {
  id: string;
  readingUnitId?: string;
  skill: string;
  type: "multiple_choice";
  question: string;
  options: string[];
  correctAnswer: string;
};

export type ReadingSession = {
  readingUnit: ReadingUnit;
  exercises: Exercise[];
};

const READING_UNITS_DIR = resolve(process.cwd(), "content/lengua/reading_units");
const READING_EXERCISES_DIR = resolve(process.cwd(), "content/lengua/exercises");

export function loadReadingUnits(baseDir = READING_UNITS_DIR): ReadingUnit[] {
  if (!existsSync(baseDir)) {
    return [];
  }

  return readdirSync(baseDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => normalizeReadingUnit(
      JSON.parse(readFileSync(join(baseDir, fileName), "utf8")),
      fileName,
    ));
}

export function loadReadingExercises(
  readingUnitId: string,
  exercisesDir = READING_EXERCISES_DIR,
  unitsDir = READING_UNITS_DIR,
): Exercise[] {
  const readingUnit = findReadingUnit(readingUnitId, unitsDir);

  if (!readingUnit || !existsSync(exercisesDir)) {
    return [];
  }

  return readdirSync(exercisesDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right))
    .flatMap((fileName) => {
      const parsed = JSON.parse(readFileSync(join(exercisesDir, fileName), "utf8")) as ReadingExerciseFile;
      return (parsed.exercises ?? [])
        .filter((exercise) => (exercise.readingUnitId ?? parsed.readingUnitId) === readingUnitId)
        .map((exercise) => normalizeReadingExercise(exercise, readingUnit));
    });
}

export function startReadingSession(readingUnitId?: string): ReadingSession {
  const readingUnits = loadReadingUnits();
  const readingUnit = readingUnitId
    ? readingUnits.find((unit) => unit.id === readingUnitId)
    : readingUnits[0];

  if (!readingUnit) {
    throw new Error("No reading units available");
  }

  const exercises = loadReadingExercises(readingUnit.id);

  if (exercises.length === 0) {
    throw new Error(`No exercises found for reading unit ${readingUnit.id}`);
  }

  return {
    readingUnit,
    exercises,
  };
}

export function runReadingSession(readingUnitId?: string): ReadingSession {
  return startReadingSession(readingUnitId);
}

function findReadingUnit(readingUnitId: string, unitsDir: string): ReadingUnit | null {
  return loadReadingUnits(unitsDir).find((unit) => unit.id === readingUnitId) ?? null;
}

function normalizeReadingUnit(rawUnit: unknown, sourceFile: string): ReadingUnit {
  const unit = rawUnit as Record<string, unknown>;

  if (unit.source !== "generated") {
    throw new Error(`Reading unit ${sourceFile} must use source "generated"`);
  }

  return {
    id: String(unit.id),
    title: String(unit.title),
    text: String(unit.text),
    difficulty: normalizeDifficulty(unit.difficulty),
    textType: unit.textType === "informative" ? "informative" : "narrative",
    source: "generated",
  };
}

function normalizeReadingExercise(exercise: RawReadingExercise, readingUnit: ReadingUnit): Exercise {
  return {
    id: exercise.id,
    skill_id: exercise.skill,
    subskill: exercise.skill,
    difficulty: normalizeDifficulty(readingUnit.difficulty),
    mastery_level: 1,
    type: exercise.type,
    text: readingUnit.text,
    readingUnitId: readingUnit.id,
    reading_unit_id: readingUnit.id,
    reading_unit: readingUnit,
    prompt: exercise.question,
    options: ensureOptions(exercise.options, exercise.correctAnswer),
    correct_answer: exercise.correctAnswer,
    feedback_correct: "Correcto: tu respuesta se apoya en el texto.",
    feedback_incorrect: "Revisa el texto y busca la pista que responde la pregunta.",
    source_file: `${readingUnit.id}.json`,
    related_skills: [],
  };
}

function ensureOptions(options: string[], correctAnswer: string): string[] {
  return Array.from(new Set([...options, correctAnswer].filter(Boolean)));
}

function normalizeDifficulty(value: unknown): 1 | 2 | 3 {
  if (typeof value === "number") {
    if (value >= 3) return 3;
    if (value >= 2) return 2;
  }

  return 1;
}
