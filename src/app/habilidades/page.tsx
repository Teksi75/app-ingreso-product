import { loadProgressAsync, type StoredProgress } from "@/storage/local_progress_store";
import {
  BottomNav,
  SidebarNav,
  Button,
} from "@/components/ui";
import { pickReadingUnitCandidate } from "@/practice/session_runner";
import { canonicalIdToSlug, readingUnitIdToSlug } from "@/skills/skill_slugs";
import { resolveStudentCode } from "@/app/student_identity";
import { withProgressCode } from "@/app/progress_code_href";

export const dynamic = "force-dynamic";

function getSkillData(progress: StoredProgress) {
  const skillStats = progress.skill_stats;

  const totalAttempts = progress.sessions.reduce((sum, s) => sum + s.total_attempts, 0);
  const totalCorrect = progress.sessions.reduce((sum, s) => sum + s.total_correct, 0);
  const globalAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const lenguaSkillIds = Object.keys(skillStats).filter(
    (id) => id.startsWith("lengua.skill_") && !id.includes(".subskill_")
  );

  let lenguaProgress = 0;
  let lenguaLevel = 1;
  let lenguaAccuracy = 0;
  let lenguaAttempts = 0;

  if (lenguaSkillIds.length > 0) {
    const totalSkillAccuracy = lenguaSkillIds.reduce((sum, id) => {
      const stats = skillStats[id];
      return stats.total_attempts > 0
        ? sum + stats.total_correct / stats.total_attempts
        : sum;
    }, 0);
    lenguaProgress = Math.round((totalSkillAccuracy / lenguaSkillIds.length) * 100);
    const avgMastery =
      lenguaSkillIds.reduce((sum, id) => sum + (skillStats[id].mastery_level ?? 1), 0) /
      lenguaSkillIds.length;
    lenguaLevel = Math.max(1, Math.round(avgMastery));

    const totalLenguaAttempts = lenguaSkillIds.reduce((sum, id) => sum + skillStats[id].total_attempts, 0);
    const totalLenguaCorrect = lenguaSkillIds.reduce((sum, id) => sum + skillStats[id].total_correct, 0);
    lenguaAccuracy = totalLenguaAttempts > 0 ? Math.round((totalLenguaCorrect / totalLenguaAttempts) * 100) : 0;
    lenguaAttempts = totalLenguaAttempts;
  }

  return {
    totalAttempts,
    globalAccuracy,
    lenguaProgress,
    lenguaLevel,
    lenguaAccuracy,
    lenguaAttempts,
  };
}

// Solo Matemática y Lengua - las únicas materias del ingreso
const HABILIDADES_BASE = [
  {
    id: "matematica",
    name: "Matemática",
    description: "Números, operaciones, geometría y lógica",
    icon: "🧮",
    color: "teal",
    topics: ["Aritmética", "Fracciones", "Geometría", "Proporciones", "Estadística"],
    practiceHref: "",
    isAvailable: false,
  },
  {
    id: "lengua",
    name: "Lengua",
    description: "Comprensión lectora, gramática y escritura",
    icon: "📚",
    color: "violet",
    topics: ["Comprensión lectora", "Gramática", "Vocabulario", "Ortografía", "Escritura"],
    practiceHref: `/practice?mode=training&skill=${canonicalIdToSlug("lengua.skill_1")}`,
    isAvailable: true,
  },
];

// Configuración de colores
const colorConfig: Record<string, { bg: string; text: string; button: string; progress: string; border: string }> = {
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    button: "bg-teal-500 hover:bg-teal-600",
    progress: "bg-teal-500",
    border: "border-teal-100",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    button: "bg-violet-500 hover:bg-violet-600",
    progress: "bg-violet-500",
    border: "border-violet-100",
  },
};

type HabilidadesPageProps = {
  searchParams: Promise<{
    code?: string | string[];
    student?: string | string[];
  }>;
};

