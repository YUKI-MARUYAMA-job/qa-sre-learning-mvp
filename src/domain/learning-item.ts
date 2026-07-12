export type Difficulty = "basic" | "intermediate" | "advanced";

export type SourceType =
  | "official-doc"
  | "book"
  | "paper"
  | "original-note"
  | "other";

export type LearningItem = {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  sourceType: SourceType;
  sourceUrl?: string;
  summary: string;
  tags: string[];
};
