import Link from "next/link";
import { type NextStepRecommendation } from "../../recommendation/next_step";

type ActionPanelProps = {
  isNewStudent?: boolean;
  recommendation: NextStepRecommendation;
};

export function ActionPanel({ isNewStudent = false, recommendation }: ActionPanelProps) {
  const href = withNewStudentParam(recommendation.href, isNewStudent);

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#1d1d1b] px-5 py-[18px] text-white">
      <div>
        <p className="mt-0 mb-1.5 text-[13px] font-bold text-[#d8ddd0]">Siguiente paso sugerido</p>
        <h2 className="m-0 text-[22px] leading-[1.2] font-bold">
          {recommendation.title}
        </h2>
        <p className="mt-1.5 mb-0 max-w-[520px] text-[14px] leading-5 text-[#d8ddd0]">
          {recommendation.description}
        </p>
        <p className="mt-2 mb-0 text-[13px] text-[#d8ddd0]">
          {recommendation.reason}
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-lg border-0 bg-white px-4 py-0 font-[inherit] font-bold whitespace-nowrap text-[#1d1d1b]"
      >
        {recommendation.ctaLabel}
      </Link>
    </section>
  );
}

function withNewStudentParam(href: string, isNewStudent: boolean): string {
  if (isNewStudent) {
    const [path, query = ""] = href.split("?");
    const params = new URLSearchParams(query);
    params.set("newStudent", "1");
    const serialized = params.toString();
    return serialized ? `${path}?${serialized}` : path;
  }

  return href;
}
