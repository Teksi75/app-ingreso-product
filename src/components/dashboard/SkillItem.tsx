import { type SkillState } from "../../storage/local_progress_store";
import { SkillStatus } from "./SkillStatus";

type DashboardSkill = {
  skill: string;
  accuracy: number;
  attempts: number;
  last_state: SkillState;
};

type SkillItemProps = {
  skill: DashboardSkill;
};

export function SkillItem({ skill }: SkillItemProps) {
  return (
    <article style={styles.item}>
      <div style={styles.main}>
        <strong style={styles.name}>{skill.skill}</strong>
        <SkillStatus state={skill.last_state} />
      </div>
      <dl style={styles.metrics}>
        <div style={styles.metric}>
          <dt style={styles.label}>Precision</dt>
          <dd style={styles.value}>{skill.accuracy}%</dd>
        </div>
        <div style={styles.metric}>
          <dt style={styles.label}>Intentos</dt>
          <dd style={styles.value}>{skill.attempts}</dd>
        </div>
      </dl>
    </article>
  );
}

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    border: "1px solid #deded8",
    borderRadius: "8px",
    background: "#ffffff",
    padding: "14px 16px",
  },
  main: {
    display: "grid",
    gap: "8px",
  },
  name: {
    fontSize: "16px",
    lineHeight: 1.25,
  },
  metrics: {
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
    margin: 0,
  },
  metric: {
    minWidth: "72px",
  },
  label: {
    color: "#666961",
    fontSize: "12px",
    margin: 0,
  },
  value: {
    fontSize: "18px",
    fontWeight: 700,
    margin: "2px 0 0",
  },
} as const;
