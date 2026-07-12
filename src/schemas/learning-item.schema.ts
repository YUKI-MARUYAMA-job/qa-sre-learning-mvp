import * as z from "zod";

export const LearningItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.enum(["basic", "intermediate", "advanced"]),
  sourceType: z.enum([
    "official-doc",
    "book",
    "paper",
    "original-note",
    "other"
  ]),
  sourceUrl: z.string().url().optional(),
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1)
});

export const LearningItemsSchema = z.array(LearningItemSchema);

export type LearningItemInput = z.infer<typeof LearningItemSchema>;
