import { ActionPanel } from "../../components/dashboard/ActionPanel";
import { Header } from "../../components/dashboard/Header";
import { SkillList } from "../../components/dashboard/SkillList";
import { loadProgress, type SkillState } from "../../storage/local_progress_store";

export type DashboardSkillState = SkillState | "not_started";

type DashboardSkill = {
  skill: string;
  accuracy: number | null;
  attempts: number;
  practiceSessions: number;
  last_state: DashboardSkillState;
};

type ProgressForDashboard = ReturnType<typeof loadProgress> & {
  skills?: DashboardSkill[];
};

type DashboardPageProps = {
  searchParams: Promise<{
    newStudent?: string | string[];
  }>;
};

const statePriority: Record<DashboardSkillState, number> = {
  not_started: 0,
  weak: 1,
  developing: 2,
  mastered: 3,
};

const canonicalDashboardSkills = [
  "lengua.skill_1",
  "lengua.skill_2",
  "lengua.skill_3",
  "lengua.skill_4",
  "lengua.skill_5",
  "lengua.skill_6",
  "lengua.skill_7",
];

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const newStudent = Array.isArray(params.newStudent) ? params.newStudent[0] : params.newStudent;
  const isNewStudent = isEnabledParam(newStudent);
  const progress = isNewStudent ? null : loadProgress() as ProgressForDashboard;
  const skills = progress ? getDashboardSkills(progress) : [];
  const weakestSkill = getWeakestSkill(skills);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="mx-auto grid max-w-[840px] gap-5">
        <Header title={isNewStudent ? "Nuevo Alumno" : "Tu progreso"} />
        <SkillList skills={skills} />
        <ActionPanel isNewStudent={isNewStudent} skill={weakestSkill} />
      </section>
    </main>
  );
}

function getDashboardSkills(progress: ProgressForDashboard): DashboardSkill[] {
  const skillStats = getPracticeSkillStats(progress);

  return canonicalDashboardSkills.map((skill) => {
    const stats = skillStats[skill];
    const attempts = stats?.total_attempts ?? 0;

    return {
      skill,
      accuracy: attempts > 0 && stats ? Math.round((stats.total_correct / attempts) * 100) : null,
      attempts,
      practiceSessions: stats?.practice_sessions ?? 0,
      last_state: attempts > 0 && stats ? stats.last_state : "not_started",
    };
  });
}

function getWeakestSkill(skills: DashboardSkill[]): DashboardSkill | null {
  return [...skills].sort((left, right) => {
    const stateDifference = statePriority[left.last_state] - statePriority[right.last_state];

    if (stateDifference !== 0) {
      return stateDifference;
    }

    return (left.accuracy ?? 0) - (right.accuracy ?? 0);
  })[0] ?? null;
}

function getPracticeSkillStats(progress: ProgressForDashboard): Record<
  string,
  {
    total_attempts: number;
    total_correct: number;
    practice_sessions: number;
    last_state: SkillState;
  }
> {
  const statsBySkill: Record<
    string,
    {
      total_attempts: number;
      total_correct: number;
      practice_sessions: number;
      last_state: SkillState;
    }
  > = {};

  for (const session of progress.sessions ?? []) {
    if (session.mode !== "practice") {
      continue;
    }

    for (const skillResult of session.skill_results) {
      if (!canonicalDashboardSkills.includes(skillResult.skill_id)) {
        continue;
      }

      statsBySkill[skillResult.skill_id] ??= {
        total_attempts: 0,
        total_correct: 0,
        practice_sessions: 0,
        last_state: skillResult.state,
      };

      const stats = statsBySkill[skillResult.skill_id];
      stats.total_attempts += skillResult.attempts;
      stats.total_correct += skillResult.correct;
      stats.practice_sessions += 1;
      stats.last_state = skillResult.state;
    }
  }

  return statsBySkill;
}

function isEnabledParam(value: string | undefined): boolean {
  return value === "1" || value === "true";
}
