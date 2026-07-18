import { ErrorState } from "./components/ErrorState.tsx";
import { LoadingState } from "./components/LoadingState.tsx";
import { QuizCard } from "./components/QuizCard.tsx";
import { QuizResult } from "./components/QuizResult.tsx";
import { useQuizData } from "./hooks/useQuizData.ts";
import { useQuizSession } from "./hooks/useQuizSession.ts";
import type { PublicQuizQuestion } from "../schemas/public-quiz-data.schema.ts";

function EmptyQuizState() {
  return (
    <section className="panel">
      <h2>クイズデータがありません</h2>
      <p className="muted">public quiz data に問題が含まれていません。</p>
    </section>
  );
}

function QuizRunner({ questions }: { questions: PublicQuizQuestion[] }) {
  const session = useQuizSession(questions);

  if (session.isFinished) {
    return (
      <QuizResult
        correctCount={session.correctCount}
        totalQuestions={session.totalQuestions}
        attempts={session.attempts}
        onRestart={session.restart}
      />
    );
  }

  return (
    <QuizCard
      question={session.currentQuestion}
      currentIndex={session.currentIndex}
      totalQuestions={session.totalQuestions}
      selectedAnswer={session.selectedAnswer}
      isAnswered={session.isAnswered}
      isCorrect={session.isCorrect}
      onSelectAnswer={session.selectAnswer}
      onNext={session.next}
    />
  );
}

function QuizAppReady({ questions }: { questions: PublicQuizQuestion[] }) {
  if (questions.length === 0) {
    return <EmptyQuizState />;
  }

  return <QuizRunner questions={questions} />;
}

export function App() {
  const quizData = useQuizData();

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>QA / SRE Learning Quiz</h1>
        <p>Validated quiz data を利用した、QA / SRE 学習用の最小クイズUI。</p>
      </header>

      {quizData.status === "loading" ? <LoadingState /> : null}
      {quizData.status === "error" ? (
        <ErrorState message={quizData.error} />
      ) : null}
      {quizData.status === "ready" ? (
        <QuizAppReady questions={quizData.data.questions} />
      ) : null}
    </main>
  );
}
