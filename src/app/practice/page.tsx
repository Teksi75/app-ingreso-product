import { startPracticeSession } from "../../practice/session_runner";
import { PracticeQuestion } from "./PracticeQuestion";

type PracticePageProps = {
  searchParams: Promise<{
    newStudent?: string | string[];
    skill?: string | string[];
    used?: string | string[];
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
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

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-md gap-5">
        <PracticeQuestion
          exercise={exercise}
          exercisePool={exercisePool}
          restartHref={restartHref}
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
