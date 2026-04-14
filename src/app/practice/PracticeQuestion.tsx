"use client";

import { FormEvent, useState, type ChangeEvent } from "react";
import { type Exercise } from "../../practice/session_runner";

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
  const [usedExercises, setUsedExercises] = useState<string[]>([
    ...usedExerciseIds,
    exercise.id,
  ]);
  const [questionCount, setQuestionCount] = useState(1);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const hasSubmitted = submittedAnswer !== null;
  const isCorrect = submittedAnswer === currentExercise.correct_answer;
  const available = exercisePool.filter((item) => !usedExercises.includes(item.id));

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
    if (questionCount >= MAX_QUESTIONS) {
      setSessionCompleted(true);
      return;
    }

    const nextPool = available.length > 0 ? available : exercisePool;
    const nonRepeatingPool =
      nextPool.length > 1
        ? nextPool.filter((item) => item.id !== currentExercise.id)
        : nextPool;
    const candidatePool = nonRepeatingPool.length > 0 ? nonRepeatingPool : nextPool;
    const nextExercise = pickExercise(candidatePool);

    setCurrentExercise(nextExercise);
    setUsedExercises((prev) => [...prev, nextExercise.id]);
    setQuestionCount((prev) => prev + 1);
    setSelectedAnswer("");
    setSubmittedAnswer(null);
  }

  if (sessionCompleted) {
    return (
      <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <h1 className="text-xl font-semibold">Sesion completada</h1>
        <a
          className="w-full rounded bg-black py-2 text-center text-white"
          href={`/practice?skill=${currentExercise.skill_id}`}
        >
          Volver a practicar
        </a>
      </article>
    );
  }

  return (
    <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-medium text-gray-500">
        Pregunta {questionCount} de {MAX_QUESTIONS}
      </p>
      <h1 className="text-xl font-semibold">{currentExercise.prompt}</h1>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        {currentExercise.options.map((option) => (
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
  );
}

function pickExercise(exercises: Exercise[]): Exercise {
  return exercises[Math.floor(Math.random() * exercises.length)];
}
