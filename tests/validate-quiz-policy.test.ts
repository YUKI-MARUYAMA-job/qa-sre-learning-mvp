import { expect, test } from "bun:test";
import { validateQuizPolicy } from "../src/application/validate-quiz-policy.ts";
import { QuizQuestionsSchema } from "../src/schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../src/schemas/subject-taxonomy.schema.ts";
import { validateQuizTaxonomy } from "../src/application/validate-quiz-taxonomy.ts";

test("valid quiz questions pass quiz policy validation", async () => {
  const quizJson = await Bun.file("data/raw/quiz-questions.json").json();
  const quizResult = QuizQuestionsSchema.safeParse(quizJson);

  expect(quizResult.success).toBe(true);

  if (!quizResult.success) {
    throw new Error("Expected valid quiz data to pass schema validation.");
  }

  const issues = validateQuizPolicy(quizResult.data);

  expect(issues).toEqual([]);
});

test("policy-invalid quiz fixture passes schema and taxonomy but fails policy validation", async () => {
  const quizJson = await Bun.file("data/fixtures/policy-invalid-quiz-questions.json").json();
  const taxonomyJson = await Bun.file("data/raw/subject-taxonomy.json").json();

  const quizResult = QuizQuestionsSchema.safeParse(quizJson);

  expect(quizResult.success).toBe(true);

  if (!quizResult.success) {
    throw new Error("Expected policy-invalid fixture to pass schema validation.");
  }

  const taxonomy = SubjectTaxonomySchema.parse(taxonomyJson);
  const taxonomyIssues = validateQuizTaxonomy(quizResult.data, taxonomy);

  expect(taxonomyIssues).toEqual([]);

  const policyIssues = validateQuizPolicy(quizResult.data);

  expect(policyIssues.length).toBeGreaterThan(0);
  expect(policyIssues.some((issue) => issue.rule === "https-source-url")).toBe(true);
  expect(policyIssues.some((issue) => issue.rule === "review-required")).toBe(true);
  expect(policyIssues.some((issue) => issue.rule === "cloudflare-official-misrepresentation")).toBe(true);
  expect(policyIssues.some((issue) => issue.rule === "no-verbatim-copy")).toBe(true);
});
