import {
  BottomNav,
  SidebarNav,
} from "@/components/ui";
import {
  getLenguaMasteryMap,
  savePracticeSessionProgress,
  startPracticeSession,
  startReadingUnitSession,
  type PracticeMode,
} from "../../components/practice/session_runner";
import { PracticeQuestion } from "./PracticeQuestion";

type PracticePageProps = {
  searchParams: Promise<{
    focus?: string | string[];
    mode?: string | string[];
    newStudent?: string | string[];
    skill?: string | string[];
    unit?: string | string[];
    used?: string | string[];
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
  const focus = Array.isArray(params.focus) ? params.focus[0] : params.focus;
  const modeParam = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const newStudent = Array.isArray(params.newStudent) ? params.newStudent[0] : params.newStudent;
  const skill = Array.isArray(params.skill) ? params.skill[0] : params.skill;
  const unit = Array.isArray(params.unit) ? params.unit[0] : params.unit;
  const used = Array.isArray(params.used) ? params.used[0] : params.used;
  const usedExerciseIds = parseUsedExerciseIds(used);
  const forceNewStudent = isEnabledParam(newStudent);
  const practiceMode: PracticeMode = modeParam === "reading" || unit ? "reading" : "training";
  const readingUnitId = unit ?? "RU-LEN-BIO-001";
  const restartHref = buildRestartHref({ skill, forceNewStudent, mode: practiceMode, unit: readingUnitId });
  const practiceSelection = practiceMode === "reading"
    ? startReadingUnitSession(readingUnitId, usedExerciseIds, { forceNewStudent, focusSubskill: focus })
    : startPracticeSession(
      skill ?? null,
      usedExerciseIds,
      { forceNewStudent, focusSubskill: focus, includeReadingUnits: false },
    );
  if (!practiceSelection?.exercise) {
    throw new Error("No exercise available for practice session");
  }

  const pageTitle = practiceSelection.sessionType === "reading-based"
    ? "Comprensión lectora"
    : "Entrenamiento";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav />
      <main className="flex-1 min-w-0 min-h-screen pb-36 lg:pb-0">
        <header className="lg:hidden bg-white border-b border-slate-100">
          <div className="max-w-lg mx-auto px-4 py-4">
            <h1 className="text-lg font-bold text-slate-800">{pageTitle}</h1>
          </div>
        </header>
        <section className="mx-auto grid w-full max-w-6xl gap-5 p-4 lg:p-6">
          <PracticeQuestion
            session={practiceSelection}
            masteryMap={getLenguaMasteryMap()}
            restartHref={restartHref}
            saveProgress={savePracticeSessionProgress}
          />
        </section>
      </main>
      <BottomNav />
    </div>
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

function buildRestartHref({
  skill,
  forceNewStudent,
  mode,
  unit,
}: {
  skill: string | undefined;
  forceNewStudent: boolean;
  mode: PracticeMode;
  unit?: string;
}): string {
  const params = new URLSearchParams();

  if (skill) {
    params.set("skill", skill);
  }

  if (mode === "reading") {
    params.set("mode", "reading");
    if (unit) {
      params.set("unit", unit);
    }
  } else {
    params.set("mode", "training");
  }

  if (forceNewStudent) {
    params.set("newStudent", "1");
  }

  const query = params.toString();
  return query ? `/practice?${query}` : "/practice";
}
