"use client";

import { FormEvent, useState, type ChangeEvent } from "react";
import { type Exercise } from "../../practice/session_runner";
import { getSkillMetadata } from "../../skills/skill_metadata";

type PracticeQuestionProps = {
  exercise: Exercise;
  exercisePool: Exercise[];
  usedExerciseIds: string[];
};

const MAX_QUESTIONS = 10;

export function PracticeQuestion({
  exercise,
  exercisePool,
  usedExerciseIds,
}: PracticeQuestionProps) {
  const [currentExercise, setCurrentExercise] = useState(exercise);
  const [usedExercises, setUsedExercises] = useState<string[]>(
    Array.from(new Set([...usedExerciseIds, exercise.id])),
  );
  const [questionCount, setQuestionCount] = useState(1);
  const [sessionCompleted, setSessionCompleted] = useState(false);
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

  function handleNext() {
    if (questionCount >= sessionQuestionCount || available.length === 0) {
      setSessionCompleted(true);
      return;
    }

    const nextExercise = pickExercise(available);

    setCurrentExercise(nextExercise);
    setUsedExercises((prev) => [...prev, nextExercise.id]);
    setQuestionCount((prev) => prev + 1);
    setSelectedAnswer("");
    setSubmittedAnswer(null);
  }

  if (sessionCompleted) {
    return (
      <>
        {skillBanner}
        <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
          <h1 className="text-xl font-semibold">Sesion completada</h1>
          <a
            className="w-full rounded bg-black py-2 text-center text-white"
            href={`/practice?skill=${currentExercise.skill_id}`}
          >
            Volver a practicar
          </a>
        </article>
      </>
    );
  }

  return (
    <>
      {skillBanner}
      <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-500">
          Pregunta {questionCount} de {sessionQuestionCount}
        </p>
        {currentExercise.text ? (
          <p className="m-0 rounded border border-gray-200 bg-[#f7f7f4] p-3 text-base leading-7">
            {currentExercise.text}
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
              onClick={handleNext}
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
