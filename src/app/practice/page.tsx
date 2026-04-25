import {
  BottomNav,
  Button,
  SidebarNav,
} from "@/components/ui";
import {
  getLenguaMasteryMap,
  savePracticeSessionProgress,
  startPracticeSessionAsync,
  startReadingUnitSessionAsync,
  type PracticeMode,
  type PracticeSessionProgressInput,
  type PracticeSessionProgressResult,
} from "../../components/practice/session_runner";
import { slugToCanonicalId, slugToReadingUnitId } from "../../skills/skill_slugs";
import { PracticeQuestion } from "./PracticeQuestion";
import { resolveStudentCode } from "../student_identity";

type PracticePageProps = {
  searchParams: Promise<{
    code?: string | string[];
    focus?: string | string[];
    mode?: string | string[];
    newStudent?: string | string[];
    skill?: string | string[];
    student?: string | string[];
    unit?: string | string[];
    used?: string | string[];
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
  const studentCode = await resolveStudentCode(getParam(params.code) ?? getParam(params.student));
  const focus = Array.isArray(params.focus) ? params.focus[0] : params.focus;
  const modeParam = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const newStudent = Array.isArray(params.newStudent) ? params.newStudent[0] : params.newStudent;
  const skillParam = Array.isArray(params.skill) ? params.skill[0] : params.skill;
  const unitParam = Array.isArray(params.unit) ? params.unit[0] : params.unit;
  const used = Array.isArray(params.used) ? params.used[0] : params.used;
  const skill = resolveSkillId(skillParam);
  const unit = resolveReadingUnitId(unitParam);
  const usedExerciseIds = parseUsedExerciseIds(used);
  const forceNewStudent = isEnabledParam(newStudent);
  const practiceMode: PracticeMode = modeParam === "reading" || unit ? "reading" : "training";
  const practiceSelection = practiceMode === "reading"
    ? await startReadingUnitSessionAsync(unit ?? null, usedExerciseIds, { forceNewStudent, focusSubskill: focus, studentCode })
    : await startPracticeSessionAsync(
      skill ?? null,
      usedExerciseIds,
      { forceNewStudent, focusSubskill: focus, includeReadingUnits: false, studentCode },
    );
  if (!practiceSelection?.exercise) {
    return <PracticeUnavailable />;
  }

  const resolvedReadingUnitId = practiceSelection.sessionType === "reading-based"
    ? practiceSelection.readingUnit?.id
    : undefined;

  const restartHref = buildRestartHref({
    skill: skill ?? undefined,
    forceNewStudent,
    mode: practiceMode,
    unit: resolvedReadingUnitId,
  });

  const pageTitle = practiceSelection.sessionType === "reading-based"
    ? "Comprensión lectora"
    : "Entrenamiento";

  async function saveProgress(input: PracticeSessionProgressInput): Promise<PracticeSessionProgressResult> {
    "use server";

    return savePracticeSessionProgress(input, studentCode);
  }

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
            saveProgress={saveProgress}
          />
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function PracticeUnavailable() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav />
      <main className="flex-1 min-w-0 min-h-screen pb-36 lg:pb-0">
        <section className="mx-auto grid w-full max-w-3xl gap-5 p-4 lg:p-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="m-0 text-sm font-semibold text-teal-700">Práctica no disponible</p>
            <h1 className="mt-2 mb-3 text-2xl font-bold text-slate-800">
              No encontramos ejercicios para iniciar esta sesión
            </h1>
            <p className="m-0 max-w-2xl text-base leading-7 text-slate-600">
              Puede faltar contenido o haber un problema temporal de carga. Volvé al tablero o revisá las habilidades disponibles para elegir otra práctica.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/dashboard" variant="primary" size="md">
                Ir al tablero
              </Button>
              <Button href="/habilidades" variant="secondary" size="md">
                Ver habilidades
              </Button>
            </div>
          </div>
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

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function resolveSkillId(rawSkill: string | undefined): string | null {
  if (!rawSkill) {
    return null;
  }

  const canonical = slugToCanonicalId(rawSkill);
  if (canonical) {
    return canonical;
  }

  return null;
}

function resolveReadingUnitId(rawUnit: string | undefined): string | null {
  if (!rawUnit) {
    return null;
  }

  const canonical = slugToReadingUnitId(rawUnit);
  if (canonical) {
    return canonical;
  }

  return null;
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
