import { ActionPanel } from "../../components/dashboard/ActionPanel";
import { Header } from "../../components/dashboard/Header";
import { SkillList } from "../../components/dashboard/SkillList";
import { loadProgress, type SkillState } from "../../storage/local_progress_store";

type DashboardSkill = {
  skill: string;
  accuracy: number;
  attempts: number;
  last_state: SkillState;
};

type ProgressForDashboard = ReturnType<typeof loadProgress> & {
  skills?: DashboardSkill[];
};

const statePriority: Record<SkillState, number> = {
  weak: 0,
  developing: 1,
  mastered: 2,
};

export default function DashboardPage() {
  const progress = loadProgress() as ProgressForDashboard;
  const skills = getDashboardSkills(progress);
  const weakestSkill = getWeakestSkill(skills);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-[840px] gap-5">
        <Header title="Tu progreso" />
        <SkillList skills={skills} />
        <ActionPanel skill={weakestSkill} />
      </section>
    </main>
  );
}

function getDashboardSkills(progress: ProgressForDashboard): DashboardSkill[] {
  if (Array.isArray(progress.skills)) {
    return progress.skills.map((skill) => ({
      ...skill,
      accuracy: normalizeAccuracy(skill.accuracy),
    }));
  }

  return Object.entries(progress.skill_stats ?? {}).map(([skill, stats]) => ({
    skill,
    accuracy: stats.total_attempts > 0 ? Math.round((stats.total_correct / stats.total_attempts) * 100) : 0,
    attempts: stats.total_attempts,
    last_state: stats.last_state,
  }));
}

function getWeakestSkill(skills: DashboardSkill[]): DashboardSkill | null {
  return [...skills].sort((left, right) => {
    const stateDifference = statePriority[left.last_state] - statePriority[right.last_state];

    if (stateDifference !== 0) {
      return stateDifference;
    }

    return left.accuracy - right.accuracy;
  })[0] ?? null;
}

function normalizeAccuracy(accuracy: number): number {
  if (accuracy <= 1) {
    return Math.round(accuracy * 100);
  }

  return Math.round(accuracy);
}
