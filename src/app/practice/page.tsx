import {
  getLenguaMasteryMap,
  recommendNextSubskill,
  type MasteryLevel,
  type RecommendedSubskill,
} from "../../components/practice/exercise_selector";
import { startPracticeSession } from "../../components/practice/session_runner";
import { loadProgress, saveSessionResult, type SkillState } from "../../storage/local_progress_store";
import { PracticeQuestion } from "./PracticeQuestion";

type PracticePageProps = {
  searchParams: Promise<{
    focus?: string | string[];
    newStudent?: string | string[];
    skill?: string | string[];
    used?: string | string[];
  }>;
};

export type PracticeSessionProgressInput = {
  currentFocus: string;
  skillId: string;
  attempts: number;
  correct: number;
  currentMastery: MasteryLevel;
};

export type PracticeSessionProgressResult = {
  masteryLevel: MasteryLevel;
  recommendation: RecommendedSubskill | null;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
  const focus = Array.isArray(params.focus) ? params.focus[0] : params.focus;
  const newStudent = Array.isArray(params.newStudent) ? params.newStudent[0] : params.newStudent;
  const skill = Array.isArray(params.skill) ? params.skill[0] : params.skill;
  const used = Array.isArray(params.used) ? params.used[0] : params.used;
  const usedExerciseIds = parseUsedExerciseIds(used);
  const forceNewStudent = isEnabledParam(newStudent);
  const restartHref = buildRestartHref(skill, forceNewStudent);
  const {
    exercise,
    exercisePool,
    usedExerciseIds: activeUsedExerciseIds,
  } = startPracticeSession(
    skill ?? null,
    usedExerciseIds,
    { forceNewStudent },
  );
  const focusedExercisePool = focus
    ? exercisePool.filter((item) => item.subskill === focus)
    : exercisePool;
  const activeExercisePool = focusedExercisePool.length > 0 ? focusedExercisePool : exercisePool;
  const activeExercise = activeExercisePool.find((item) => !activeUsedExerciseIds.includes(item.id))
    ?? activeExercisePool[0]
    ?? exercise;

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-md gap-5">
        <PracticeQuestion
          exercise={activeExercise}
          exercisePool={activeExercisePool}
          masteryMap={getLenguaMasteryMap()}
          restartHref={restartHref}
          saveProgress={savePracticeSessionProgress}
          usedExerciseIds={activeUsedExerciseIds}
        />
      </section>
    </main>
  );
}

function parseUsedExerciseIds(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isEnabledParam(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function buildRestartHref(skill: string | undefined, forceNewStudent: boolean): string {
  if (forceNewStudent) {
    return "/practice?newStudent=1";
  }

  if (skill) {
    return `/practice?skill=${encodeURIComponent(skill)}`;
  }

  return "/practice";
}

async function savePracticeSessionProgress(
  input: PracticeSessionProgressInput,
): Promise<PracticeSessionProgressResult> {
  "use server";

  const masteryLevel = calculateUpdatedMastery(input);
  const skillState = getSkillState(masteryLevel);

  saveSessionResult({
    mode: "practice",
    total_attempts: input.attempts,
    total_correct: input.correct,
    total_errors: input.attempts - input.correct,
    skill_results: [
      {
        skill_id: input.skillId,
        attempts: input.attempts,
        correct: input.correct,
        state: skillState,
        mastery_level: masteryLevel,
      },
      {
        skill_id: input.currentFocus,
        attempts: input.attempts,
        correct: input.correct,
        state: skillState,
        mastery_level: masteryLevel,
      },
    ],
  });

  const masteryByFocus = getStoredMasteryByFocus();
  masteryByFocus[input.currentFocus] = masteryLevel;
  masteryByFocus[input.skillId] = Math.max(masteryByFocus[input.skillId] ?? 1, masteryLevel);

  return {
    masteryLevel,
    recommendation: recommendNextSubskill({
      currentFocus: input.currentFocus,
      masteryByFocus,
    }),
  };
}

function calculateUpdatedMastery(input: PracticeSessionProgressInput): MasteryLevel {
  const accuracy = input.attempts > 0 ? input.correct / input.attempts : 0;
  const delta = accuracy >= 0.8 ? 1 : accuracy < 0.5 ? -1 : 0;
  const next = input.currentMastery + delta;

  if (next >= 4) {
    return 4;
  }

  if (next >= 3) {
    return 3;
  }

  if (next >= 2) {
    return 2;
  }

  return 1;
}

function getSkillState(masteryLevel: MasteryLevel): SkillState {
  if (masteryLevel >= 3) {
    return "mastered";
  }

  if (masteryLevel === 2) {
    return "developing";
  }

  return "weak";
}

function getStoredMasteryByFocus(): Record<string, number> {
  const progress = loadProgress();

  return Object.fromEntries(
    Object.entries(progress.skill_stats).map(([skillId, stats]) => [
      skillId,
      stats.mastery_level ?? 1,
    ]),
  );
}