export default async function HabilidadesPage({ searchParams }: HabilidadesPageProps) {
  const params = await searchParams;
  const explicitCode = getParam(params.code) ?? getParam(params.student);
  const studentCode = await resolveStudentCode(explicitCode);
  const progressCode = explicitCode ? studentCode : undefined;
  const progress = await loadProgressAsync(studentCode);
  const data = getSkillData(progress);
  const defaultReadingUnit = pickReadingUnitCandidate(null);
  const recommendationHref = defaultReadingUnit
    ? `/practice?mode=reading&unit=${encodeURIComponent(readingUnitIdToSlug(defaultReadingUnit.id))}`
    : `/practice?mode=training&skill=${canonicalIdToSlug("lengua.skill_1")}`;

  const HABILIDADES = HABILIDADES_BASE.map((skill) => {
    if (skill.id === "lengua") {
      return {
        ...skill,
        level: data.lenguaLevel,
        progress: data.lenguaProgress,
        xp: data.lenguaAttempts * 10,
        xpTotal: 1000,
        exercises: data.lenguaAttempts,
        accuracy: data.lenguaAccuracy,
      };
    }
    return {
      ...skill,
      level: 1,
      progress: 0,
      xp: 0,
      xpTotal: 1000,
      exercises: 0,
      accuracy: 0,
    };
  });

  const totalExercises = HABILIDADES.reduce((acc, h) => acc + h.exercises, 0);
  const averageAccuracy = Math.round(
    HABILIDADES.reduce((acc, h) => acc + h.accuracy, 0) / HABILIDADES.length
  );

  return (
    <div className="min-h-screen dashboard-shell flex">
      {/* Sidebar - Desktop only */}
      <SidebarNav />

      {/* Main Content */}
      <main className="flex-1 min-w-0 min-h-screen pb-24 lg:pb-0">
        {/* Header Mobile */}
        <header className="lg:hidden glass-subtle border-b border-white/70">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-slate-900">Mis Habilidades</h1>
                <p className="text-xs font-medium text-slate-500">Tu mapa de entrenamiento</p>
              </div>
              <div className="w-11 h-11 rounded-2xl gradient-ingenium flex items-center justify-center text-xl shadow-soft-sm">
                🎯
              </div>
            </div>
          </div>
        </header>

        {/* Header Desktop */}
        <header className="hidden lg:block glass-subtle border-b border-white/70">
          <div className="px-6 py-5 xl:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Entrenamiento INGENIUM</p>
                <h1 className="text-2xl font-extrabold text-slate-900">Mis Habilidades</h1>
                <p className="text-slate-500">Dominá Matemática y Lengua para el ingreso</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="panel-pastel min-w-36 px-4 py-3 text-right">
                  <p className="text-sm text-slate-500">Ejercicios totales</p>
                  <p className="text-2xl font-bold text-teal-600">{totalExercises}</p>
                </div>
                <div className="panel-pastel min-w-32 px-4 py-3 text-right bg-[var(--bg-pastel-amber)]">
                  <p className="text-sm text-slate-500">Precisión</p>
                  <p className="text-2xl font-bold text-orange-600">{averageAccuracy}%</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto w-full max-w-7xl p-4 sm:px-6 lg:p-8">

          {/* Tip destacado arriba */}
          <div className="gradient-mission relative mb-6 overflow-hidden rounded-[2rem] p-5 text-white shadow-soft-lg sm:p-6 lg:mb-8">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute bottom-5 right-7 hidden text-6xl opacity-25 md:block">📚</div>
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/18 text-2xl shadow-soft-sm ring-1 ring-white/25">
                💡
                </div>
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">Próxima misión recomendada</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight lg:text-3xl">Potenciá Lengua hoy</h2>
                  <p className="mt-2 text-sm text-white/82 lg:text-base">
                    <span className="font-bold text-white">Lengua</span> es donde más podés mejorar ahora. Arrancá con una práctica guiada y sumá progreso real.
                </p>
                </div>
              </div>
              <Button
                href={withProgressCode(recommendationHref, progressCode)}
                variant="secondary"
                size="lg"
                className="relative bg-white text-violet-700 hover:bg-violet-50 font-bold shadow-soft-sm"
              >
                Practicar ahora
              </Button>
            </div>
          </div>

          {/* Habilidades tipo juego */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {HABILIDADES.map((skill) => {
              const colors = colorConfig[skill.color];

              return (
                <div
                  key={skill.id}
                  className={`
                    panel-pastel group relative overflow-hidden p-5 transition-all duration-300
                    hover:shadow-soft-md hover:-translate-y-0.5 sm:p-6
                    ${colors.border}
                  `}
                >
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${colors.bg} blur-2xl opacity-70`} />
                  {/* Header con nivel */}
                  <div className="relative mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-soft-sm ring-1 ring-white/80
                        ${colors.bg}
                      `}>
                        {skill.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">{skill.name}</h3>
                        <p className="text-sm text-slate-500">{skill.description}</p>
                      </div>
                    </div>
                    <div className={`
                      rounded-full px-3 py-1 text-sm font-bold shadow-soft-sm
                      ${colors.bg} ${colors.text}
                    `}>
                      {skill.isAvailable ? `Nivel: ${skill.level}` : "Próximamente"}
                    </div>
                  </div>

                  {skill.isAvailable ? (
                    <>
                      {/* Fortalezas y debilidades */}
                      <div className="relative mb-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                          <span className="text-lg">🟢</span>
                          <span className="ml-2 text-xs font-bold uppercase tracking-wide text-emerald-600">Fuerte</span>
                          <p className="mt-1 text-sm font-medium text-slate-700">Uso de verbos</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
                          <span className="text-lg">🟡</span>
                          <span className="ml-2 text-xs font-bold uppercase tracking-wide text-amber-600">Medio</span>
                          <p className="mt-1 text-sm font-medium text-slate-700">Comprensión</p>
                        </div>
                        <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-100">
                          <span className="text-lg">🔴</span>
                          <span className="ml-2 text-xs font-bold uppercase tracking-wide text-rose-600">Débil</span>
                          <p className="mt-1 text-sm font-medium text-slate-700">Gramática</p>
                        </div>
                      </div>

                      <div className="relative mb-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white/80 p-3 text-center shadow-soft-sm">
                          <p className="text-xs font-medium text-slate-500">Ejercicios</p>
                          <p className="text-xl font-extrabold text-slate-900">{skill.exercises}</p>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-3 text-center shadow-soft-sm">
                          <p className="text-xs font-medium text-slate-500">Precisión</p>
                          <p className="text-xl font-extrabold text-slate-900">{skill.accuracy}%</p>
                        </div>
                      </div>

                      {/* Barra de progreso simple */}
                      <div className="relative mb-6">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progreso</span>
                          <span className="text-sm font-extrabold text-slate-800">{skill.progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                          <div
                            className={`h-full ${colors.progress} rounded-full transition-all duration-500`}
                            style={{ width: `${skill.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="relative border-t border-slate-100 pt-5">
                        <Button
                          href={withProgressCode(skill.practiceHref, progressCode)}
                          fullWidth
                          size="md"
                          className={`
                            relative w-full rounded-2xl py-3 font-bold text-white shadow-soft-md
                            transition-all duration-200 hover:-translate-y-0.5 active:scale-95
                            ${colors.button}
                          `}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <span>⚡</span>
                            Practicar ahora
                          </span>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="relative rounded-2xl bg-slate-50/90 p-5 text-center ring-1 ring-slate-100">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-soft-sm">🚧</div>
                      <p className="text-sm font-bold text-slate-700">Matemática está en preparación</p>
                      <p className="mt-1 text-xs text-slate-500">Disponible en breve con ejercicios y simulaciones.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
