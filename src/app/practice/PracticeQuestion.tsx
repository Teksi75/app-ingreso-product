"use client";

import { FormEvent, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui";
import {
  type Exercise,
  type PracticeSelection,
  type PracticeSessionFocusResult,
  type RecommendedSubskill,
  type MasteryNode,
  type PracticeSessionProgressInput,
  type PracticeSessionProgressResult,
} from "../../components/practice/session_runner";
import { getSkillMetadata } from "../../skills/skill_metadata";
import { type ReadingUnit } from "../../types/reading_unit";

type PracticeQuestionProps = {
  session: PracticeSelection;
  masteryMap: MasteryNode[];
  restartHref: string;
  saveProgress: (input: PracticeSessionProgressInput) => Promise<PracticeSessionProgressResult>;
};

type AnsweredExerciseResult = {
  exerciseId: string;
  correct: boolean;
};

const MAX_QUESTIONS = 10;

export function PracticeQuestion({
  session,
  masteryMap,
  restartHref,
  saveProgress,
}: PracticeQuestionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [usedExercises, setUsedExercises] = useState<string[]>(
    Array.from(new Set(session.usedExerciseIds)),
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredResults, setAnsweredResults] = useState<AnsweredExerciseResult[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [progressResult, setProgressResult] = useState<PracticeSessionProgressResult | null>(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [showMasteryMap, setShowMasteryMap] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [partAnswers, setPartAnswers] = useState<Record<string, string>>({});
  const [categoryAnswers, setCategoryAnswers] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const questionRef = useRef<HTMLElement>(null);
  const currentExercise = session.sessionExercises[currentExerciseIndex] ?? session.exercise;
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
  const sessionQuestionCount = Math.min(MAX_QUESTIONS, session.sessionExercises.length);
  const skillMetadata = getSkillMetadata(currentExercise.skill_id);
  const options = getStableShuffledOptions(currentExercise);
  const hasReadingStimulus = session.sessionType === "reading-based" && Boolean(session.readingUnit);
  const activeReadingUnit = session.readingUnit;
  const sessionLabel = session.sessionType === "reading-based"
    ? "Lectura y actividades"
    : "Habilidad en entrenamiento";
  const skillBanner = (
    <aside className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500 text-white flex items-center justify-center text-sm font-bold">
          📚
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
          {sessionLabel}
        </p>
      </div>
      <p className="text-lg font-bold text-slate-800">
        {skillMetadata.title}
      </p>
      <p className="text-xs font-semibold text-violet-600 mt-1">
        {skillMetadata.id}
      </p>
      <p className="text-sm leading-5 text-slate-600 mt-2">
        {skillMetadata.description}
      </p>
      <p className="text-sm leading-5 text-slate-500 mt-2">
        <span className="font-semibold text-slate-700">Foco actual:</span> {currentExercise.subskill}
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
    const nextAnsweredResults = [
      ...answeredResults.filter((result) => result.exerciseId !== currentExercise.id),
      { exerciseId: currentExercise.id, correct: isCorrect },
    ];

    setCorrectCount(nextCorrectCount);
    setAnsweredResults(nextAnsweredResults);

    if (currentExerciseIndex + 1 >= sessionQuestionCount) {
      setSessionCompleted(true);
      setIsSavingProgress(true);

      try {
        const focusResults = buildFocusResults(
          session.sessionExercises.slice(0, sessionQuestionCount),
          nextAnsweredResults,
        );
        const result = await saveProgress({
          sessionType: session.sessionType,
          currentFocus: currentExercise.subskill,
          skillId: currentExercise.skill_id,
          attempts: currentExerciseIndex + 1,
          correct: nextCorrectCount,
          currentMastery: currentExercise.mastery_level,
          readingUnitId: currentExercise.readingUnitId ?? currentExercise.reading_unit_id ?? undefined,
          focusResults,
        });

        setProgressResult(result);
      } finally {
        setIsSavingProgress(false);
      }

      return;
    }

    const nextExercise = session.sessionExercises[currentExerciseIndex + 1];

    if (!nextExercise) {
      return;
    }

    setCurrentExerciseIndex((prev) => prev + 1);
    setUsedExercises((prev) => [...prev, nextExercise.id]);
    setSelectedAnswer("");
    setSelectedAnswers([]);
    setPartAnswers({});
    setCategoryAnswers({});
    setHasSubmitted(false);
  }

  if (sessionCompleted) {
    const masteryLevel = progressResult?.masteryLevel ?? currentExercise.mastery_level;
    const recommendedSubskill = progressResult?.recommendation ?? null;
        const repeatHref = buildPracticeHref(
          currentExercise.skill_id,
          currentExercise.subskill,
          usedExercises,
          { mode: session.mode, readingUnitId: session.readingUnit?.id },
        );
    const recommendedHref = recommendedSubskill
      ? buildPracticeHref(recommendedSubskill.parentSkill, recommendedSubskill.id, [], { mode: "training" })
      : restartHref;

    return (
      <>
        {skillBanner}
        <article className="grid gap-5 rounded-2xl border border-slate-100 bg-white p-5 lg:p-6 shadow-sm">
          <div className="grid gap-2">
            <p className="text-sm font-medium text-slate-500">Sesión completada</p>
            <h1 className="text-2xl font-bold text-slate-800">
              {nextCorrectText(correctCount, sessionQuestionCount)}
            </h1>
            {session.sessionType === "reading-based" && session.readingUnit ? (
              <p className="text-sm text-slate-500">Texto trabajado: {session.readingUnit.title}</p>
            ) : null}
            <p className="text-sm font-semibold text-slate-600">
              Mastery actualizado: {isSavingProgress ? "guardando..." : `nivel ${masteryLevel}`}
            </p>
          </div>
          <div className="grid gap-3">
            {masteryLevel < 3 ? (
              <Button href={repeatHref} variant="primary" size="md" fullWidth>
                Repetir con variación
              </Button>
            ) : null}
            <Button
              href={recommendedSubskill ? recommendedHref : undefined}
              variant="outline"
              size="md"
              fullWidth
              disabled={!recommendedSubskill || isSavingProgress}
            >
              Siguiente subskill recomendada
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setShowMasteryMap(true)}
            >
              Ver mapa de mastery completo
            </Button>
            <Button href="/dashboard" variant="ghost" size="md" fullWidth>
              Ver avance y progreso
            </Button>
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

  return (
    <>
      {skillBanner}
      <div className={hasReadingStimulus ? "grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-start" : "grid gap-5"}>
        <article ref={questionRef} className={`grid gap-4 rounded-2xl border border-slate-100 bg-white p-4 lg:p-5 shadow-sm mb-6 lg:mb-0 ${hasReadingStimulus ? "order-2 lg:order-2" : ""}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Pregunta {currentExerciseIndex + 1} de {sessionQuestionCount}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-slate-400">{currentExercise.subskill}</span>
            </div>
          </div>
          {currentExercise.text && !hasReadingStimulus ? (
            <section className="grid gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
              {currentExercise.reading_unit ? (
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Texto de referencia
                </p>
              ) : null}
              {currentExercise.reading_unit ? (
                <p className="text-sm font-bold text-slate-800">
                  {currentExercise.reading_unit.title}
                </p>
              ) : null}
              <p className="text-sm leading-6 text-slate-700">
                {currentExercise.text}
              </p>
            </section>
          ) : null}

          <div className="grid gap-2">
            {hasReadingStimulus ? (
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Usando el texto como contexto
              </p>
            ) : null}
            <h1 className="text-lg lg:text-xl font-bold leading-7 text-slate-800">{currentExercise.prompt}</h1>
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
                className={`rounded-xl border p-4 text-sm font-medium ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <p className="font-bold mb-1">{isCorrect ? "¡Correcto!" : "Incorrecto"}</p>
                <p className="leading-5">{isCorrect ? currentExercise.feedback_correct : currentExercise.feedback_incorrect}</p>
              </div>
            ) : null}
            {hasSubmitted ? (
              <Button
                onClick={() => {
                  void handleNext();
                }}
                variant="primary"
                size="md"
                fullWidth
              >
                Siguiente
              </Button>
            ) : (
              <Button
                disabled={!canSubmit}
                variant="primary"
                size="md"
                fullWidth
                type="submit"
              >
                Responder
              </Button>
            )}
          </form>
        </article>
        {hasReadingStimulus && activeReadingUnit ? (
            <div className="order-1 lg:order-1 mb-4 lg:mb-0">
              <ReadingStimulusPanel
                readingUnit={activeReadingUnit}
                questionRef={questionRef}
              />
            </div>
          ) : null}
      </div>
    </>
  );
}

type ReadingStimulusPanelProps = {
  readingUnit: ReadingUnit;
  questionRef: React.RefObject<HTMLElement | null>;
};

function ReadingStimulusPanel({ readingUnit, questionRef }: ReadingStimulusPanelProps) {
  const paragraphs = readingUnit.text.split(/\n{2,}/).filter(Boolean);
  const glossaryRef = useRef<HTMLDetailsElement>(null);

  function scrollToQuestion() {
    questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleGlossaryToggle() {
    if (glossaryRef.current?.open) {
      setTimeout(() => {
        glossaryRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }

  return (
    <article className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-4 lg:px-8 lg:py-6 shadow-sm lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:sticky lg:top-6">
      <div className="grid gap-1">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Texto de práctica</p>
        <h2 className="text-xl lg:text-2xl font-bold leading-8 text-slate-800">{readingUnit.title}</h2>
        {readingUnit.subtitle ? (
          <p className="text-sm font-semibold text-slate-600">{readingUnit.subtitle}</p>
        ) : null}
        {readingUnit.sourceLabel ? (
          <p className="text-xs leading-5 text-slate-500">{readingUnit.sourceLabel}</p>
        ) : null}
      </div>
      {readingUnit.image ? (
        <figure className="m-0 grid gap-2">
          <img
            alt={readingUnit.image.alt}
            className="max-h-[200px] w-full rounded-xl object-contain object-top lg:max-h-[180px]"
            src={readingUnit.image.src}
          />
          <figcaption className="text-xs leading-5 text-slate-500">
            {readingUnit.image.caption}
            {readingUnit.image.attribution ? ` ${readingUnit.image.attribution}.` : null}
          </figcaption>
        </figure>
      ) : null}
      <div className="grid max-h-[50vh] gap-3 overflow-auto pr-1 text-[15px] leading-7 text-slate-700 lg:max-h-[45vh]">
        {paragraphs.map((paragraph) => (
          <p className="m-0" key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
      {readingUnit.glossary && readingUnit.glossary.length > 0 ? (
        <details ref={glossaryRef} onToggle={handleGlossaryToggle} className="group rounded-xl border border-violet-200 bg-white overflow-hidden shadow-sm">
          <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 bg-violet-500 hover:bg-violet-600 transition-colors shadow-sm">
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              <svg className="w-4 h-4 text-violet-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Glosario
            </span>
            <svg className="w-4 h-4 text-violet-100 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <dl className="p-4 grid gap-3 bg-violet-50">
            {readingUnit.glossary.map((entry) => (
              <div className="grid gap-1" key={entry.word}>
                <dt className="text-sm font-bold text-violet-800">{entry.word}</dt>
                <dd className="m-0 text-sm leading-5 text-slate-600">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
      <Button
        onClick={scrollToQuestion}
        variant="secondary"
        size="sm"
        fullWidth
        className="lg:hidden"
      >
        Volver a la pregunta
      </Button>
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
          <fieldset className="grid gap-3 rounded-xl border border-slate-200 p-3" key={part.id}>
            <legend className="px-1 text-sm font-bold text-slate-800">
              {part.label ? `${part.label} ` : ""}{part.question}
            </legend>
            {part.options.map((option) => (
              <label
                className={`flex items-center gap-3 rounded-xl border p-3 text-base font-medium transition-colors ${
                  partAnswers[part.id] === option
                    ? "border-violet-300 bg-violet-50 text-violet-800"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                } ${hasSubmitted ? "cursor-default" : "cursor-pointer"}`}
                key={option}
              >
                <input
                  checked={partAnswers[part.id] === option}
                  disabled={hasSubmitted}
                  name={`answer-${currentExercise.id}-${part.id}`}
                  onChange={() => handlePartAnswerChange(part.id, option)}
                  type="radio"
                  value={option}
                  className="accent-violet-600 w-4 h-4"
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
          <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm leading-6 text-slate-700">
            {currentExercise.fragment}
          </p>
        ) : null}
        <div className="grid gap-2">
          {categorization.items.map((item) => (
            <label className="grid gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold sm:grid-cols-[1fr_220px] sm:items-center text-slate-700" key={item}>
              <span>{item}</span>
              <select
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
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
            className={`flex items-center gap-3 rounded-xl border p-3 text-base font-medium transition-colors ${
              selectedAnswers.includes(option)
                ? "border-violet-300 bg-violet-50 text-violet-800"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            } ${hasSubmitted ? "cursor-default" : "cursor-pointer"}`}
          >
            <input
              checked={selectedAnswers.includes(option)}
              disabled={hasSubmitted}
              name="answer"
              onChange={handleMultipleAnswerChange}
              type="checkbox"
              value={option}
              className="accent-violet-600 w-4 h-4 rounded"
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
          className={`flex items-center gap-3 rounded-xl border p-3 text-base font-medium transition-colors ${
            selectedAnswer === option
              ? "border-violet-300 bg-violet-50 text-violet-800"
              : "border-slate-200 hover:bg-slate-50 text-slate-700"
          } ${hasSubmitted ? "cursor-default" : "cursor-pointer"}`}
        >
          <input
            checked={selectedAnswer === option}
            disabled={hasSubmitted}
            name="answer"
            onChange={handleAnswerChange}
            type="radio"
            value={option}
            className="accent-violet-600 w-4 h-4"
          />
          <span>{option}</span>
        </label>
      ))}
    </>
  );
}

type MasteryMapModalProps = {
  masteryMap: MasteryNode[];
  onClose: () => void;
  recommendation: RecommendedSubskill | null;
};

function MasteryMapModal({ masteryMap, onClose, recommendation }: MasteryMapModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-6"
      role="dialog"
    >
      <section className="grid max-h-[85vh] w-full max-w-[560px] gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Lengua</p>
            <h2 className="text-xl font-bold text-slate-800">Mapa de mastery</h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
        <div className="grid gap-2 overflow-auto pr-1">
          {masteryMap.map((node) => (
            <div
              className={`grid gap-1 rounded-xl border p-3 ${
                recommendation?.id === node.id
                  ? "border-violet-300 bg-violet-50"
                  : "border-slate-100 hover:bg-slate-50"
              }`}
              key={node.id}
            >
              <p className="text-sm font-bold text-slate-800">{node.name}</p>
              <p className="text-xs font-medium text-slate-500">
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

function buildPracticeHref(
  skillId: string,
  focus: string,
  usedExerciseIds: string[],
  context: { mode: PracticeSelection["mode"]; readingUnitId?: string },
): string {
  const params = new URLSearchParams({
    skill: skillId,
    focus,
    mode: context.mode,
  });

  if (context.mode === "reading" && context.readingUnitId) {
    params.set("unit", context.readingUnitId);
  }

  if (usedExerciseIds.length > 0) {
    params.set("used", Array.from(new Set(usedExerciseIds)).join(","));
  }

  return `/practice?${params.toString()}`;
}

function buildFocusResults(
  exercises: Exercise[],
  answeredResults: AnsweredExerciseResult[],
): PracticeSessionFocusResult[] {
  const byExerciseId = new Map(answeredResults.map((result) => [result.exerciseId, result]));
  const byFocus = new Map<string, PracticeSessionFocusResult>();

  for (const exercise of exercises) {
    const answered = byExerciseId.get(exercise.id);

    if (!answered) {
      continue;
    }

    const previous = byFocus.get(exercise.subskill);

    byFocus.set(exercise.subskill, {
      focusId: exercise.subskill,
      skillId: exercise.skill_id,
      attempts: (previous?.attempts ?? 0) + 1,
      correct: (previous?.correct ?? 0) + (answered.correct ? 1 : 0),
      currentMastery: Math.max(previous?.currentMastery ?? 1, exercise.mastery_level) as 1 | 2 | 3 | 4,
    });
  }

  return [...byFocus.values()];
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
