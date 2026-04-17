import { SkillItem } from "./SkillItem";
import { type DashboardSkillState } from "./SkillStatus";

type DashboardSkill = {
  skill: string;
  accuracy: number | null;
  attempts: number;
  practiceSessions: number;
  last_state: DashboardSkillState;
};

type SkillListProps = {
  skills: DashboardSkill[];
};

export function SkillList({ skills }: SkillListProps) {
  if (skills.length === 0) {
    return <p className="m-0 text-[#5f625b]">Todavia no hay practica registrada.</p>;
  }

  return (
    <div className="grid gap-2.5">
      {skills.map((skill) => (
        <SkillItem key={skill.skill} skill={skill} />
      ))}
    </div>
  );
}
