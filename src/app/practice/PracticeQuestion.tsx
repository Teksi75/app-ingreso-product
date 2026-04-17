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
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const hasSubmitted = submittedAnswer !== null;
  const isCorrect = submittedAnswer === currentExercise.correct_answer;
  const sessionQuestionCount = Math.min(MAX_QUESTIONS, exercisePool.length);
  const available = exercisePool.filter((item) => !usedExercises.includes(item.id));
  const skillMetadata = getSkillMetadata(currentExercise.skill_id);
  const options = getStableShuffledOptions(currentExercise);
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

    if (selectedAnswer && !hasSubmitted) {
      setSubmittedAnswer(selectedAnswer);
    }
  }

  function handleAnswerChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedAnswer(event.target.value);
    setSubmittedAnswer(null);
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
    setSubmittedAnswer(null);
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
          <p className="m-0 text-sm font-medium text-gray-500">Lectura completa</p>
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
      {mode === "practice" ? skillBanner : null}
      <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-500">
          Pregunta {questionCount} de {sessionQuestionCount}
        </p>
        {currentExercise.text && mode === "practice" ? (
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
        <h1 className="text-xl font-semibold">{currentExercise.prompt}</h1>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 rounded border border-gray-200 p-3 text-base font-medium"
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
            <button type="submit" className="w-full rounded bg-black py-2 text-white">
              Responder
            </button>
          )}
        </form>
      </article>
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
