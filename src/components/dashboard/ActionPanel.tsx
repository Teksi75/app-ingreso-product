import Link from "next/link";
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
  const practiceHref = skill ? `/practice?skill=${encodeURIComponent(skill.skill)}` : "/practice";

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#1d1d1b] px-5 py-[18px] text-white">
      <div>
        <p className="mt-0 mb-1.5 text-[13px] font-bold text-[#d8ddd0]">Practicar ahora</p>
        <h2 className="m-0 text-[22px] leading-[1.2] font-bold">{skill ? skill.skill : "Empezar practica"}</h2>
      </div>
      <Link
        href={practiceHref}
        className="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-lg border-0 bg-white px-4 py-0 font-[inherit] font-bold whitespace-nowrap text-[#1d1d1b]"
      >
        Practicar ahora
      </Link>
    </section>
  );
}
