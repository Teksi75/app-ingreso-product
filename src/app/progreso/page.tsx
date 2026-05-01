import {
  BottomNav,
  SidebarNav,
} from "@/components/ui";
import { buildProgressSummary, formatDuration } from "@/app/progress_summary";
import { resolveStudentCode } from "@/app/student_identity";
import { loadProgressAsync } from "@/storage/local_progress_store";

export const dynamic = "force-dynamic";

type ProgresoPageProps = {
  searchParams: Promise<{
    code?: string | string[];
    continue?: string | string[];
    student?: string | string[];
  }>;
};

export default async function ProgresoPage({ searchParams }: ProgresoPageProps) {
  const params = await searchParams;
  const studentCode = await resolveStudentCode(getParam(params.code) ?? getParam(params.student));
  const progress = await loadProgressAsync(studentCode);
  const summary = buildProgressSummary(progress);
  const continueHref = normalizeContinueHref(getParam(params.continue));
  const reportUrl = `/reporte?code=${encodeURIComponent(studentCode)}`;
  const downloadUrl = `/reporte/datos?code=${encodeURIComponent(studentCode)}`;
  const mailtoHref = buildMailtoHref(studentCode, summary.accuracy, summary.totalAttempts, summary.activeDays);

  return (
    <div className="min-h-screen dashboard-shell flex">
      <SidebarNav />

      <main className="min-h-screen min-w-0 flex-1 pb-24 lg:pb-0">
        {/* Header Mobile */}
        <header className="lg:hidden glass-subtle border-b border-white/70">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-slate-900">Mi Progreso</h1>
                <p className="text-xs font-medium text-slate-500">Datos de entrenamiento de Lengua</p>
              </div>
              <div className="w-11 h-11 rounded-2xl gradient-ingenium flex items-center justify-center text-xl shadow-soft-sm">
                📊
              </div>
            </div>
          </div>
        </header>

        {/* Header Desktop */}
        <header className="hidden lg:block glass-subtle border-b border-white/70">
          <div className="px-6 py-5 xl:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Reporte INGENIUM</p>
                <h1 className="text-2xl font-extrabold text-slate-900">Mi Progreso</h1>
                <p className="text-slate-500">Datos reales del entrenamiento de Lengua</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-[40px] items-center justify-center rounded-2xl border border-violet-100 bg-white/80 px-4 text-sm font-bold text-slate-700 shadow-soft-sm hover:text-violet-700"
                  href={downloadUrl}
                >
                  Descargar reporte
                </a>
                {continueHref ? (
                  <a
                    className="inline-flex min-h-[40px] items-center justify-center rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white shadow-soft-sm hover:bg-teal-700"
                    href={continueHref}
                  >
                    Continuar entrenamiento
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl p-4 sm:px-6 lg:p-8">
          {/* Código de progreso */}
          <section className="panel-pastel p-5 mb-5">
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-500">Código de progreso</p>
            <p className="mt-2 mb-0 font-mono text-lg font-bold text-slate-900">{studentCode}</p>
          </section>

          {/* Stats rápidas */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            <StatCard label="Ejercicios" value={summary.totalAttempts.toString()} icon="📖" />
            <StatCard label="Tiempo total" value={formatDuration(summary.totalDurationSeconds)} icon="⏱️" />
            <StatCard label="Días activos" value={summary.activeDays.toString()} icon="📅" />
            <StatCard label="Precisión" value={`${summary.accuracy}%`} icon="🎯" />
          </section>

          {/* Gráficos */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
            <div className="panel-pastel p-5">
              <h2 className="mb-4 mt-0 text-base font-bold text-slate-800 flex items-center gap-2">
                <span>📊</span> Actividad semanal
              </h2>
              <div className="flex h-40 items-end justify-between gap-2">
                {summary.weeklyData.map((day) => (
                  <div className="flex flex-1 flex-col items-center" key={day.date}>
                    <div
                      className="relative w-full overflow-hidden rounded-t-xl bg-slate-100"
                      style={{ height: `${Math.max(day.exercises * 8, 4)}px` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-500 to-teal-400"
                        style={{ height: `${day.accuracy}%` }}
                      />
                    </div>
                    <span className="mt-2 text-sm font-medium text-slate-600">{day.day}</span>
                    <span className="text-xs text-slate-400">{day.exercises}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-pastel p-5">
              <h2 className="mb-4 mt-0 text-base font-bold text-slate-800 flex items-center gap-2">
                <span>📚</span> Lengua por habilidad
              </h2>
              <div className="space-y-4">
                {summary.skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-1 flex justify-between gap-3">
                      <span className="truncate text-sm font-medium text-slate-700">{skill.title}</span>
                      <span className="text-sm font-bold text-slate-800">Nv. {skill.masteryLevel}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                        style={{ width: `${Math.max(skill.masteryScore, skill.attempts > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                    <p className="m-0 mt-1 text-xs text-slate-500">
                      {skill.attempts} ejercicios · {skill.accuracy}% precisión
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reporte para la familia */}
          <section className="gradient-mission relative overflow-hidden rounded-[2rem] p-5 text-white shadow-soft-lg sm:p-6 lg:p-8 mb-6">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute bottom-5 right-7 hidden text-6xl opacity-25 md:block">📋</div>
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-xl font-extrabold lg:text-2xl">Reporte para la familia</h2>
                <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-white/82">
                  Compartí este reporte sin exponer datos personales. El enlace muestra solo el progreso asociado al código.
                </p>
              </div>
              <div className="relative flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-[40px] items-center justify-center rounded-2xl bg-white px-4 text-sm font-bold text-violet-700 shadow-soft-sm hover:bg-violet-50"
                  href={reportUrl}
                >
                  Ver reporte online
                </a>
                <a
                  className="inline-flex min-h-[40px] items-center justify-center rounded-2xl bg-white/15 px-4 text-sm font-bold text-white shadow-soft-sm hover:bg-white/25 ring-1 ring-white/20"
                  href={mailtoHref}
                >
                  Enviar por email
                </a>
              </div>
            </div>
          </section>

          {continueHref ? (
            <section className="panel-pastel bg-[var(--bg-pastel-emerald)] p-5 mb-6 ring-1 ring-emerald-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="m-0 text-lg font-bold text-slate-900">Seguir sin repetir</h2>
                  <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Podés volver al siguiente foco recomendado y continuar desde lo que acabás de completar.
                  </p>
                </div>
                <a
                  className="inline-flex min-h-[42px] items-center justify-center rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white shadow-soft-sm hover:bg-teal-700"
                  href={continueHref}
                >
                  Continuar entrenamiento
                </a>
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="panel-pastel flex items-center gap-4 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-xl">
        {icon}
      </div>
      <div>
        <p className="m-0 text-xs font-medium text-slate-500">{label}</p>
        <p className="m-0 mt-1 text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function buildMailtoHref(studentCode: string, accuracy: number, totalAttempts: number, activeDays: number): string {
  const subject = "Reporte de progreso Teksi75";
  const body = [
    "Reporte de progreso Teksi75",
    `Código de progreso: ${studentCode}`,
    `Ejercicios realizados: ${totalAttempts}`,
    `Precisión: ${accuracy}%`,
    `Días activos: ${activeDays}`,
    `Reporte online: /reporte?code=${studentCode}`,
  ].join("\n");

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeContinueHref(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  if (!value.startsWith("/practice?") && value !== "/practice") {
    return null;
  }

  return value;
}
