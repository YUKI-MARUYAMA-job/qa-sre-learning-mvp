import { validateQuizPolicy } from "../application/validate-quiz-policy.ts";
import { validateQuizTaxonomy } from "../application/validate-quiz-taxonomy.ts";
import {
  QuizQuestionsSchema,
  type QuizQuestion
} from "../schemas/quiz-question.schema.ts";
import {
  SubjectTaxonomySchema,
  type SubjectTaxonomy
} from "../schemas/subject-taxonomy.schema.ts";

const quizPath = "data/raw/quiz-questions.json";
const taxonomyPath = "data/raw/subject-taxonomy.json";
const outputPath = "reports/quiz-quality-report.md";

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function renderCountTable(title: string, counts: Map<string, number>): string {
  const rows = Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));

  if (rows.length === 0) {
    return `## ${title}\n\nNo data.\n`;
  }

  return [
    `## ${title}`,
    "",
    "| Key | Count |",
    "|---|---:|",
    ...rows.map(([key, count]) => `| ${key} | ${count} |`),
    ""
  ].join("\n");
}

function renderValidationStatusTable(
  taxonomyIssueCount: number,
  policyIssueCount: number
): string {
  return [
    "## Validation Status",
    "",
    "| Layer | Status | Issue Count |",
    "|---|---|---:|",
    `| Zod schema | PASS | 0 |`,
    `| Taxonomy | ${taxonomyIssueCount === 0 ? "PASS" : "FAIL"} | ${taxonomyIssueCount} |`,
    `| Policy | ${policyIssueCount === 0 ? "PASS" : "FAIL"} | ${policyIssueCount} |`,
    ""
  ].join("\n");
}

function renderLegalFlags(questions: QuizQuestion[]): string {
  const copiedVerbatim = questions.filter((item) => item.legal.is_copied_verbatim).length;
  const officialReproduction = questions.filter(
    (item) => item.legal.is_official_question_reproduction
  ).length;
  const certificationClaim = questions.filter(
    (item) => item.legal.is_official_certification_claim
  ).length;
  const endorsementClaim = questions.filter(
    (item) => item.legal.is_affiliation_or_endorsement_claim
  ).length;
  const modifiedOrOriginal = questions.filter(
    (item) => item.legal.is_modified_or_original
  ).length;

  return [
    "## Legal Flag Summary",
    "",
    "| Flag | Count |",
    "|---|---:|",
    `| is_copied_verbatim | ${copiedVerbatim} |`,
    `| is_official_question_reproduction | ${officialReproduction} |`,
    `| is_official_certification_claim | ${certificationClaim} |`,
    `| is_affiliation_or_endorsement_claim | ${endorsementClaim} |`,
    `| is_modified_or_original | ${modifiedOrOriginal} |`,
    ""
  ].join("\n");
}

function renderTaxonomyCoverage(
  questions: QuizQuestion[],
  taxonomy: SubjectTaxonomy
): string {
  const lines = [
    "## Taxonomy Coverage",
    "",
    "| Category | Label | Questions | Covered Sub Categories | Total Sub Categories | Coverage |",
    "|---|---|---:|---:|---:|---:|"
  ];

  for (const category of taxonomy.categories) {
    const categoryQuestions = questions.filter(
      (question) => question.category === category.key
    );

    const usedSubCategories = new Set(
      categoryQuestions.map((question) => question.sub_category)
    );

    const totalSubCategories = category.sub_categories.length;
    const coveredSubCategories = Array.from(usedSubCategories).filter((name) =>
      category.sub_categories.some((item) => item.name === name)
    ).length;

    const coverage =
      totalSubCategories === 0
        ? "0.0%"
        : `${((coveredSubCategories / totalSubCategories) * 100).toFixed(1)}%`;

    lines.push(
      `| ${category.key} | ${category.label} | ${categoryQuestions.length} | ${coveredSubCategories} | ${totalSubCategories} | ${coverage} |`
    );
  }

  lines.push("");
  return lines.join("\n");
}

function renderCommandSection(): string {
  return [
    "## Validation Commands",
    "",
    "```bash",
    "bun run validate:quiz",
    "bun run validate:quiz-policy",
    "bun run validate:quiz-fixtures",
    "bun run quiz:report",
    "bun run quiz:report:check",
    "bun run check",
    "```",
    ""
  ].join("\n");
}

function buildQuizReport(
  questions: QuizQuestion[],
  taxonomy: SubjectTaxonomy,
  taxonomyIssueCount: number,
  policyIssueCount: number
): string {
  const trackCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const difficultyCounts = new Map<string, number>();
  const publisherCounts = new Map<string, number>();
  const reviewStatusCounts = new Map<string, number>();

  for (const question of questions) {
    increment(trackCounts, question.track);
    increment(categoryCounts, question.category);
    increment(difficultyCounts, question.difficulty);
    increment(publisherCounts, question.source.publisher);
    increment(reviewStatusCounts, question.review.status);
  }

  return [
    "# Quiz Quality Report",
    "",
    "This report is generated from repository quiz data.",
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---:|",
    `| Total quiz questions | ${questions.length} |`,
    `| Taxonomy issue count | ${taxonomyIssueCount} |`,
    `| Policy issue count | ${policyIssueCount} |`,
    "",
    renderValidationStatusTable(taxonomyIssueCount, policyIssueCount),
    renderCountTable("Track Distribution", trackCounts),
    renderCountTable("Category Distribution", categoryCounts),
    renderCountTable("Difficulty Distribution", difficultyCounts),
    renderCountTable("Source Publisher Distribution", publisherCounts),
    renderCountTable("Review Status Distribution", reviewStatusCounts),
    renderLegalFlags(questions),
    renderTaxonomyCoverage(questions, taxonomy),
    renderCommandSection()
  ].join("\n");
}

try {
  const [quizJson, taxonomyJson] = await Promise.all([
    Bun.file(quizPath).json(),
    Bun.file(taxonomyPath).json()
  ]);

  const quizResult = QuizQuestionsSchema.safeParse(quizJson);

  if (!quizResult.success) {
    console.error("Quiz schema validation failed before report generation.");
    for (const issue of quizResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const taxonomyResult = SubjectTaxonomySchema.safeParse(taxonomyJson);

  if (!taxonomyResult.success) {
    console.error("Subject taxonomy schema validation failed before report generation.");
    for (const issue of taxonomyResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const questions = quizResult.data;
  const taxonomy = taxonomyResult.data;

  const taxonomyIssues = validateQuizTaxonomy(questions, taxonomy);
  const policyIssues = validateQuizPolicy(questions);

  if (taxonomyIssues.length > 0) {
    console.error("Quiz taxonomy validation failed before report generation.");
    for (const issue of taxonomyIssues) {
      console.error(`- [${issue.id}] ${issue.rule}: ${issue.message}`);
    }
    process.exit(1);
  }

  if (policyIssues.length > 0) {
    console.error("Quiz policy validation failed before report generation.");
    for (const issue of policyIssues) {
      console.error(`- [${issue.id}] ${issue.rule}: ${issue.message}`);
    }
    process.exit(1);
  }

  const report = buildQuizReport(
    questions,
    taxonomy,
    taxonomyIssues.length,
    policyIssues.length
  );

  await Bun.write(outputPath, report.endsWith("\n") ? report : `${report}\n`);

  console.log(`Quiz quality report generated: ${outputPath}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
