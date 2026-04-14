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
    <article className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#deded8] bg-white px-4 py-3.5">
      <div className="grid gap-2">
        <strong className="text-base leading-tight">{skill.skill}</strong>
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
