"use client";

import { useState } from "react";
import {
  BottomNav,
  Button,
  SidebarNav,
} from "@/components/ui";
import { type NextStepRecommendation } from "../../recommendation/next_step";
import { getSkillMetadata } from "../../skills/skill_metadata";
import { withProgressCode } from "../progress_code_href";

export type PublicSimulatorExercise = {
  id: string;
  block_id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  options: string[];
};

export type PublicSimulatorBlock = {
  id: string;
  type: "reading_unit" | "standalone";
  title: string;
  exerciseIds: string[];
  readingUnit?: {
    id: string;
    title: string;
    subtitle?: string;
    text: string;
    sourceLabel?: string;
  };
};

export type PublicSimulatorSession = {
  mode: "simulator";
  blocks: PublicSimulatorBlock[];
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
  recommendation: NextStepRecommendation | null;
};

type SimulatorQuestionProps = {
  progressCode?: string;
  session: PublicSimulatorSession;
  saveProgress: (answers: SimulatorAnswerInput[]) => Promise<SimulatorSaveResult>;
};

type SimulatorStage = "start" | "running" | "finished";

export function SimulatorQuestion({ progressCode, session, saveProgress }: SimulatorQuestionProps) {
  const [stage, setStage] = useState<SimulatorStage>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<SimulatorAnswerInput[]>([]);
  const [introducedBlockIds, setIntroducedBlockIds] = useState<string[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<SimulatorSaveResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentExercise = session.exercises[currentIndex];
  const currentBlock = currentExercise
    ? session.blocks.find((block) => block.id === currentExercise.block_id) ?? null
    : null;
  const shouldShowReadingIntro = stage === "running" &&
    currentBlock?.type === "reading_unit" &&
    !introducedBlockIds.includes(currentBlock.id);
  const totalQuestions = session.totalQuestions;
  const canGoNext = Boolean(selectedAnswer) && !isSaving;

  function startSimulation() {
    const firstExercise = session.exercises[0];
    const firstBlock = firstExercise
      ? session.blocks.find((block) => block.id === firstExercise.block_id) ?? null
      : null;

    setStage("running");
    setCurrentIndex(0);
    setAnswers([]);
    setIntroducedBlockIds([]);
    setResult(null);
    setSelectedAnswer("");
    setQuestionStartedAt(firstBlock?.type === "reading_unit" ? null : Date.now());
  }

  function startBlockQuestions(blockId: string) {
    setIntroducedBlockIds((previous) => Array.from(new Set([...previous, blockId])));
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
    const nextExercise = session.exercises[currentIndex + 1];
    const nextBlock = nextExercise
      ? session.blocks.find((block) => block.id === nextExercise.block_id) ?? null
      : null;

    setQuestionStartedAt(
      nextBlock?.type === "reading_unit" && !introducedBlockIds.includes(nextBlock.id)
        ? null
        : Date.now(),
    );
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
          {shouldShowReadingIntro && currentBlock?.readingUnit ? (
            <ReadingBlockIntro
              block={currentBlock}
              onStart={() => startBlockQuestions(currentBlock.id)}
            />
          ) : null}
          {stage === "running" && currentExercise && !shouldShowReadingIntro ? (
            <QuestionPanel
              canGoNext={canGoNext}
              currentBlock={currentBlock}
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
            <ResultPanel progressCode={progressCode} result={result} />
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
  const details = [
    { label: "Duración estimada", value: "15 min" },
    { label: "Preguntas", value: `${questionCount} de Lengua` },
    { label: "Cobertura", value: "7 habilidades" },
    { label: "Después", value: "score y refuerzo" },
  ];

  return (
    <article className="grid gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Simulador de Lengua</p>
        <h2 className="text-2xl font-bold text-slate-800">Resolver una sesión completa</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          La sesión toma {questionCount} preguntas canónicas y guarda el resultado al finalizar.
        </p>
      </div>
      <div className="grid gap-3 rounded-xl border border-teal-100 bg-teal-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((detail) => (
          <div className="rounded-lg bg-white/75 p-3" key={detail.label}>
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-teal-700">{detail.label}</p>
            <p className="m-0 mt-1 text-sm font-bold text-slate-800">{detail.value}</p>
          </div>
        ))}
      </div>
      <p className="m-0 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm leading-6 text-slate-700">
        Consejo: hacelo cuando estés descansado. Al terminar vas a ver qué habilidades ya están firmes y cuáles conviene reforzar antes del examen.
      </p>
      <div>
        <Button onClick={onStart} size="lg" variant="primary">
          Iniciar simulación
        </Button>
      </div>
    </article>
  );
}

function ReadingBlockIntro({
  block,
  onStart,
}: {
  block: PublicSimulatorBlock;
  onStart: () => void;
}) {
  const readingUnit = block.readingUnit;

  if (!readingUnit) {
    return null;
  }

  return (
    <article className="grid gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
          Bloque de comprensión lectora
        </p>
        <h2 className="text-2xl font-bold text-slate-800">{readingUnit.title}</h2>
        {readingUnit.subtitle ? (
          <p className="text-base font-semibold text-slate-600">{readingUnit.subtitle}</p>
        ) : null}
        <p className="text-sm text-slate-500">
          Lee el texto completo antes de responder las {block.exerciseIds.length} preguntas de este bloque.
        </p>
      </div>
      <div className="max-h-[58vh] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="whitespace-pre-line text-base leading-7 text-slate-800">
          {readingUnit.text}
        </div>
      </div>
      {readingUnit.sourceLabel ? (
        <p className="text-xs font-medium text-slate-500">{readingUnit.sourceLabel}</p>
      ) : null}
      <div className="flex justify-end">
        <Button onClick={onStart} variant="primary">
          Comenzar preguntas
        </Button>
      </div>
    </article>
  );
}

function QuestionPanel({
  canGoNext,
  currentBlock,
  currentExercise,
  currentIndex,
  isSaving,
  onNext,
  onSelect,
  selectedAnswer,
  totalQuestions,
}: {
  canGoNext: boolean;
  currentBlock: PublicSimulatorBlock | null;
  currentExercise: PublicSimulatorExercise;
  currentIndex: number;
  isSaving: boolean;
  onNext: () => void;
  onSelect: (answer: string) => void;
  selectedAnswer: string;
  totalQuestions: number;
}) {
  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const skillMetadata = getSkillMetadata(currentExercise.skill_id);
  const subskillMetadata = getSkillMetadata(currentExercise.subskill);

  return (
    <article className="grid gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-500">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </p>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {skillMetadata.title}
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
        {currentBlock?.type === "reading_unit" ? (
          <p className="text-sm font-semibold text-slate-500">
            Texto leído: {currentBlock.title}
          </p>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
          {subskillMetadata.title}
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

function ResultPanel({ progressCode, result }: { progressCode?: string; result: SimulatorSaveResult }) {
  const recommendation = result.recommendation;

  return (
    <article className="grid gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-bold text-slate-800">Resultado de la simulación</h2>
        <p className="text-5xl font-bold text-teal-600">{result.scorePercentage}%</p>
        <p className="text-sm font-semibold text-slate-600">
          {result.totalCorrect} / {result.totalAttempts} correctas
        </p>
        {recommendation ? (
          <p className="text-base font-semibold text-slate-700">
            {recommendation.description}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3">
        {result.skillResults.map((skillResult) => {
          const accuracy = Math.round((skillResult.correct / skillResult.attempts) * 100);
          const skillMetadata = getSkillMetadata(skillResult.skillId);

          return (
            <div className="rounded-xl border border-slate-100 p-4" key={skillResult.skillId}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-slate-800">{skillMetadata.title}</p>
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
      {recommendation ? (
        <div className="grid gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-700">Siguiente paso recomendado</p>
          <p className="font-bold text-slate-800">{recommendation.title}</p>
          <p className="text-sm leading-5 text-slate-600">{recommendation.reason}</p>
          <Button href={withProgressCode(recommendation.href, progressCode)} variant="primary" size="md">
            {recommendation.ctaLabel}
          </Button>
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
