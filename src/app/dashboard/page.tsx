import { ActionPanel } from "../../components/dashboard/ActionPanel";
import { Header } from "../../components/dashboard/Header";
import { SkillList } from "../../components/dashboard/SkillList";
import {
  getPracticeProgressSnapshot,
  getWeakestPracticeSkillId,
  loadProgress,
  type PracticeProgressSnapshot,
  type SkillState,
} from "../../storage/local_progress_store";

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
  const progress = isNewStudent ? null : loadProgress();
  const snapshot = progress ? getPracticeProgressSnapshot(progress) : null;
  const skills = snapshot ? getDashboardSkills(snapshot) : [];
  const weakestSkillId = progress ? getWeakestPracticeSkillId(canonicalDashboardSkills, progress) : null;
  const weakestSkill = weakestSkillId ? skills.find((skill) => skill.skill === weakestSkillId) ?? null : null;

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

function getDashboardSkills(snapshot: PracticeProgressSnapshot): DashboardSkill[] {
  const skillStats = snapshot.practiceSkillStats;

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

function isEnabledParam(value: string | undefined): boolean {
  return value === "1" || value === "true";
}
