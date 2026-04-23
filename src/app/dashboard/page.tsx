import { ActionPanel } from "../../components/dashboard/ActionPanel";
import { Header } from "../../components/dashboard/Header";
import { SkillList } from "../../components/dashboard/SkillList";
import {
  CANONICAL_LENGUA_SKILLS,
  buildMasteryModel,
  type MasteryModel,
} from "../../progress/mastery_model";
import { getNextStepRecommendation } from "../../recommendation/next_step";
import { loadProgress, type SkillState } from "../../storage/local_progress_store";

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
  const progress = isNewStudent ? null : loadProgress();
  const model = progress ? buildMasteryModel(progress) : null;
  const skills = model ? getDashboardSkills(model) : [];
  const recommendation = getNextStepRecommendation(progress ?? {
    sessions: [],
    seenSkills: [],
    skill_stats: {},
  });

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-[840px] gap-5">
        <Header title={isNewStudent ? "Nuevo Alumno" : "Tu progreso"} />
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
