import * as z from "zod";
import {
  QuizDifficultySchema,
  QuizOptionsSchema,
  QuizTrackSchema
} from "./quiz-question.schema.ts";
import { CategoryKeySchema } from "./subject-taxonomy.schema.ts";

export const PublicQuizQuestionSchema = z.object({
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
  source: z.object({
    title: z.string().min(1),
    url: z.string().min(1),
    publisher: z.string().min(1),
    retrieved_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }),
  tags: z.array(z.string().min(1)).min(1)
});

export const PublicQuizDataSchema = z.object({
  version: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  generated_from: z.literal("data/raw/quiz-questions.json"),
  questions: z.array(PublicQuizQuestionSchema)
});

export type PublicQuizQuestion = z.infer<typeof PublicQuizQuestionSchema>;
export type PublicQuizData = z.infer<typeof PublicQuizDataSchema>;
