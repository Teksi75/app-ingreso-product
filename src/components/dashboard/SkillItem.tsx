import { type SkillState } from "../../storage/local_progress_store";
import { getSkillMetadata } from "../../skills/skill_metadata";
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
  const metadata = getSkillMetadata(skill.skill);

  return (
    <article className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#deded8] bg-white px-4 py-3.5">
      <div className="grid gap-2">
        <div className="grid gap-1">
          <strong className="text-base leading-tight">{metadata.title}</strong>
          <span className="text-xs font-semibold text-[#666961]">{metadata.id}</span>
          <p className="m-0 max-w-[460px] text-sm leading-5 text-[#55554d]">
            {metadata.description}
          </p>
        </div>
        <SkillStatus state={skill.last_state} />
      </div>
      <dl className="m-0 flex flex-wrap gap-[18px]">
        <div className="min-w-[72px]">
          <dt className="m-0 text-xs text-[#666961]">Precision</dt>
          <dd className="mt-0.5 mb-0 text-lg font-bold">{skill.accuracy}%</dd>
        </div>
        <div className="min-w-[72px]">
          <dt className="m-0 text-xs text-[#666961]">Intentos</dt>
          <dd className="mt-0.5 mb-0 text-lg font-bold">{skill.attempts}</dd>
        </div>
      </dl>
    </article>
  );
}
