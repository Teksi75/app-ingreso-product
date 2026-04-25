import { buildProgressSummary, formatDuration } from "@/app/progress_summary";
import { resolveStudentCode } from "@/app/student_identity";
import { loadProgressAsync } from "@/storage/local_progress_store";

export const dynamic = "force-dynamic";

type ReportePageProps = {
  searchParams: Promise<{
    code?: string | string[];
    student?: string | string[];
  }>;
};

export default async function ReportePage({ searchParams }: ReportePageProps) {
  const params = await searchParams;
  const studentCode = await resolveStudentCode(getParam(params.code) ?? getParam(params.student));
  const progress = await loadProgressAsync(studentCode);
  const summary = buildProgressSummary(progress);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-4xl gap-6">
        <header className="grid gap-2">
          <p className="m-0 text-sm font-bold uppercase tracking-wide text-[#5f625b]">Reporte familiar</p>
          <h1 className="m-0 text-3xl font-bold">Progreso del estudiante</h1>
          <p className="m-0 max-w-2xl text-base leading-7 text-[#5f625b]">
            Informe de solo lectura asociado al código de progreso. No incluye nombre, email ni datos personales.
          </p>
        </header>

        <section className="rounded-lg border border-[#deded8] bg-white p-5">
          <p className="m-0 text-xs font-bold uppercase tracking-wide text-[#5f625b]">Código de progreso</p>
          <p className="m-0 mt-2 font-mono text-xl font-bold">{studentCode}</p>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ReportStat label="Sesiones" value={summary.totalSessions.toString()} />
          <ReportStat label="Días activos" value={summary.activeDays.toString()} />
          <ReportStat label="Ejercicios" value={summary.totalAttempts.toString()} />
          <ReportStat label="Precisión" value={`${summary.accuracy}%`} />
        </section>

        <section className="grid gap-4 rounded-lg border border-[#deded8] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-xl font-bold">Lengua</h2>
            <p className="m-0 text-sm font-bold text-[#5f625b]">
              Tiempo registrado: {formatDuration(summary.totalDurationSeconds)}
            </p>
          </div>
          <div className="grid gap-3">
            {summary.skills.map((skill) => (
              <div className="grid gap-1" key={skill.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-bold">{skill.title}</span>
                  <span className="text-sm text-[#5f625b]">
                    Nivel {skill.masteryLevel} · {skill.attempts} ejercicios
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#ededeb]">
                  <div
                    className="h-full rounded-full bg-[#6d5bd0]"
                    style={{ width: `${Math.max(skill.masteryScore, skill.attempts > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#deded8] bg-white p-5">
          <h2 className="m-0 text-xl font-bold">Recomendación</h2>
          <p className="mb-0 mt-2 text-base leading-7 text-[#383832]">
            Mantener sesiones cortas y frecuentes de Lengua. Si la precisión baja de 70%, conviene repetir
            actividades guiadas antes de avanzar a simulacros completos.
          </p>
        </section>
      </section>
    </main>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#deded8] bg-white p-4">
      <p className="m-0 text-sm text-[#5f625b]">{label}</p>
      <p className="m-0 mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
