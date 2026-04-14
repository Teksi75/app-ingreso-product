import { type SkillState } from "../../storage/local_progress_store";
import { SkillItem } from "./SkillItem";

type DashboardSkill = {
  skill: string;
  accuracy: number;
  attempts: number;
  last_state: SkillState;
};

type SkillListProps = {
  skills: DashboardSkill[];
};

export function SkillList({ skills }: SkillListProps) {
  if (skills.length === 0) {
    return <p style={styles.empty}>Todavia no hay practica registrada.</p>;
  }

  return (
    <div style={styles.list}>
      {skills.map((skill) => (
        <SkillItem key={skill.skill} skill={skill} />
      ))}
    </div>
  );
}

const styles = {
  list: {
    display: "grid",
    gap: "10px",
  },
  empty: {
    margin: 0,
    color: "#5f625b",
  },
} as const;
