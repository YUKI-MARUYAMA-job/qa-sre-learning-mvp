import { expect, test } from "@playwright/test";

test("quiz app loads and completes a minimal session", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /QA\/SRE Learning Quiz/i })
  ).toBeVisible();

  const response = await page.request.get("/study-it/quiz_data.json");
  expect(response.ok()).toBeTruthy();

  const quizData = await response.json();
  const questions = Array.isArray(quizData) ? quizData : quizData.questions;
  const questionCount = questions.length;

  expect(questionCount).toBeGreaterThan(0);

  for (let index = 0; index < questionCount; index += 1) {
    const firstOption = page.getByRole("button", { name: /^1\./ }).first();

    await expect(firstOption).toBeVisible();
    await firstOption.click();

    const feedback = page.getByRole("status");

    await expect(feedback).toBeVisible();
    await expect(
      feedback.getByRole("heading", { name: /正解|不正解/ })
    ).toBeVisible();

    const nextOrResultButton = page.getByRole("button", {
      name: /次の問題へ|結果を見る/
    });

    await expect(nextOrResultButton).toBeEnabled();
    await nextOrResultButton.click();
  }

  await expect(
    page.getByRole("heading", { name: /結果|Result/i })
  ).toBeVisible();

  await expect(page.getByText(/スコア|Score[:：]?/i)).toBeVisible();

  await page.getByRole("button", { name: /もう一度解く/ }).click();

  await expect(page.getByText(/Question/i)).toBeVisible();
});

test("quiz answer feedback is visually distinguishable", async ({ page }) => {
  await page.goto("/");

  const response = await page.request.get("/study-it/quiz_data.json");
  expect(response.ok()).toBeTruthy();

  const quizData = await response.json();
  const questions = Array.isArray(quizData) ? quizData : quizData.questions;
  const firstQuestion = questions[0];

  expect(firstQuestion).toBeTruthy();

  const wrongAnswer = ["1", "2", "3", "4"].find(
    (option) => option !== firstQuestion.answer
  );

  expect(wrongAnswer).toBeTruthy();

  await page
    .getByRole("button", { name: new RegExp(`^${wrongAnswer}\\.`) })
    .click();

  const feedback = page.getByRole("status");

  await expect(feedback).toBeVisible();
  await expect(
    feedback.getByRole("heading", { name: /不正解/ })
  ).toBeVisible();

  await expect(page.locator(".option-button.incorrect")).toBeVisible();
  await expect(page.locator(".option-button.correct")).toBeVisible();
});