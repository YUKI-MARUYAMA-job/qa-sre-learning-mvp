import type { QuizAttempt } from "../hooks/useQuizSession.ts";

type QuizResultProps = {
  correctCount: number;
  totalQuestions: number;
  attempts: QuizAttempt[];
  onRestart: () => void;
};

type CategoryScore = {
  category: string;
  correct: number;
  total: number;
  accuracy: number;
};

function summarizeByCategory(attempts: QuizAttempt[]): CategoryScore[] {
  const scoreMap = new Map<string, { correct: number; total: number }>();

  for (const attempt of attempts) {
    const current = scoreMap.get(attempt.category) ?? {
      correct: 0,
      total: 0
    };

    current.total += 1;

    if (attempt.isCorrect) {
      current.correct += 1;
    }

    scoreMap.set(attempt.category, current);
  }

  return [...scoreMap.entries()]
    .map(([category, score]) => ({
      category,
      correct: score.correct,
      total: score.total,
      accuracy:
        score.total === 0 ? 0 : Math.round((score.correct / score.total) * 100)
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export function QuizResult({
  correctCount,
  totalQuestions,
  attempts,
  onRestart
}: QuizResultProps) {
  const accuracy =
    totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  const categoryScores = summarizeByCategory(attempts);

  return (
    <section className="panel">
      <h2>Result</h2>

      <p className="result-score" data-testid="result-score">
        Score: <strong>{correctCount}</strong> / {totalQuestions}
      </p>

      <p data-testid="result-accuracy">
        Accuracy: <strong>{accuracy}%</strong>
      </p>

      {categoryScores.length > 0 ? (
        <section
          className="result-breakdown"
          aria-labelledby="category-score-heading"
        >
          <h3 id="category-score-heading">カテゴリ別スコア</h3>

          <div className="result-table-wrapper">
            <table className="result-table">
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Score</th>
                  <th scope="col">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {categoryScores.map((score) => (
                  <tr key={score.category}>
                    <td>{score.category}</td>
                    <td>
                      {score.correct} / {score.total}
                    </td>
                    <td>{score.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="actions">
        <button type="button" className="primary-button" onClick={onRestart}>
          もう一度解く
        </button>
      </div>
    </section>
  );
}
