"use client";

import { FormEvent, useState, type ChangeEvent } from "react";
import { type Exercise } from "../../practice/session_runner";

type PracticeQuestionProps = {
  exercise: Exercise;
  exercisePool: Exercise[];
  usedExerciseIds: string[];
};

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
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const isCorrect = submittedAnswer === currentExercise.correct_answer;
  const available = exercisePool.filter((item) => !usedExercises.includes(item.id));

  console.log("usedExercises:", usedExercises);
  console.log("available:", available.length);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedAnswer) {
      setSubmittedAnswer(selectedAnswer);
    }
  }

  function handleAnswerChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedAnswer(event.target.value);
    setSubmittedAnswer(null);
  }

  function handleNext() {
    const nextPool = available.length > 0 ? available : exercisePool;
    const nonRepeatingPool =
      nextPool.length > 1
        ? nextPool.filter((item) => item.id !== currentExercise.id)
        : nextPool;
    const candidatePool = nonRepeatingPool.length > 0 ? nonRepeatingPool : nextPool;
    const nextExercise = pickExercise(candidatePool);

    setCurrentExercise(nextExercise);
    setUsedExercises((prev) => [...prev, nextExercise.id]);
    setSelectedAnswer("");
    setSubmittedAnswer(null);
  }

  return (
    <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <h1 className="text-xl font-semibold">{currentExercise.prompt}</h1>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        {currentExercise.options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 rounded border border-gray-200 p-3 text-base font-medium"
          >
            <input
              checked={selectedAnswer === option}
              name="answer"
              onChange={handleAnswerChange}
              type="radio"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
        {submittedAnswer ? (
          <div className={isCorrect ? "text-green-500" : "text-red-500"}>
            {isCorrect ? currentExercise.feedback_correct : currentExercise.feedback_incorrect}
          </div>
        ) : null}
        {submittedAnswer ? (
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
