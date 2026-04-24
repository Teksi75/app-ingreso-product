"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BottomNav,
  Button,
  SidebarNav,
} from "@/components/ui";

export type PublicSimulatorExercise = {
  id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  options: string[];
};

export type PublicSimulatorSession = {
  mode: "simulator";
  totalQuestions: number;
  exercises: PublicSimulatorExercise[];
};

export type SimulatorAnswerInput = {
  exerciseId: string;
  answer: string;
  timeSeconds?: number;
};

export type SimulatorSaveResult = {
  scorePercentage: number;
  totalCorrect: number;
  totalAttempts: number;
  skillResults: Array<{
    skillId: string;
    attempts: number;
    correct: number;
    state: "weak" | "developing" | "mastered";
    masteryLevel: number;
  }>;
  weakSkill: string | null;
};

type SimulatorQuestionProps = {
  session: PublicSimulatorSession;
  saveProgress: (answers: SimulatorAnswerInput[]) => Promise<SimulatorSaveResult>;
};

type SimulatorStage = "start" | "running" | "finished";

export function SimulatorQuestion({ session, saveProgress }: SimulatorQuestionProps) {
  const [stage, setStage] = useState<SimulatorStage>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<SimulatorAnswerInput[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<SimulatorSaveResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentExercise = session.exercises[currentIndex];
  const totalQuestions = session.totalQuestions;
  const canGoNext = Boolean(selectedAnswer) && !isSaving;

  function startSimulation() {
    setStage("running");
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);
    setSelectedAnswer("");
    setQuestionStartedAt(Date.now());
  }

  async function goNext() {
    if (!currentExercise || !selectedAnswer) {
      return;
    }

    const nextAnswers = [
      ...answers,
      {
        exerciseId: currentExercise.id,
        answer: selectedAnswer,
        timeSeconds: questionStartedAt ? Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000)) : undefined,
      },
    ];

    setAnswers(nextAnswers);

    if (currentIndex + 1 >= totalQuestions) {
      setIsSaving(true);

      try {
        const saveResult = await saveProgress(nextAnswers);
        setResult(saveResult);
        setStage("finished");
      } finally {
        setIsSaving(false);
      }

      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setSelectedAnswer("");
    setQuestionStartedAt(Date.now());
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav />
      <main className="flex-1 min-w-0 min-h-screen pb-28 lg:pb-0">
        <header className="bg-white border-b border-slate-100">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 lg:px-6 lg:py-5">
            <div>
              <p className="text-sm font-semibold text-teal-600">Lengua</p>
              <h1 className="text-xl font-bold text-slate-800 lg:text-2xl">Simulación</h1>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
              {totalQuestions} preguntas
            </div>
          </div>
        </header>
        <section className="mx-auto grid w-full max-w-5xl gap-5 p-4 lg:p-6">
          {stage === "start" ? (
            <StartPanel questionCount={totalQuestions} onStart={startSimulation} />
          ) : null}
          {stage === "running" && currentExercise ? (
            <QuestionPanel
              canGoNext={canGoNext}
              currentExercise={currentExercise}
              currentIndex={currentIndex}
              isSaving={isSaving}
              onNext={() => {
                void goNext();
              }}
              onSelect={setSelectedAnswer}
              selectedAnswer={selectedAnswer}
              totalQuestions={totalQuestions}
            />
          ) : null}
          {stage === "finished" && result ? (
            <ResultPanel result={result} />
          ) : null}
        </section>
      </main>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

function StartPanel({
  questionCount,
  onStart,
}: {
  questionCount: number;
  onStart: () => void;
}) {
  return (
    <article className="grid gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Simulador de Lengua</p>
        <h2 className="text-2xl font-bold text-slate-800">Resolver una sesión completa</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          La sesión toma {questionCount} preguntas canónicas y guarda el resultado al finalizar.
        </p>
      </div>
      <div>
        <Button onClick={onStart} size="lg" variant="primary">
          Iniciar simulación
        </Button>
      </div>
    </article>
  );
}

function QuestionPanel({
  canGoNext,
  currentExercise,
  currentIndex,
  isSaving,
  onNext,
  onSelect,
  selectedAnswer,
  totalQuestions,
}: {
  canGoNext: boolean;
  currentExercise: PublicSimulatorExercise;
  currentIndex: number;
  isSaving: boolean;
  onNext: () => void;
  onSelect: (answer: string) => void;
  selectedAnswer: string;
  totalQuestions: number;
}) {
  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <article className="grid gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-500">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </p>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {currentExercise.skill_id}
          </span>
        </div>
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Progreso</span>
            <span>{progressPercentage}% completado</span>
          </div>
          <div
            aria-label={`Progreso: ${progressPercentage}% completado`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progressPercentage}
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
          {currentExercise.subskill}
        </p>
        <h2 className="text-xl font-bold leading-8 text-slate-800">
          {currentExercise.prompt}
        </h2>
      </div>
      <fieldset className="grid gap-3">
        <legend className="sr-only">Opciones de respuesta</legend>
        {currentExercise.options.map((option) => (
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-base font-medium transition-colors ${
              selectedAnswer === option
                ? "border-teal-300 bg-teal-50 text-teal-800"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            key={option}
          >
            <input
              checked={selectedAnswer === option}
              className="h-4 w-4 accent-teal-600"
              name={`sim-answer-${currentExercise.id}`}
              onChange={() => onSelect(option)}
              type="radio"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
      <div className="flex justify-end">
        <Button disabled={!canGoNext} isLoading={isSaving} onClick={onNext} variant="primary">
          Siguiente
        </Button>
      </div>
    </article>
  );
}

function ResultPanel({ result }: { result: SimulatorSaveResult }) {
  return (
    <article className="grid gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-bold text-slate-800">Resultado de la simulación</h2>
        <p className="text-5xl font-bold text-teal-600">{result.scorePercentage}%</p>
        <p className="text-sm font-semibold text-slate-600">
          {result.totalCorrect} / {result.totalAttempts} correctas
        </p>
        {result.weakSkill ? (
          <p className="text-base font-semibold text-slate-700">
            Tu punto más débil fue: {result.weakSkill}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3">
        {result.skillResults.map((skillResult) => {
          const accuracy = Math.round((skillResult.correct / skillResult.attempts) * 100);

          return (
            <div className="rounded-xl border border-slate-100 p-4" key={skillResult.skillId}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-slate-800">{skillResult.skillId}</p>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {formatState(skillResult.state)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {skillResult.correct} / {skillResult.attempts} correctas · {accuracy}%
              </p>
            </div>
          );
        })}
      </div>
      {result.weakSkill ? (
        <div className="grid gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-700">Skill más débil</p>
          <p className="font-bold text-slate-800">{result.weakSkill}</p>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-500 px-5 py-3 text-base font-semibold text-white shadow-md shadow-teal-200 transition-colors hover:bg-teal-600"
            href={`/practice?skill=${result.weakSkill}`}
          >
            Practicar esta habilidad
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function formatState(state: SimulatorSaveResult["skillResults"][number]["state"]): string {
  if (state === "weak") {
    return "A reforzar";
  }

  if (state === "developing") {
    return "En desarrollo";
  }

  return "Dominada";
}
