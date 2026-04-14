import { type SkillState } from "../../storage/local_progress_store";

type DashboardSkill = {
  skill: string;
  accuracy: number;
  attempts: number;
  last_state: SkillState;
};

type ActionPanelProps = {
  skill: DashboardSkill | null;
};

export function ActionPanel({ skill }: ActionPanelProps) {
  return (
    <section style={styles.panel}>
      <div>
        <p style={styles.kicker}>Practicar ahora</p>
        <h2 style={styles.title}>{skill ? skill.skill : "Empezar practica"}</h2>
      </div>
      <form action="/practice" style={styles.form}>
        <button type="submit" style={styles.button}>
          Practicar ahora
        </button>
      </form>
    </section>
  );
}

const styles = {
  panel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    borderRadius: "8px",
    background: "#1d1d1b",
    color: "#ffffff",
    padding: "18px 20px",
  },
  kicker: {
    margin: "0 0 6px",
    color: "#d8ddd0",
    fontSize: "13px",
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: "22px",
    lineHeight: 1.2,
  },
  form: {
    margin: 0,
  },
  button: {
    border: 0,
    borderRadius: "8px",
    background: "#ffffff",
    color: "#1d1d1b",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "42px",
    padding: "0 16px",
    font: "inherit",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
} as const;
