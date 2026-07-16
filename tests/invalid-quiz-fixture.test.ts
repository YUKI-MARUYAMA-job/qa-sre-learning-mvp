import { expect, test } from "bun:test";
import { validateQuizTaxonomy } from "../src/application/validate-quiz-taxonomy.ts";
import { QuizQuestionsSchema } from "../src/schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../src/schemas/subject-taxonomy.schema.ts";

test("invalid quiz fixture fails schema or taxonomy validation", async () => {
  const quizJson = await Bun.file("data/fixtures/invalid-quiz-questions.json").json();
  const taxonomyJson = await Bun.file("data/raw/subject-taxonomy.json").json();

  const quizResult = QuizQuestionsSchema.safeParse(quizJson);

  if (!quizResult.success) {
    expect(quizResult.success).toBe(false);
    return;
  }

  const taxonomy = SubjectTaxonomySchema.parse(taxonomyJson);
  const issues = validateQuizTaxonomy(quizResult.data, taxonomy);

  expect(issues.length).toBeGreaterThan(0);
});
