export type QuizAttemptSummaryInput = {
    category: string;
    track: string;
    isCorrect: boolean;
};

export type GroupedScore = {
    key: string;
    total: number;
    correct: number;
    accuracy: number;
};

export function summarizeByCategory(
    attempts: QuizAttemptSummaryInput[]
): GroupedScore[] {
    const map = new Map<string, { total: number; correct: number }>();

    for (const attempt of attempts) {
        const current = map.get(attempt.category) ?? { total: 0, correct: 0 };

        current.total += 1;

        if (attempt.isCorrect) {
            current.correct += 1;
        }

        map.set(attempt.category, current);
    }

    return [...map.entries()].map(([key, value]) => ({
        key,
        total: value.total,
        correct: value.correct,
        accuracy: value.total === 0 ? 0 : value.correct / value.total
    }));
}