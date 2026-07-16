import { expect, test } from "bun:test";
import { validateQuizTaxonomy } from "../src/application/validate-quiz-taxonomy.ts";
import { QuizQuestionsSchema } from "../src/schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../src/schemas/subject-taxonomy.schema.ts";

test("quiz questions match subject taxonomy", async () => {
  const quizJson = await Bun.file("data/raw/quiz-questions.json").json();
  const taxonomyJson = await Bun.file("data/raw/subject-taxonomy.json").json();

  const questions = QuizQuestionsSchema.parse(quizJson);
  const taxonomy = SubjectTaxonomySchema.parse(taxonomyJson);

  const issues = validateQuizTaxonomy(questions, taxonomy);

  expect(issues).toEqual([]);
});

test("taxonomy validation detects unknown sub category", async () => {
  const taxonomyJson = await Bun.file("data/raw/subject-taxonomy.json").json();
  const taxonomy = SubjectTaxonomySchema.parse(taxonomyJson);

  const issues = validateQuizTaxonomy(
    [
      {
        id: "edge_infra_security-quiz-bad",
        track: "cloudflare",
        category: "edge_infra_security",
        sub_category: "Unknown",
        sub_sub_category: "Unknown",
        difficulty: "basic",
        question: "This is a sufficiently long invalid taxonomy question.",
        options: {
          "1": "A",
          "2": "B",
          "3": "C",
          "4": "D"
        },
        answer: "1",
        explanation: "This explanation is sufficiently long for schema-compatible taxonomy validation testing.",
        source: {
          title: "Example",
          url: "https://example.com",
          publisher: "Example",
          retrieved_at: "2026-07-16"
        },
        legal: {
          is_official_question_reproduction: false,
          is_copied_verbatim: false,
          is_official_certification_claim: false,
          is_affiliation_or_endorsement_claim: false,
          is_modified_or_original: true,
          attribution: "Source: Example"
        },
        review: {
          status: "reviewed",
          reviewed_at: "2026-07-16"
        },
        tags: ["edge_infra_security"]
      }
    ],
    taxonomy
  );

  expect(issues.some((issue) => issue.rule === "unknown-sub-category")).toBe(true);
});
