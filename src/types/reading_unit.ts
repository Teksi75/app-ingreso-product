export type ReadingUnit = {
  id: string;
  title: string;
  subtitle?: string;
  text: string;
  difficulty: number;
  textType: "narrative" | "informative" | "biografia";
  source: "generated" | "original_interno";
  sourceLabel?: string;
  license?: string;
  moduleFit?: string[];
  wordCountApprox?: number;
  glossary?: Array<{
    word: string;
    definition: string;
  }>;
  image?: {
    src: string;
    alt: string;
    caption?: string;
    attribution?: string;
    sourceUrl?: string;
  };
};
