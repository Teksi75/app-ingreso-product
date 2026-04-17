export type ReadingUnit = {
  id: string;
  title: string;
  text: string;
  difficulty: number;
  textType: "narrative" | "informative";
  source: "generated";
};
