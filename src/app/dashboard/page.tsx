import { ActionPanel } from "../../components/dashboard/ActionPanel";
import { Header } from "../../components/dashboard/Header";
import { SkillList } from "../../components/dashboard/SkillList";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CANONICAL_LENGUA_SKILLS,
  buildMasteryModel,
  type MasteryModel,
} from "../../progress/mastery_model";
import { getNextStepRecommendation } from "../../recommendation/next_step";
import { getSkillMetadata } from "../../skills/skill_metadata";
import { loadProgressAsync, resetProgress, type SkillState, type StoredProgress } from "../../storage/local_progress_store";
import { resolveStudentCode } from "../student_identity";
import { withProgressCode } from "../progress_code_href";

export type DashboardSkillState = SkillState | "not_started";

type DashboardSkill = {
  skill: string;
  accuracy: number | null;
  attempts: number;
  practiceSessions: number;
  last_state: DashboardSkillState;
};

type DashboardPageProps = {
  searchParams: Promise<{
    code?: string | string[];
    newStudent?: string | string[];
    student?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const explicitCode = getParam(params.code) ?? getParam(params.student);
  const studentCode = await resolveStudentCode(explicitCode);
  const progressCode = explicitCode ? studentCode : undefined;
  const newStudent = getParam(params.newStudent);
  const isNewStudent = isEnabledParam(newStudent);
  const progress = isNewStudent ? createEmptyProgress() : await loadProgressAsync(studentCode);
  const model = buildMasteryModel(progress);
  const skills = getDashboardSkills(model);
  const improvementPoints = getImprovementPoints(model);
  const hasSessionHistory = progress.sessions.length > 0;
  const recommendation = getNextStepRecommendation(progress);

  async function resetCurrentStudentProgress() {
    "use server";

    await resetProgress(studentCode);
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-[840px] gap-5">
        <Header title={isNewStudent ? "Nuevo Alumno" : "Tu progreso"} />
        <section className="rounded-lg border border-[#deded8] bg-white px-5 py-4">
          <p className="mt-0 mb-1.5 text-[13px] font-bold text-[#5f625b]">
            Código de progreso
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="m-0 font-mono text-[18px] font-bold tracking-wide text-[#1d1d1b]">
              {studentCode}
            </p>
            <Link
              href={`/reporte?code=${encodeURIComponent(studentCode)}`}
              className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-[#deded8] px-3 text-sm font-bold text-[#1d1d1b]"
            >
              Ver reporte familiar
            </Link>
          </div>
        </section>
        {!hasSessionHistory && (
          <section className="rounded-lg border border-[#deded8] bg-white px-5 py-4">
            <p className="mt-0 mb-1.5 text-[13px] font-bold text-[#5f625b]">
              Todavía no hay sesiones registradas
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="m-0 max-w-[520px] text-[15px] leading-6 text-[#383832]">
                Empezá con una actividad guiada para que el tablero pueda mostrar progreso real.
              </p>
              <Link
                href={withProgressCode(withNewStudentParam(recommendation.href, isNewStudent), progressCode)}
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#1d1d1b] px-4 font-bold text-white"
              >
                {recommendation.ctaLabel}
              </Link>
            </div>
          </section>
        )}
        <SkillList skills={skills} />
        {hasSessionHistory ? <ImprovementPanel points={improvementPoints} /> : null}
        {hasSessionHistory && (
          <form action={resetCurrentStudentProgress}>
            <button
              className="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-lg border border-[#deded8] bg-white px-4 font-bold text-[#8a2d2d]"
              type="submit"
            >
              Empezar de cero
            </button>
          </form>
        )}
        <ActionPanel isNewStudent={isNewStudent} progressCode={progressCode} recommendation={recommendation} />
      </section>
    </main>
  );
}

type ImprovementPoint = {
  id: string;
  title: string;
  state: SkillState;
  attempts: number;
  accuracy: number;
  reason: string;
  kind: "skill" | "subskill";
};

function ImprovementPanel({ points }: { points: ImprovementPoint[] }) {
  const hasWeaknesses = points.some((point) => point.state === "weak");

  return (
    <section className="grid gap-3 rounded-lg border border-[#deded8] bg-white px-5 py-4">
      <div>
        <p className="mt-0 mb-1.5 text-[13px] font-bold text-[#5f625b]">
          Puntos a mejorar
        </p>
        <h2 className="m-0 text-[20px] leading-tight font-bold text-[#1d1d1b]">
          {hasWeaknesses ? "Debilidades detectadas" : "Sin debilidades críticas"}
        </h2>
      </div>
      {points.length > 0 ? (
        <div className="grid gap-2.5">
          {points.map((point) => (
            <article
              className="grid gap-1 rounded-lg border border-[#eceee8] bg-[#fafaf7] px-3 py-2.5"
              key={point.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm leading-tight text-[#1d1d1b]">{point.title}</strong>
                <span className={`rounded-lg px-2 py-1 text-xs font-bold ${
                  point.state === "weak"
                    ? "bg-[#fde8e8] text-[#9f1d1d]"
                    : point.state === "developing"
                      ? "bg-[#fff2bf] text-[#7a5400]"
                      : "bg-[#dcfce7] text-[#176534]"
                }`}>
                  {point.state === "weak" ? "Debil" : point.state === "developing" ? "En desarrollo" : "Dominada"}
                </span>
              </div>
              <p className="m-0 text-sm leading-5 text-[#55554d]">
                {point.kind === "subskill" ? "Subskill" : "Skill"} · {point.attempts} respuestas · {point.accuracy}% precisión
              </p>
              <p className="m-0 text-[13px] leading-5 text-[#666961]">{point.reason}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="m-0 max-w-[560px] text-sm leading-6 text-[#55554d]">
          No aparecen puntos débiles con el historial actual. Mantener práctica distribuida antes del examen.
        </p>
      )}
    </section>
  );
}

function getImprovementPoints(model: MasteryModel): ImprovementPoint[] {
  const skillPoints = Object.values(model.skills)
    .filter((summary) => summary.state !== "mastered")
    .map((summary): ImprovementPoint => ({
      id: summary.focusId,
      title: getSkillMetadata(summary.focusId).title,
      state: summary.state,
      attempts: summary.totalAttempts,
      accuracy: Math.round(summary.recentAccuracy * 100),
      reason: summary.trace[0] ?? "Conviene reforzar esta habilidad antes de avanzar.",
      kind: "skill",
    }));
  const subskillPoints = Object.values(model.subskills)
    .filter((summary) => summary.state === "weak")
    .map((summary): ImprovementPoint => ({
      id: summary.focusId,
      title: getSkillMetadata(summary.focusId).title,
      state: summary.state,
      attempts: summary.totalAttempts,
      accuracy: Math.round(summary.recentAccuracy * 100),
      reason: summary.trace[0] ?? "Conviene reforzar esta subskill antes de avanzar.",
      kind: "subskill",
    }));

  return [...skillPoints, ...subskillPoints]
    .sort((left, right) => (
      getImprovementPriority(left.state) - getImprovementPriority(right.state) ||
      left.accuracy - right.accuracy ||
      left.title.localeCompare(right.title)
    ))
    .slice(0, 5);
}

function getImprovementPriority(state: SkillState): number {
  if (state === "weak") {
    return 0;
  }

  if (state === "developing") {
    return 1;
  }

  return 2;
}

function getDashboardSkills(model: MasteryModel): DashboardSkill[] {
  return [...CANONICAL_LENGUA_SKILLS].map((skill) => {
    const stats = model.skills[skill];
    const attempts = stats?.totalAttempts ?? 0;

    return {
      skill,
      accuracy: attempts > 0 && stats ? Math.round((stats.totalCorrect / attempts) * 100) : null,
      attempts,
      practiceSessions: stats?.practiceSessions ?? 0,
      last_state: attempts > 0 && stats ? stats.state : "not_started",
    };
  });
}

function isEnabledParam(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function createEmptyProgress(): StoredProgress {
  return {
    sessions: [],
    seenSkills: [],
    skill_stats: {},
  };
}

function withNewStudentParam(href: string, isNewStudent: boolean): string {
  if (!isNewStudent) {
    return href;
  }

  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("newStudent", "1");
  const serialized = params.toString();

  return serialized ? `${path}?${serialized}` : path;
}
