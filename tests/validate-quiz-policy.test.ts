import { expect, test } from "bun:test";
import policyInvalidQuizQuestions from "../data/fixtures/policy-invalid-quiz-questions.json";
import quizQuestions from "../data/raw/quiz-questions.json";
import subjectTaxonomy from "../data/raw/subject-taxonomy.json";
import { validateQuizPolicy } from "../src/application/validate-quiz-policy.ts";
import { validateQuizTaxonomy } from "../src/application/validate-quiz-taxonomy.ts";
import { QuizQuestionsSchema } from "../src/schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../src/schemas/subject-taxonomy.schema.ts";

test("valid quiz questions pass quiz policy validation", () => {
  const quizResult = QuizQuestionsSchema.safeParse(quizQuestions);
  expect(quizResult.success).toBe(true);

  if (!quizResult.success) {
    throw new Error("Expected quiz questions to pass schema validation.");
  }

  const policyIssues = validateQuizPolicy(quizResult.data);

  expect(policyIssues).toEqual([]);
});

test("policy-invalid quiz fixture passes schema and taxonomy but fails policy validation", () => {
  const quizResult = QuizQuestionsSchema.safeParse(policyInvalidQuizQuestions);
  expect(quizResult.success).toBe(true);

  if (!quizResult.success) {
    throw new Error("Expected policy-invalid fixture to pass schema validation.");
  }

  const taxonomyResult = SubjectTaxonomySchema.safeParse(subjectTaxonomy);
  expect(taxonomyResult.success).toBe(true);

  if (!taxonomyResult.success) {
    throw new Error("Expected subject taxonomy to pass schema validation.");
  }

  const taxonomyIssues = validateQuizTaxonomy(
    quizResult.data,
    taxonomyResult.data
  );
  expect(taxonomyIssues).toEqual([]);

  const policyIssues = validateQuizPolicy(quizResult.data);
  const rules = new Set(policyIssues.map((issue) => issue.rule));

  expect(policyIssues.length).toBeGreaterThan(0);
  expect(rules.has("internal-source-required")).toBe(true);
  expect(rules.has("source-publisher-internal")).toBe(true);
  expect(rules.has("review-required")).toBe(true);
  expect(rules.has("no-verbatim-copy")).toBe(true);
  expect(rules.has("no-official-question-reproduction")).toBe(true);
  expect(rules.has("no-official-certification-claim")).toBe(true);
  expect(rules.has("no-affiliation-endorsement-claim")).toBe(true);
  expect(rules.has("no-external-exam-claim")).toBe(true);
  expect(rules.has("no-secret-like-text")).toBe(true);
});
