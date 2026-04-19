import Link from "next/link";
import { getSkillMetadata } from "../../skills/skill_metadata";
import { type DashboardSkillState } from "./SkillStatus";

type DashboardSkill = {
  skill: string;
  accuracy: number | null;
  attempts: number;
  practiceSessions: number;
  last_state: DashboardSkillState;
};

type ActionPanelProps = {
  isNewStudent?: boolean;
  skill: DashboardSkill | null;
};

export function ActionPanel({ isNewStudent = false, skill }: ActionPanelProps) {
  const metadata = skill ? getSkillMetadata(skill.skill) : null;
  const href = isNewStudent ? "/practice?newStudent=1" : "/";
  const label = isNewStudent ? "Inicia tu entrenamiento" : "Ir al inicio";
  const skillHref = buildPracticeHref(skill?.skill, isNewStudent);
  const readingStimulusHref = buildPracticeHref("lengua.skill_1", isNewStudent);

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#1d1d1b] px-5 py-[18px] text-white">
      <div>
        <p className="mt-0 mb-1.5 text-[13px] font-bold text-[#d8ddd0]">Foco sugerido</p>
        <h2 className="m-0 text-[22px] leading-[1.2] font-bold">
          {metadata ? metadata.title : "Sin practica registrada"}
        </h2>
        {metadata ? (
          <>
            <p className="mt-1 mb-0 text-[13px] font-semibold text-[#d8ddd0]">{metadata.id}</p>
            <p className="mt-1.5 mb-0 max-w-[520px] text-[14px] leading-5 text-[#d8ddd0]">
              {metadata.description}
            </p>
          </>
        ) : null}
      </div>
      <Link
        href={href}
        className="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-lg border-0 bg-white px-4 py-0 font-[inherit] font-bold whitespace-nowrap text-[#1d1d1b]"
      >
        {label}
      </Link>
      <div className="flex w-full flex-wrap gap-2">
        <Link
          href={skillHref}
          className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-lg border border-white px-3 py-0 text-sm font-bold text-white"
        >
          Entrenar foco sugerido
        </Link>
        <Link
          href={readingStimulusHref}
          className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-lg border border-white px-3 py-0 text-sm font-bold text-white"
        >
          Lectura como estimulo
        </Link>
      </div>
    </section>
  );
}

function buildPracticeHref(skillId: string | undefined, isNewStudent: boolean): string {
  const params = new URLSearchParams();

  if (skillId) {
    params.set("skill", skillId);
  }

  if (isNewStudent) {
    params.set("newStudent", "1");
  }

  const query = params.toString();

  return query ? `/practice?${query}` : "/practice";
}
