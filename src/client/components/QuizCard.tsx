import type { PublicQuizQuestion } from "../../schemas/public-quiz-data.schema.ts";

type AnswerKey = "1" | "2" | "3" | "4";

type QuizCardProps = {
  question: PublicQuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: AnswerKey | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onSelectAnswer: (answer: AnswerKey) => void;
  onNext: () => void;
};

const answerKeys: AnswerKey[] = ["1", "2", "3", "4"];

export function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isAnswered,
  isCorrect,
  onSelectAnswer,
  onNext
}: QuizCardProps) {
  return (
    <section className="panel">
      <div className="meta-row">
        <span className="badge">
          {currentIndex + 1} / {totalQuestions}
        </span>
        <span className="badge">{question.track}</span>
        <span className="badge">{question.category}</span>
        <span className="badge">{question.difficulty}</span>
      </div>

      <h2>Question</h2>
      <p className="question-text">{question.question}</p>

      <div className="options" aria-label="選択肢">
        {answerKeys.map((key) => {
          const isSelected = selectedAnswer === key;
          const isCorrectOption = question.answer === key;
          const isIncorrectSelected =
            isAnswered && isSelected && !isCorrectOption;

          const optionClassName = [
            "option-button",
            isSelected ? "selected" : "",
            isAnswered && isCorrectOption ? "correct" : "",
            isIncorrectSelected ? "incorrect" : ""
          ]
            .filter(Boolean)
            .join(" ");

          const statusLabel =
            isAnswered && isCorrectOption
              ? "正解"
              : isIncorrectSelected
                ? "不正解"
                : "";

          return (
            <button
              key={key}
              type="button"
              className={optionClassName}
              onClick={() => onSelectAnswer(key)}
              disabled={isAnswered}
              aria-label={`${key}. ${question.options[key]}${statusLabel ? ` ${statusLabel}` : ""
                }`}
            >
              <strong>{key}.</strong>
              <span>{question.options[key]}</span>

              {statusLabel ? (
                <span className="option-status" aria-hidden="true">
                  {statusLabel}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div
          className={`feedback ${isCorrect ? "feedback--correct" : "feedback--incorrect"
            }`}
          role="status"
          aria-live="polite"
        >
          <h3>{isCorrect ? "正解" : "不正解"}</h3>
          <p>
            正答: <strong>{question.answer}</strong>
          </p>
          <p>{question.explanation}</p>
          <p className="muted">
            Source: {question.source.publisher} — {question.source.title}
          </p>
        </div>
      )}

      <div className="actions">
        <button
          type="button"
          className="primary-button"
          onClick={onNext}
          disabled={!isAnswered}
        >
          {currentIndex + 1 >= totalQuestions ? "結果を見る" : "次の問題へ"}
        </button>
      </div>
    </section>
  );
}