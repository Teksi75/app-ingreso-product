"use client";

import { FormEvent, useState, type ChangeEvent } from "react";
import {
  type MasteryMapNode,
  type RecommendedSubskill,
} from "../../components/practice/exercise_selector";
import { type Exercise } from "../../components/practice/session_runner";
import { getSkillMetadata } from "../../skills/skill_metadata";
import { type ReadingUnit } from "../../types/reading_unit";
import { type PracticeSessionProgressInput, type PracticeSessionProgressResult } from "./page";

type PracticeQuestionProps = {
  exercise: Exercise;
  exercisePool: Exercise[];
  masteryMap: MasteryMapNode[];
  mode?: "practice" | "reading";
  readingUnit?: ReadingUnit | null;
  restartHref: string;
  saveProgress: (input: PracticeSessionProgressInput) => Promise<PracticeSessionProgressResult>;
  usedExerciseIds: string[];
};

const MAX_QUESTIONS = 10;

export function PracticeQuestion({
  exercise,
  exercisePool,
  masteryMap,
  mode = "practice",
  readingUnit = null,
  restartHref,
  saveProgress,
  usedExerciseIds,
}: PracticeQuestionProps) {
  const [currentExercise, setCurrentExercise] = useState(exercise);
  const [hasStartedReadingExercises, setHasStartedReadingExercises] = useState(mode !== "reading");
  const [usedExercises, setUsedExercises] = useState<string[]>(
    Array.from(new Set([...usedExerciseIds, exercise.id])),
  );
  const [questionCount, setQuestionCount] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [progressResult, setProgressResult] = useState<PracticeSessionProgressResult | null>(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [showMasteryMap, setShowMasteryMap] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [partAnswers, setPartAnswers] = useState<Record<string, string>>({});
  const [categoryAnswers, setCategoryAnswers] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const isCorrect = evaluateCurrentExercise(
    currentExercise,
    selectedAnswer,
    selectedAnswers,
    partAnswers,
    categoryAnswers,
  );
  const canSubmit = hasAnswerForExercise(
    currentExercise,
    selectedAnswer,
    selectedAnswers,
    partAnswers,
    categoryAnswers,
  );
  const sessionQuestionCount = Math.min(MAX_QUESTIONS, exercisePool.length);
  const available = exercisePool.filter((item) => !usedExercises.includes(item.id));
  const skillMetadata = getSkillMetadata(currentExercise.skill_id);
  const options = getStableShuffledOptions(currentExercise);
  const hasReadingStimulus = Boolean(currentExercise.reading_unit || (mode === "reading" && readingUnit));
  const activeReadingUnit = currentExercise.reading_unit ?? readingUnit;
  const skillBanner = (
    <aside className="rounded-[8px] border border-[#d8d0a8] bg-[#fff8d7] p-3">
      <p className="m-0 text-[12px] font-semibold uppercase text-[#6a5d21]">
        Habilidad en entrenamiento
      </p>
      <p className="m-0 mt-1 text-[18px] font-bold text-[#1d1d1b]">
        {skillMetadata.title}
      </p>
      <p className="m-0 mt-1 text-[13px] font-semibold text-[#6a5d21]">
        {skillMetadata.id}
      </p>
      <p className="m-0 mt-1 text-[14px] leading-5 text-[#55554d]">
        {skillMetadata.description}
      </p>
      <p className="m-0 mt-2 text-[13px] leading-5 text-[#55554d]">
        Foco actual: {currentExercise.subskill}
      </p>
    </aside>
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSubmit && !hasSubmitted) {
      setHasSubmitted(true);
    }
  }

  function handleAnswerChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedAnswer(event.target.value);
    setHasSubmitted(false);
  }

  function handleMultipleAnswerChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    setSelectedAnswers((prev) => (
      event.target.checked
        ? Array.from(new Set([...prev, value]))
        : prev.filter((answer) => answer !== value)
    ));
    setHasSubmitted(false);
  }

  function handlePartAnswerChange(partId: string, value: string) {
    setPartAnswers((prev) => ({ ...prev, [partId]: value }));
    setHasSubmitted(false);
  }

  function handleCategoryAnswerChange(item: string, value: string) {
    setCategoryAnswers((prev) => ({ ...prev, [item]: value }));
    setHasSubmitted(false);
  }

  async function handleNext() {
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(nextCorrectCount);

    if (questionCount >= sessionQuestionCount || available.length === 0) {
      setSessionCompleted(true);
      setIsSavingProgress(true);

      try {
        const result = await saveProgress({
          currentFocus: currentExercise.subskill,
          mode,
          skillId: currentExercise.skill_id,
          attempts: questionCount,
          correct: nextCorrectCount,
          currentMastery: currentExercise.mastery_level,
          readingUnitId: currentExercise.readingUnitId ?? currentExercise.reading_unit_id ?? undefined,
        });

        setProgressResult(result);
      } finally {
        setIsSavingProgress(false);
      }

      return;
    }

    const nextExercise = mode === "reading" ? available[0] : pickExercise(available);

    setCurrentExercise(nextExercise);
    setUsedExercises((prev) => [...prev, nextExercise.id]);
    setQuestionCount((prev) => prev + 1);
    setSelectedAnswer("");
    setSelectedAnswers([]);
    setPartAnswers({});
    setCategoryAnswers({});
    setHasSubmitted(false);
  }

  if (sessionCompleted) {
    const masteryLevel = progressResult?.masteryLevel ?? currentExercise.mastery_level;
    const recommendedSubskill = progressResult?.recommendation ?? null;
    const repeatHref = buildPracticeHref(currentExercise.skill_id, currentExercise.subskill, usedExercises);
    const recommendedHref = recommendedSubskill
      ? buildPracticeHref(recommendedSubskill.parentSkill, recommendedSubskill.id, [])
      : restartHref;

    return (
      <>
        {skillBanner}
        <article className="grid gap-4 rounded-[8px] border border-gray-200 bg-white p-4">
          <div className="grid gap-2">
            <p className="m-0 text-sm font-medium text-gray-500">Sesion completada</p>
            <h1 className="m-0 text-xl font-semibold">
              {nextCorrectText(correctCount, sessionQuestionCount)}
            </h1>
            <p className="m-0 text-sm font-semibold text-[#55554d]">
              Mastery actualizado: {isSavingProgress ? "guardando" : masteryLevel}
            </p>
          </div>
          <div className="grid gap-3">
            {masteryLevel < 3 ? (
              <a
                className="inline-flex h-11 w-full items-center justify-center rounded-[8px] bg-[#1d1d1b] px-4 text-center text-sm font-semibold text-white"
                href={repeatHref}
              >
                Repetir con variacion
              </a>
            ) : null}
            <a
              aria-disabled={!recommendedSubskill || isSavingProgress}
              className="inline-flex h-11 w-full items-center justify-center rounded-[8px] border border-[#1d1d1b] px-4 text-center text-sm font-semibold text-[#1d1d1b] aria-disabled:pointer-events-none aria-disabled:opacity-50"
              href={recommendedHref}
            >
              Siguiente subskill recomendada
            </a>
            <button
              className="inline-flex h-11 w-full items-center justify-center rounded-[8px] border border-gray-300 px-4 text-sm font-semibold text-[#1d1d1b]"
              onClick={() => setShowMasteryMap(true)}
              type="button"
            >
              Ver mapa de mastery completo
            </button>
            <a
              className="inline-flex h-11 w-full items-center justify-center rounded-[8px] border border-gray-300 px-4 text-center text-sm font-semibold text-[#1d1d1b]"
              href="/dashboard"
            >
              Ver avance y progreso
            </a>
          </div>
        </article>
        {showMasteryMap ? (
          <MasteryMapModal
            masteryMap={masteryMap}
            onClose={() => setShowMasteryMap(false)}
            recommendation={recommendedSubskill}
          />
        ) : null}
      </>
    );
  }

  if (mode === "reading" && readingUnit && !hasStartedReadingExercises) {
    return (
      <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid gap-2">
          <p className="m-0 text-sm font-medium text-gray-500">Estímulo de lectura</p>
          <h1 className="m-0 text-xl font-semibold">{readingUnit.title}</h1>
        </div>
        <p className="m-0 rounded border border-gray-200 bg-[#f7f7f4] p-3 text-base leading-7">
          {readingUnit.text}
        </p>
        <button
          className="w-full rounded bg-black py-2 text-white"
          onClick={() => setHasStartedReadingExercises(true)}
          type="button"
        >
          Empezar ejercicios
        </button>
      </article>
    );
  }

  return (
    <>
      {skillBanner}
      <div className={hasReadingStimulus ? "grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-start" : "grid gap-5"}>
        {hasReadingStimulus && activeReadingUnit ? (
          <ReadingStimulusPanel readingUnit={activeReadingUnit} />
        ) : null}
      <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-500">
          Pregunta {questionCount} de {sessionQuestionCount}
        </p>
        {currentExercise.text && mode === "practice" && !hasReadingStimulus ? (
          <section className="grid gap-2 rounded border border-[#d8d0a8] bg-[#fff8d7] p-3">
            {currentExercise.reading_unit ? (
              <p className="m-0 text-xs font-semibold uppercase text-[#6a5d21]">
                Texto base
              </p>
            ) : null}
            {currentExercise.reading_unit ? (
              <p className="m-0 text-sm font-semibold text-[#1d1d1b]">
                {currentExercise.reading_unit.title}
              </p>
            ) : null}
            <p className="m-0 text-sm leading-6 text-[#1d1d1b]">
              {currentExercise.text}
            </p>
          </section>
        ) : null}
        {mode === "reading" && readingUnit ? (
          <p className="m-0 text-sm font-semibold text-[#55554d]">
            Texto: {readingUnit.title}
          </p>
        ) : null}
        <div className="grid gap-2">
          {hasReadingStimulus ? (
            <p className="m-0 text-xs font-semibold uppercase text-[#6a5d21]">
              Resuelve desde el estímulo
            </p>
          ) : null}
          <h1 className="m-0 text-xl font-semibold leading-7">{currentExercise.prompt}</h1>
        </div>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <ExerciseAnswerFields
            categoryAnswers={categoryAnswers}
            currentExercise={currentExercise}
            handleAnswerChange={handleAnswerChange}
            handleCategoryAnswerChange={handleCategoryAnswerChange}
            handleMultipleAnswerChange={handleMultipleAnswerChange}
            handlePartAnswerChange={handlePartAnswerChange}
            hasSubmitted={hasSubmitted}
            options={options}
            partAnswers={partAnswers}
            selectedAnswer={selectedAnswer}
            selectedAnswers={selectedAnswers}
          />
          {hasSubmitted ? (
            <div
              className={`rounded border p-3 text-sm font-medium ${
                isCorrect
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <p>{isCorrect ? "Correcto" : "Incorrecto"}</p>
              <p>{isCorrect ? currentExercise.feedback_correct : currentExercise.feedback_incorrect}</p>
            </div>
          ) : null}
          {hasSubmitted ? (
            <button
              onClick={() => {
                void handleNext();
              }}
              type="button"
              className="w-full rounded bg-black py-2 text-center text-white"
            >
              Siguiente
            </button>
          ) : (
            <button
              disabled={!canSubmit}
              type="submit"
              className="w-full rounded bg-black py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Responder
            </button>
          )}
        </form>
      </article>
      </div>
    </>
  );
}

type ReadingStimulusPanelProps = {
  readingUnit: ReadingUnit;
};

function ReadingStimulusPanel({ readingUnit }: ReadingStimulusPanelProps) {
  const paragraphs = readingUnit.text.split(/\n{2,}/).filter(Boolean);

  return (
    <article className="grid gap-4 rounded-[8px] border border-[#d8d0a8] bg-[#fffdf0] p-4 lg:sticky lg:top-4">
      <div className="grid gap-1">
        <p className="m-0 text-xs font-semibold uppercase text-[#6a5d21]">Estímulo de lectura</p>
        <h2 className="m-0 text-2xl font-bold leading-8 text-[#1d1d1b]">{readingUnit.title}</h2>
        {readingUnit.subtitle ? (
          <p className="m-0 text-sm font-semibold text-[#55554d]">{readingUnit.subtitle}</p>
        ) : null}
        {readingUnit.sourceLabel ? (
          <p className="m-0 text-xs leading-5 text-[#6a5d21]">{readingUnit.sourceLabel}</p>
        ) : null}
      </div>
      {readingUnit.image ? (
        <figure className="m-0 grid gap-2">
          <img
            alt={readingUnit.image.alt}
            className="max-h-[260px] w-full rounded-[8px] object-cover object-top"
            src={readingUnit.image.src}
          />
          <figcaption className="text-xs leading-5 text-[#55554d]">
            {readingUnit.image.caption}
            {readingUnit.image.attribution ? ` ${readingUnit.image.attribution}.` : null}
          </figcaption>
        </figure>
      ) : null}
      <div className="grid max-h-[58vh] gap-3 overflow-auto pr-1 text-[15px] leading-7 text-[#1d1d1b] lg:max-h-[62vh]">
        {paragraphs.map((paragraph) => (
          <p className="m-0" key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
      {readingUnit.glossary && readingUnit.glossary.length > 0 ? (
        <details className="rounded-[8px] border border-[#d8d0a8] bg-white p-3">
          <summary className="cursor-pointer text-sm font-semibold text-[#1d1d1b]">Glosario</summary>
          <dl className="mt-3 grid gap-2">
            {readingUnit.glossary.map((entry) => (
              <div className="grid gap-1" key={entry.word}>
                <dt className="text-sm font-semibold">{entry.word}</dt>
                <dd className="m-0 text-sm leading-5 text-[#55554d]">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
    </article>
  );
}

type ExerciseAnswerFieldsProps = {
  categoryAnswers: Record<string, string>;
  currentExercise: Exercise;
  handleAnswerChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCategoryAnswerChange: (item: string, value: string) => void;
  handleMultipleAnswerChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePartAnswerChange: (partId: string, value: string) => void;
  hasSubmitted: boolean;
  options: string[];
  partAnswers: Record<string, string>;
  selectedAnswer: string;
  selectedAnswers: string[];
};

function ExerciseAnswerFields({
  categoryAnswers,
  currentExercise,
  handleAnswerChange,
  handleCategoryAnswerChange,
  handleMultipleAnswerChange,
  handlePartAnswerChange,
  hasSubmitted,
  options,
  partAnswers,
  selectedAnswer,
  selectedAnswers,
}: ExerciseAnswerFieldsProps) {
  if (currentExercise.parts && currentExercise.parts.length > 0) {
    return (
      <div className="grid gap-4">
        {currentExercise.parts.map((part) => (
          <fieldset className="grid gap-3 rounded-[8px] border border-gray-200 p-3" key={part.id}>
            <legend className="px-1 text-sm font-semibold text-[#1d1d1b]">
              {part.label ? `${part.label} ` : ""}{part.question}
            </legend>
            {part.options.map((option) => (
              <label className="flex items-center gap-3 rounded-[8px] border border-gray-200 p-3 text-base font-medium" key={option}>
                <input
                  checked={partAnswers[part.id] === option}
                  disabled={hasSubmitted}
                  name={`answer-${currentExercise.id}-${part.id}`}
                  onChange={() => handlePartAnswerChange(part.id, option)}
                  type="radio"
                  value={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
    );
  }

  if (currentExercise.categorization) {
    const categorization = currentExercise.categorization;

    return (
      <div className="grid gap-3">
        {currentExercise.fragment ? (
          <p className="m-0 rounded-[8px] border border-[#d8d0a8] bg-[#fff8d7] p-3 text-sm leading-6">
            {currentExercise.fragment}
          </p>
        ) : null}
        <div className="grid gap-2">
          {categorization.items.map((item) => (
            <label className="grid gap-2 rounded-[8px] border border-gray-200 p-3 text-sm font-semibold sm:grid-cols-[1fr_220px] sm:items-center" key={item}>
              <span>{item}</span>
              <select
                className="h-10 rounded-[8px] border border-gray-300 bg-white px-3 text-sm"
                disabled={hasSubmitted}
                onChange={(event) => handleCategoryAnswerChange(item, event.target.value)}
                value={categoryAnswers[item] ?? ""}
              >
                <option value="">Elegir categoría</option>
                {categorization.categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (currentExercise.type === "multiple_choice_multiple") {
    return (
      <>
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 rounded-[8px] border border-gray-200 p-3 text-base font-medium"
          >
            <input
              checked={selectedAnswers.includes(option)}
              disabled={hasSubmitted}
              name="answer"
              onChange={handleMultipleAnswerChange}
              type="checkbox"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </>
    );
  }

  return (
    <>
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center gap-3 rounded-[8px] border border-gray-200 p-3 text-base font-medium"
        >
          <input
            checked={selectedAnswer === option}
            disabled={hasSubmitted}
            name="answer"
            onChange={handleAnswerChange}
            type="radio"
            value={option}
          />
          <span>{option}</span>
        </label>
      ))}
    </>
  );
}

type MasteryMapModalProps = {
  masteryMap: MasteryMapNode[];
  onClose: () => void;
  recommendation: RecommendedSubskill | null;
};

function MasteryMapModal({ masteryMap, onClose, recommendation }: MasteryMapModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-10 grid place-items-center bg-black/40 px-4 py-6"
      role="dialog"
    >
      <section className="grid max-h-[85vh] w-full max-w-[560px] gap-4 overflow-hidden rounded-[8px] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="m-0 text-sm font-medium text-gray-500">Lengua</p>
            <h2 className="m-0 text-xl font-semibold">Mapa de mastery</h2>
          </div>
          <button
            className="rounded-[8px] border border-gray-300 px-3 py-2 text-sm font-semibold"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>
        <div className="grid gap-2 overflow-auto pr-1">
          {masteryMap.map((node) => (
            <div
              className={`grid gap-1 rounded-[8px] border p-3 ${
                recommendation?.id === node.id ? "border-[#1d1d1b] bg-[#f7f7f4]" : "border-gray-200"
              }`}
              key={node.id}
            >
              <p className="m-0 text-sm font-semibold text-[#1d1d1b]">{node.name}</p>
              <p className="m-0 text-xs font-medium text-[#55554d]">
                {node.id} · mastery {node.recommended_mastery}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function nextCorrectText(correct: number, total: number): string {
  return `${correct} / ${total} correctos`;
}

function hasAnswerForExercise(
  exercise: Exercise,
  selectedAnswer: string,
  selectedAnswers: string[],
  partAnswers: Record<string, string>,
  categoryAnswers: Record<string, string>,
): boolean {
  if (exercise.parts && exercise.parts.length > 0) {
    return exercise.parts.every((part) => Boolean(partAnswers[part.id]));
  }

  if (exercise.categorization) {
    return exercise.categorization.items.every((item) => Boolean(categoryAnswers[item]));
  }

  if (exercise.type === "multiple_choice_multiple") {
    return selectedAnswers.length > 0;
  }

  return Boolean(selectedAnswer);
}

function evaluateCurrentExercise(
  exercise: Exercise,
  selectedAnswer: string,
  selectedAnswers: string[],
  partAnswers: Record<string, string>,
  categoryAnswers: Record<string, string>,
): boolean {
  if (exercise.parts && exercise.parts.length > 0) {
    return exercise.parts.every((part) => partAnswers[part.id] === part.correctAnswer);
  }

  if (exercise.categorization) {
    return exercise.categorization.items.every((item) => (
      categoryAnswers[item] === exercise.categorization?.answers[item]
    ));
  }

  if (exercise.type === "multiple_choice_multiple") {
    return sameStringSet(selectedAnswers, exercise.correct_answers ?? [exercise.correct_answer]);
  }

  return selectedAnswer === exercise.correct_answer;
}

function sameStringSet(left: string[], right: string[]): boolean {
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  if (leftSet.size !== rightSet.size) {
    return false;
  }

  return Array.from(leftSet).every((item) => rightSet.has(item));
}

function buildPracticeHref(skillId: string, focus: string, usedExerciseIds: string[]): string {
  const params = new URLSearchParams({
    skill: skillId,
    focus,
  });

  if (usedExerciseIds.length > 0) {
    params.set("used", Array.from(new Set(usedExerciseIds)).join(","));
  }

  return `/practice?${params.toString()}`;
}

function pickExercise(exercises: Exercise[]): Exercise {
  return exercises[Math.floor(Math.random() * exercises.length)];
}

function getStableShuffledOptions(exercise: Exercise): string[] {
  return [...exercise.options].sort((left, right) => {
    const leftRank = getOptionRank(`${exercise.id}:${left}`);
    const rightRank = getOptionRank(`${exercise.id}:${right}`);

    return leftRank - rightRank || left.localeCompare(right);
  });
}

function getOptionRank(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
