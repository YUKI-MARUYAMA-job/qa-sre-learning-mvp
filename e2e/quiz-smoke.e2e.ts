import { expect, test } from "@playwright/test";

test("quiz app loads and completes a minimal session", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /QA\/SRE Learning Quiz/i })
  ).toBeVisible();

  await expect(page.getByText(/Question/i)).toBeVisible();

  const firstOption = page.getByRole("button", { name: /^1\./ }).first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();

  await expect(page.getByText(/正解|不正解/)).toBeVisible();

  const nextOrResultButton = page.getByRole("button", {
    name: /次の問題へ|結果を見る/
  });
  await expect(nextOrResultButton).toBeEnabled();
  await nextOrResultButton.click();

  const visibleButtonCount = await page
    .getByRole("button", { name: /^1\./ })
    .count();

  if (visibleButtonCount > 0) {
    await page.getByRole("button", { name: /^1\./ }).first().click();
    await expect(page.getByText(/正解|不正解/)).toBeVisible();

    await page
      .getByRole("button", { name: /次の問題へ|結果を見る/ })
      .click();
  }

  await expect(page.getByRole("heading", { name: /Result/i })).toBeVisible();
  await expect(page.getByText(/Score:/i)).toBeVisible();

  await page.getByRole("button", { name: /もう一度解く/ }).click();

  await expect(page.getByText(/Question/i)).toBeVisible();
});
