import { getSkillMetadata } from "../../skills/skill_metadata";
import { SkillStatus, type DashboardSkillState } from "./SkillStatus";

type DashboardSkill = {
  skill: string;
  accuracy: number | null;
  attempts: number;
  sessions: number;
  last_state: DashboardSkillState;
};

type SkillItemProps = {
  skill: DashboardSkill;
};

export function SkillItem({ skill }: SkillItemProps) {
  const metadata = getSkillMetadata(skill.skill);

  return (
    <article
      aria-label={metadata.title}
      className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#deded8] bg-white px-4 py-3.5"
      data-testid="skill-progress-card"
    >
      <div className="grid gap-2">
        <div className="grid gap-1">
          <strong className="text-base leading-tight">{metadata.title}</strong>
          <p className="m-0 max-w-[460px] text-sm leading-5 text-[#55554d]">
            {metadata.description}
          </p>
        </div>
        <SkillStatus state={skill.last_state} />
      </div>
      <dl className="m-0 flex flex-wrap gap-[18px]">
        <div className="min-w-[72px]">
          <dt className="m-0 text-xs text-[#666961]">Precisión</dt>
          <dd className="mt-0.5 mb-0 text-lg font-bold">
            {skill.accuracy === null ? "-" : `${skill.accuracy}%`}
          </dd>
        </div>
        <div className="min-w-[72px]">
          <dt className="m-0 text-xs text-[#666961]">Sesiones</dt>
          <dd className="mt-0.5 mb-0 text-lg font-bold">{skill.sessions}</dd>
        </div>
        <div className="min-w-[84px]">
          <dt className="m-0 text-xs text-[#666961]">Respuestas</dt>
          <dd className="mt-0.5 mb-0 text-lg font-bold">{skill.attempts}</dd>
        </div>
      </dl>
    </article>
  );
}
