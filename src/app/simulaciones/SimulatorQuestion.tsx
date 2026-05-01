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
    <div className="min-h-screen dashboard-shell flex">
      <SidebarNav />
      <main className="flex-1 min-w-0 min-h-screen pb-28 lg:pb-0">
        <header className="glass-subtle border-b border-white/70">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-10 lg:py-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Simulador INGENIUM</p>
              <h1 className="text-xl font-bold text-slate-900 lg:text-2xl">Simulación de Lengua</h1>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-white/80 px-3 py-2 text-sm font-semibold text-violet-700 shadow-soft-sm">
              {totalQuestions} preguntas
            </div>
          </div>
        </header>
        <section className="mx-auto grid w-full max-w-7xl gap-8 p-4 sm:px-6 lg:p-10">
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
  return (
    <article className="gradient-mission relative grid min-h-[360px] overflow-hidden rounded-[2.25rem] p-6 text-white shadow-soft-lg sm:p-8 lg:max-w-4xl lg:p-10">
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-8 right-10 hidden text-7xl opacity-20 md:block">🧪</div>

      <div className="relative grid gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/18 text-3xl shadow-soft-sm ring-1 ring-white/25">🧪</div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">Simulación de Lengua</p>
        <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Sesión completa</h2>
        <p className="max-w-2xl text-sm text-white/82 lg:text-base">
          Practicá una experiencia parecida al examen: lectura, preguntas y resultado final en una sola sesión.
        </p>
      </div>
       
      <div className="relative grid grid-cols-1 gap-4 text-center sm:grid-cols-2">
        <div className="rounded-3xl bg-white/16 p-5 ring-1 ring-white/20">
          <div className="text-3xl font-extrabold text-white">{questionCount}</div>
          <div className="text-sm font-medium text-white/78">preguntas</div>
        </div>
        <div className="rounded-3xl bg-white/16 p-5 ring-1 ring-white/20">
          <div className="text-3xl font-extrabold text-white">15</div>
          <div className="text-sm font-medium text-white/78">minutos</div>
        </div>
      </div>
       
      <p className="relative m-0 rounded-2xl bg-white/14 p-4 text-sm leading-6 text-white/84 ring-1 ring-white/20">
        💡 Consejo: hacelo cuando estés tranquilo
      </p>
       
      <div className="relative border-t border-white/20 pt-6">
        <Button onClick={onStart} size="lg" variant="secondary" fullWidth className="bg-white text-teal-700 hover:bg-teal-50 font-bold shadow-soft-md">
          Empezar simulación
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
    <article className="grid gap-5 panel-pastel p-5 lg:p-6">
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
    <article className="grid gap-5 panel-pastel p-5 lg:p-6">
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
        <h2 className="text-xl font-bold leading-8 text-slate-800" data-testid="simulator-question">
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
            data-testid="answer-option"
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
    <article className="grid gap-5 panel-pastel p-5 lg:p-6">
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
