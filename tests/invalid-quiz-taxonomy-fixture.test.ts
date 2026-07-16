import { expect, test } from "bun:test";
import { validateQuizTaxonomy } from "../src/application/validate-quiz-taxonomy.ts";
import { QuizQuestionsSchema } from "../src/schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../src/schemas/subject-taxonomy.schema.ts";

test("invalid quiz taxonomy fixture passes Zod validation but fails taxonomy validation", async () => {
  const quizJson = await Bun.file("data/fixtures/invalid-quiz-taxonomy.json").json();
  const taxonomyJson = await Bun.file("data/raw/subject-taxonomy.json").json();

  const quizResult = QuizQuestionsSchema.safeParse(quizJson);

  expect(quizResult.success).toBe(true);

  if (!quizResult.success) {
    throw new Error("Expected taxonomy fixture to pass Zod schema validation.");
  }

  const taxonomy = SubjectTaxonomySchema.parse(taxonomyJson);
  const issues = validateQuizTaxonomy(quizResult.data, taxonomy);

  expect(issues.length).toBeGreaterThan(0);
  expect(issues.some((issue) => issue.rule === "unknown-sub-category")).toBe(true);
});
