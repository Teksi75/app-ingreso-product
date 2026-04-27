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
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav />

      <main className="min-h-screen min-w-0 flex-1 pb-24 lg:pb-0">
        <header className="border-b border-slate-100 bg-white">
          <div className="px-4 py-4 lg:px-6 lg:py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="m-0 text-xl font-bold text-slate-800 lg:text-2xl">Mi Progreso</h1>
                <p className="m-0 mt-1 text-sm text-slate-500">
                  Datos reales del entrenamiento de Lengua
                </p>
              </div>
              <a
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800"
                href={downloadUrl}
              >
                Descargar reporte
              </a>
              {continueHref ? (
                <a
                  className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-bold text-white hover:bg-teal-800"
                  href={continueHref}
                >
                  Continuar entrenamiento
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <div className="grid gap-6 p-4 lg:p-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-500">Código de progreso</p>
            <p className="mt-2 mb-0 font-mono text-lg font-bold text-slate-900">{studentCode}</p>
          </section>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Ejercicios" value={summary.totalAttempts.toString()} />
            <StatCard label="Tiempo total" value={formatDuration(summary.totalDurationSeconds)} />
            <StatCard label="Días activos" value={summary.activeDays.toString()} />
            <StatCard label="Precisión" value={`${summary.accuracy}%`} />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-white p-5">
              <h2 className="mb-4 mt-0 text-base font-bold text-slate-800">Actividad semanal</h2>
              <div className="flex h-40 items-end justify-between gap-2">
                {summary.weeklyData.map((day) => (
                  <div className="flex flex-1 flex-col items-center" key={day.date}>
                    <div
                      className="relative w-full overflow-hidden rounded-t-lg bg-slate-100"
                      style={{ height: `${Math.max(day.exercises * 8, 4)}px` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-teal-500"
                        style={{ height: `${day.accuracy}%` }}
                      />
                    </div>
                    <span className="mt-2 text-sm font-medium text-slate-600">{day.day}</span>
                    <span className="text-xs text-slate-400">{day.exercises}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-white p-5">
              <h2 className="mb-4 mt-0 text-base font-bold text-slate-800">Lengua por habilidad</h2>
              <div className="space-y-3">
                {summary.skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-1 flex justify-between gap-3">
                      <span className="truncate text-sm font-medium text-slate-700">{skill.title}</span>
                      <span className="text-sm font-bold text-slate-800">Nv. {skill.masteryLevel}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-500"
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

          <section className="rounded-lg bg-slate-900 p-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-lg font-bold">Reporte para la familia</h2>
                <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Compartí este reporte sin exponer datos personales. El enlace muestra solo el progreso asociado al código.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-slate-900"
                  href={reportUrl}
                >
                  Ver reporte online
                </a>
                <a
                  className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/20"
                  href={mailtoHref}
                >
                  Enviar por email
                </a>
              </div>
            </div>
          </section>

          {continueHref ? (
            <section className="rounded-lg border border-teal-100 bg-teal-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="m-0 text-lg font-bold text-slate-900">Seguir sin repetir</h2>
                  <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Podés volver al siguiente foco recomendado y continuar desde lo que acabás de completar.
                  </p>
                </div>
                <a
                  className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-bold text-white hover:bg-teal-800"
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <p className="m-0 text-sm text-slate-500">{label}</p>
      <p className="m-0 mt-2 text-2xl font-bold text-slate-800">{value}</p>
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
