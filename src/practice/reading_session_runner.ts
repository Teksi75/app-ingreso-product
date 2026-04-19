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
  subskill?: string;
  difficulty?: unknown;
  mastery_level?: unknown;
  type: string;
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

  if (unit.source !== "generated" && unit.source !== "original_interno") {
    throw new Error(`Reading unit ${sourceFile} must use source "generated" or "original_interno"`);
  }

  return {
    id: String(unit.id),
    title: String(unit.title),
    subtitle: normalizeTextField(unit.subtitle),
    text: String(unit.text),
    difficulty: normalizeDifficulty(unit.difficulty),
    textType: normalizeTextType(unit.textType),
    source: unit.source === "original_interno" ? "original_interno" : "generated",
    sourceLabel: normalizeTextField(unit.sourceLabel ?? unit.source_label),
    license: normalizeTextField(unit.license),
    moduleFit: normalizeStringArray(unit.moduleFit ?? unit.module_fit),
    wordCountApprox: typeof unit.wordCountApprox === "number" ? unit.wordCountApprox : undefined,
    glossary: normalizeGlossary(unit.glossary),
    image: normalizeReadingImage(unit.image),
  };
}

function normalizeReadingExercise(exercise: RawReadingExercise, readingUnit: ReadingUnit): Exercise {
  return {
    id: exercise.id,
    skill_id: exercise.skill,
    subskill: exercise.subskill ?? exercise.skill,
    difficulty: normalizeDifficulty(exercise.difficulty ?? readingUnit.difficulty),
    mastery_level: normalizeMasteryLevel(exercise.mastery_level),
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

function normalizeTextType(value: unknown): ReadingUnit["textType"] {
  if (value === "biografia") return "biografia";
  if (value === "informative") return "informative";
  return "narrative";
}

function normalizeMasteryLevel(value: unknown): 1 | 2 | 3 | 4 {
  if (typeof value === "number") {
    if (value >= 4) return 4;
    if (value >= 3) return 3;
    if (value >= 2) return 2;
  }

  return 1;
}

function normalizeTextField(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : undefined;
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
