import { expect, test } from "bun:test";
import { QuizQuestionsSchema } from "../src/schemas/quiz-question.schema.ts";

test("invalid quiz schema fixture fails Zod validation", async () => {
  const json = await Bun.file("data/fixtures/invalid-quiz-schema.json").json();

  const result = QuizQuestionsSchema.safeParse(json);

  expect(result.success).toBe(false);
});
