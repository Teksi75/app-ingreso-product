import { startPracticeSession } from "../../practice/session_runner";
import { PracticeQuestion } from "./PracticeQuestion";

type PracticePageProps = {
  searchParams: Promise<{
    skill?: string | string[];
    used?: string | string[];
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
  const skill = Array.isArray(params.skill) ? params.skill[0] : params.skill;
  const used = Array.isArray(params.used) ? params.used[0] : params.used;
  const usedExerciseIds = parseUsedExerciseIds(used);
  const {
    exercise,
    exercisePool,
    usedExerciseIds: activeUsedExerciseIds,
  } = startPracticeSession(
    skill ?? null,
    usedExerciseIds,
  );

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-md gap-5">
        <PracticeQuestion
          exercise={exercise}
          exercisePool={exercisePool}
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
