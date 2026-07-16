type QuizResultProps = {
  correctCount: number;
  totalQuestions: number;
  onRestart: () => void;
};

export function QuizResult({
  correctCount,
  totalQuestions,
  onRestart
}: QuizResultProps) {
  const accuracy =
    totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  return (
    <section className="panel">
      <h2>Result</h2>
      <p>
        Score: {correctCount} / {totalQuestions}
      </p>
      <p>Accuracy: {accuracy}%</p>

      <div className="actions">
        <button type="button" className="primary-button" onClick={onRestart}>
          もう一度解く
        </button>
      </div>
    </section>
  );
}
