import * as z from "zod";
import { CategoryKeySchema } from "./subject-taxonomy.schema.ts";

export const QuizTrackSchema = z.enum([
  "portfolio",
  "quality",
  "frontend",
  "deployment",
  "documentation",
  "operations"
]);

export const QuizDifficultySchema = z.enum([
  "basic",
  "intermediate",
  "advanced"
]);

export const QuizOptionsSchema = z.object({
  "1": z.string().min(1),
  "2": z.string().min(1),
  "3": z.string().min(1),
  "4": z.string().min(1)
});

export const QuizSourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  publisher: z.string().min(1),
  retrieved_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const QuizLegalSchema = z.object({
  is_official_question_reproduction: z.boolean(),
  is_copied_verbatim: z.boolean(),
  is_official_certification_claim: z.boolean(),
  is_affiliation_or_endorsement_claim: z.boolean(),
  is_modified_or_original: z.boolean(),
  attribution: z.string().min(1)
});

export const QuizReviewSchema = z.object({
  status: z.enum(["generated", "reviewed"]),
  reviewed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()
});

export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  track: QuizTrackSchema,
  category: CategoryKeySchema,
  sub_category: z.string().min(1),
  sub_sub_category: z.string().min(1),
  sub_sub_sub_category: z.string().min(1).optional().nullable(),
  difficulty: QuizDifficultySchema,
  question: z.string().min(20),
  options: QuizOptionsSchema,
  answer: z.enum(["1", "2", "3", "4"]),
  explanation: z.string().min(50),
  source: QuizSourceSchema,
  legal: QuizLegalSchema,
  review: QuizReviewSchema,
  tags: z.array(z.string().min(1)).min(1)
});

export const QuizQuestionsSchema = z.array(QuizQuestionSchema);

export type QuizTrack = z.infer<typeof QuizTrackSchema>;
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>;
export type QuizSource = z.infer<typeof QuizSourceSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
