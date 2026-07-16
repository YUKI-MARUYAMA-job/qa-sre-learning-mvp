import type { QuizQuestion } from "../schemas/quiz-question.schema.ts";
import type {
  PublicQuizData,
  PublicQuizQuestion
} from "../schemas/public-quiz-data.schema.ts";

export function toPublicQuizQuestion(question: QuizQuestion): PublicQuizQuestion {
  return {
    id: question.id,
    track: question.track,
    category: question.category,
    sub_category: question.sub_category,
    sub_sub_category: question.sub_sub_category,
    sub_sub_sub_category: question.sub_sub_sub_category,
    difficulty: question.difficulty,
    question: question.question,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation,
    source: question.source,
    tags: question.tags
  };
}

export function buildPublicQuizData(questions: QuizQuestion[]): PublicQuizData {
  const sortedQuestions = [...questions].sort((a, b) => a.id.localeCompare(b.id));

  return {
    version: "2026-07-16",
    generated_from: "data/raw/quiz-questions.json",
    questions: sortedQuestions.map(toPublicQuizQuestion)
  };
}
