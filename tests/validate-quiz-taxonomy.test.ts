import { expect, test } from "bun:test";
import quizQuestions from "../data/raw/quiz-questions.json";
import subjectTaxonomy from "../data/raw/subject-taxonomy.json";
import { validateQuizTaxonomy } from "../src/application/validate-quiz-taxonomy.ts";
import { QuizQuestionsSchema } from "../src/schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../src/schemas/subject-taxonomy.schema.ts";

test("quiz questions match subject taxonomy", () => {
  const quizResult = QuizQuestionsSchema.safeParse(quizQuestions);
  expect(quizResult.success).toBe(true);

  if (!quizResult.success) {
    throw new Error("Expected quiz questions to pass schema validation.");
  }

  const taxonomyResult = SubjectTaxonomySchema.safeParse(subjectTaxonomy);
  expect(taxonomyResult.success).toBe(true);

  if (!taxonomyResult.success) {
    throw new Error("Expected subject taxonomy to pass schema validation.");
  }

  const issues = validateQuizTaxonomy(quizResult.data, taxonomyResult.data);

  expect(issues).toEqual([]);
});

test("taxonomy validation detects unknown sub category", () => {
  const taxonomyResult = SubjectTaxonomySchema.safeParse(subjectTaxonomy);
  expect(taxonomyResult.success).toBe(true);

  if (!taxonomyResult.success) {
    throw new Error("Expected subject taxonomy to pass schema validation.");
  }

  const quizResult = QuizQuestionsSchema.safeParse([
    {
      id: "schema_taxonomy_validation-invalid-sub-category-001",
      track: "quality",
      category: "schema_taxonomy_validation",
      sub_category: "存在しない分類",
      sub_sub_category: "JSON構造の検証",
      difficulty: "basic",
      question: "taxonomy validationで未知のsub_categoryを検出するためのテスト問題である。",
      options: {
        "1": "存在しないsub_categoryを指定する。",
        "2": "review.statusをreviewedにする。",
        "3": "publisherをqa-sre-learning-mvpにする。",
        "4": "source.urlに内部pathを指定する。"
      },
      answer: "1",
      explanation: "このテストデータはschema validationを通過したうえで、taxonomy validationにより未知のsub_categoryを検出することを確認するためのものである。",
      source: {
        title: "data/raw/subject-taxonomy.json",
        url: "data/raw/subject-taxonomy.json",
        publisher: "qa-sre-learning-mvp",
        retrieved_at: "2026-07-19"
      },
      legal: {
        is_official_question_reproduction: false,
        is_copied_verbatim: false,
        is_official_certification_claim: false,
        is_affiliation_or_endorsement_claim: false,
        is_modified_or_original: true,
        attribution: "Original test fixture for taxonomy validation."
      },
      review: {
        status: "reviewed",
        reviewed_at: "2026-07-19"
      },
      tags: [
        "schema_taxonomy_validation",
        "taxonomy-validation",
        "test"
      ]
    }
  ]);

  expect(quizResult.success).toBe(true);

  if (!quizResult.success) {
    throw new Error("Expected taxonomy test fixture to pass schema validation.");
  }

  const issues = validateQuizTaxonomy(
    quizResult.data,
    taxonomyResult.data
  );

  expect(issues.some((issue) => issue.rule === "unknown-sub-category")).toBe(true);
});
