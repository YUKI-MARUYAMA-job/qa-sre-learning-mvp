import { validateQuizTaxonomy } from "../application/validate-quiz-taxonomy.ts";
import { QuizQuestionsSchema } from "../schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../schemas/subject-taxonomy.schema.ts";

const quizPath = "data/raw/quiz-questions.json";
const taxonomyPath = "data/raw/subject-taxonomy.json";

try {
  const [quizJson, taxonomyJson] = await Promise.all([
    Bun.file(quizPath).json(),
    Bun.file(taxonomyPath).json()
  ]);

  const quizResult = QuizQuestionsSchema.safeParse(quizJson);

  if (!quizResult.success) {
    console.error("Quiz schema validation failed.");
    for (const issue of quizResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const taxonomyResult = SubjectTaxonomySchema.safeParse(taxonomyJson);

  if (!taxonomyResult.success) {
    console.error("Subject taxonomy schema validation failed.");
    for (const issue of taxonomyResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const taxonomyIssues = validateQuizTaxonomy(
    quizResult.data,
    taxonomyResult.data
  );

  if (taxonomyIssues.length > 0) {
    console.error("Quiz taxonomy validation failed.");
    for (const issue of taxonomyIssues) {
      console.error(`- [${issue.id}] ${issue.rule}: ${issue.message}`);
    }
    process.exit(1);
  }

  console.log(`Quiz validation passed: ${quizResult.data.length} questions`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
