import { expect, test } from "bun:test";
import { QuizQuestionsSchema } from "../src/schemas/quiz-question.schema.ts";

test("quiz questions are schema-valid", async () => {
  const json = await Bun.file("data/raw/quiz-questions.json").json();
  const result = QuizQuestionsSchema.safeParse(json);

  expect(result.success).toBe(true);
});
