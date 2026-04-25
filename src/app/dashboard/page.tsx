import { ActionPanel } from "../../components/dashboard/ActionPanel";
import { Header } from "../../components/dashboard/Header";
import { SkillList } from "../../components/dashboard/SkillList";
import Link from "next/link";
import {
  CANONICAL_LENGUA_SKILLS,
  buildMasteryModel,
  type MasteryModel,
} from "../../progress/mastery_model";
import { getNextStepRecommendation } from "../../recommendation/next_step";
import { loadProgressAsync, type SkillState, type StoredProgress } from "../../storage/local_progress_store";

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
    newStudent?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const newStudent = Array.isArray(params.newStudent) ? params.newStudent[0] : params.newStudent;
  const isNewStudent = isEnabledParam(newStudent);
  const progress = isNewStudent ? createEmptyProgress() : await loadProgressAsync();
  const model = buildMasteryModel(progress);
  const skills = getDashboardSkills(model);
  const hasSessionHistory = progress.sessions.length > 0;
  const recommendation = getNextStepRecommendation(progress);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-[840px] gap-5">
        <Header title={isNewStudent ? "Nuevo Alumno" : "Tu progreso"} />
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
                href={withNewStudentParam(recommendation.href, isNewStudent)}
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#1d1d1b] px-4 font-bold text-white"
              >
                {recommendation.ctaLabel}
              </Link>
            </div>
          </section>
        )}
        <SkillList skills={skills} />
        <ActionPanel isNewStudent={isNewStudent} recommendation={recommendation} />
      </section>
    </main>
  );
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
