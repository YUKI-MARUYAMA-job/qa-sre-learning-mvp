import type { QuizQuestion } from "../schemas/quiz-question.schema.ts";
import type { SubjectTaxonomy } from "../schemas/subject-taxonomy.schema.ts";

export type QuizTaxonomyIssue = {
  id: string;
  rule: string;
  message: string;
};

export function validateQuizTaxonomy(
  questions: QuizQuestion[],
  taxonomy: SubjectTaxonomy
): QuizTaxonomyIssue[] {
  const issues: QuizTaxonomyIssue[] = [];

  const categoryMap = new Map(
    taxonomy.categories.map((category) => [category.key, category])
  );

  for (const question of questions) {
    const category = categoryMap.get(question.category);

    if (!category) {
      issues.push({
        id: question.id,
        rule: "unknown-category",
        message: `Unknown category: ${question.category}`
      });
      continue;
    }

    const subCategory = category.sub_categories.find(
      (item) => item.name === question.sub_category
    );

    if (!subCategory) {
      issues.push({
        id: question.id,
        rule: "unknown-sub-category",
        message: `Unknown sub_category for ${question.category}: ${question.sub_category}`
      });
      continue;
    }

    if (!subCategory.sub_sub_categories.includes(question.sub_sub_category)) {
      issues.push({
        id: question.id,
        rule: "unknown-sub-sub-category",
        message: `Unknown sub_sub_category for ${question.category} > ${question.sub_category}: ${question.sub_sub_category}`
      });
    }

    if (!question.tags.includes(question.category)) {
      issues.push({
        id: question.id,
        rule: "category-tag",
        message: "tags must include the category key."
      });
    }

    if (!question.id.startsWith(`${question.category}-`)) {
      issues.push({
        id: question.id,
        rule: "id-prefix",
        message: `id must start with category prefix: ${question.category}-`
      });
    }
  }

  return issues;
}
