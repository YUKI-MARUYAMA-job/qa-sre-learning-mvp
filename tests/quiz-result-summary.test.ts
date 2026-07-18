import { expect, test } from "bun:test";
import { summarizeByCategory } from "../src/client/lib/quizResultSummary";

test("summarizes quiz attempts by category", () => {
    const result = summarizeByCategory([
        { category: "dev_env_devops", track: "ap", isCorrect: true },
        { category: "dev_env_devops", track: "ap", isCorrect: false },
        { category: "frontend_languages", track: "ap", isCorrect: true }
    ]);

    expect(result).toContainEqual({
        key: "dev_env_devops",
        total: 2,
        correct: 1,
        accuracy: 0.5
    });

    expect(result).toContainEqual({
        key: "frontend_languages",
        total: 1,
        correct: 1,
        accuracy: 1
    });
});