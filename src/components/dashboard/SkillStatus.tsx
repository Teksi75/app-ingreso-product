import { type SkillState } from "../../storage/local_progress_store";

type SkillStatusProps = {
  state: SkillState;
};

const statusConfig: Record<SkillState, { label: string; color: string; background: string }> = {
  weak: {
    label: "Debil",
    color: "#9f1d1d",
    background: "#fde8e8",
  },
  developing: {
    label: "En desarrollo",
    color: "#7a5400",
    background: "#fff2bf",
  },
  mastered: {
    label: "Dominada",
    color: "#176534",
    background: "#dcfce7",
  },
};

export function SkillStatus({ state }: SkillStatusProps) {
  const status = statusConfig[state];

  return (
    <span
      style={{
        ...styles.badge,
        color: status.color,
        background: status.background,
      }}
    >
      {status.label}
    </span>
  );
}

const styles = {
  badge: {
    width: "fit-content",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1,
    padding: "6px 8px",
  },
} as const;
