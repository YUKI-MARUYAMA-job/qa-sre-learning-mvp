import { validateQuizPolicy } from "../application/validate-quiz-policy.ts";
import { QuizQuestionsSchema } from "../schemas/quiz-question.schema.ts";

const quizPath = "data/raw/quiz-questions.json";

try {
  const quizJson = await Bun.file(quizPath).json();
  const quizResult = QuizQuestionsSchema.safeParse(quizJson);

  if (!quizResult.success) {
    console.error("Quiz schema validation failed before policy validation.");
    for (const issue of quizResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const policyIssues = validateQuizPolicy(quizResult.data);

  if (policyIssues.length > 0) {
    console.error("Quiz policy validation failed.");
    for (const issue of policyIssues) {
      console.error(`- [${issue.id}] ${issue.rule}: ${issue.message}`);
    }
    process.exit(1);
  }

  console.log(`Quiz policy validation passed: ${quizResult.data.length} questions`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
