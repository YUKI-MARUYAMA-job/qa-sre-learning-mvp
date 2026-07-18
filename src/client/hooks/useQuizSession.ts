import { useMemo, useState } from "react";
import type { PublicQuizQuestion } from "../../schemas/public-quiz-data.schema.ts";

type AnswerKey = "1" | "2" | "3" | "4";

export type QuizAttempt = {
  questionId: string;
  question: string;
  track: PublicQuizQuestion["track"];
  category: PublicQuizQuestion["category"];
  selectedAnswer: AnswerKey;
  correctAnswer: AnswerKey;
  isCorrect: boolean;
};

export type QuizSessionState = {
  currentQuestion: PublicQuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: AnswerKey | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  correctCount: number;
  attempts: QuizAttempt[];
  isFinished: boolean;
  selectAnswer: (answer: AnswerKey) => void;
  next: () => void;
  restart: () => void;
};

function getCurrentQuestion(
  questions: PublicQuizQuestion[],
  currentIndex: number
): PublicQuizQuestion {
  const question = questions[currentIndex];

  if (!question) {
    throw new Error(
      `Quiz session requires a question at index ${currentIndex}.`
    );
  }

  return question;
}

export function useQuizSession(
  questions: PublicQuizQuestion[]
): QuizSessionState {
  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => a.id.localeCompare(b.id)),
    [questions]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = getCurrentQuestion(sortedQuestions, currentIndex);
  const currentAnswer = currentQuestion.answer;

  const isAnswered = selectedAnswer !== null;
  const isCorrect =
    selectedAnswer === null ? null : selectedAnswer === currentAnswer;

  function selectAnswer(answer: AnswerKey): void {
    if (selectedAnswer !== null) {
      return;
    }

    const answeredCorrectly = answer === currentAnswer;

    setSelectedAnswer(answer);

    if (answeredCorrectly) {
      setCorrectCount((value) => value + 1);
    }

    setAttempts((currentAttempts) => [
      ...currentAttempts,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        track: currentQuestion.track,
        category: currentQuestion.category,
        selectedAnswer: answer,
        correctAnswer: currentAnswer,
        isCorrect: answeredCorrectly
      }
    ]);
  }

  function next(): void {
    if (selectedAnswer === null) {
      return;
    }

    if (currentIndex + 1 >= sortedQuestions.length) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedAnswer(null);
  }

  function restart(): void {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setAttempts([]);
    setIsFinished(false);
  }

  return {
    currentQuestion,
    currentIndex,
    totalQuestions: sortedQuestions.length,
    selectedAnswer,
    isAnswered,
    isCorrect,
    correctCount,
    attempts,
    isFinished,
    selectAnswer,
    next,
    restart
  };
}
