import { type SkillState } from "../../storage/local_progress_store";

export type DashboardSkillState = SkillState | "not_started";

type SkillStatusProps = {
  state: DashboardSkillState;
};

const statusConfig: Record<DashboardSkillState, { label: string; className: string }> = {
  not_started: {
    label: "Todavia no resuelto",
    className: "bg-[#eceee8] text-[#55554d]",
  },
  weak: {
    label: "Debil",
    className: "bg-[#fde8e8] text-[#9f1d1d]",
  },
  developing: {
    label: "En desarrollo",
    className: "bg-[#fff2bf] text-[#7a5400]",
  },
  mastered: {
    label: "Dominada",
    className: "bg-[#dcfce7] text-[#176534]",
  },
};

export function SkillStatus({ state }: SkillStatusProps) {
  const status = statusConfig[state];

  return (
    <span className={`w-fit rounded-lg px-2 py-1.5 text-xs leading-none font-bold ${status.className}`}>
      {status.label}
    </span>
  );
}
