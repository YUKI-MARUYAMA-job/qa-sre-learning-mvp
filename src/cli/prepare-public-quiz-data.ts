import { buildPublicQuizData } from "../application/build-public-quiz-data.ts";
import { validateQuizPolicy } from "../application/validate-quiz-policy.ts";
import { validateQuizTaxonomy } from "../application/validate-quiz-taxonomy.ts";
import { PublicQuizDataSchema } from "../schemas/public-quiz-data.schema.ts";
import { QuizQuestionsSchema } from "../schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../schemas/subject-taxonomy.schema.ts";

const quizPath = "data/raw/quiz-questions.json";
const taxonomyPath = "data/raw/subject-taxonomy.json";
const outputPath = "public/study-it/quiz_data.json";

try {
  const [quizJson, taxonomyJson] = await Promise.all([
    Bun.file(quizPath).json(),
    Bun.file(taxonomyPath).json()
  ]);

  const quizResult = QuizQuestionsSchema.safeParse(quizJson);

  if (!quizResult.success) {
    console.error("Quiz schema validation failed before public data generation.");
    for (const issue of quizResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const taxonomyResult = SubjectTaxonomySchema.safeParse(taxonomyJson);

  if (!taxonomyResult.success) {
    console.error("Subject taxonomy schema validation failed before public data generation.");
    for (const issue of taxonomyResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const questions = quizResult.data;
  const taxonomy = taxonomyResult.data;

  const taxonomyIssues = validateQuizTaxonomy(questions, taxonomy);

  if (taxonomyIssues.length > 0) {
    console.error("Quiz taxonomy validation failed before public data generation.");
    for (const issue of taxonomyIssues) {
      console.error(`- [${issue.id}] ${issue.rule}: ${issue.message}`);
    }
    process.exit(1);
  }

  const policyIssues = validateQuizPolicy(questions);

  if (policyIssues.length > 0) {
    console.error("Quiz policy validation failed before public data generation.");
    for (const issue of policyIssues) {
      console.error(`- [${issue.id}] ${issue.rule}: ${issue.message}`);
    }
    process.exit(1);
  }

  const publicQuizData = buildPublicQuizData(questions);
  const publicQuizResult = PublicQuizDataSchema.safeParse(publicQuizData);

  if (!publicQuizResult.success) {
    console.error("Generated public quiz data failed schema validation.");
    for (const issue of publicQuizResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  await Bun.$`mkdir -p public/study-it`;
  await Bun.write(
    outputPath,
    `${JSON.stringify(publicQuizResult.data, null, 2)}\n`
  );

  console.log(`Public quiz data generated: ${outputPath}`);
  console.log(`Questions: ${publicQuizResult.data.questions.length}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
