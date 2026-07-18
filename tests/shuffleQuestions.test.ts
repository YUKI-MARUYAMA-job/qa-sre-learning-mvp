import { expect, test } from "bun:test";
import { shuffleQuestions } from "../src/client/lib/shuffleQuestions.ts";

test("shuffleQuestions preserves all items and does not mutate input", () => {
  const input = ["a", "b", "c", "d"];
  const output = shuffleQuestions(input, () => 0.5);

  expect(output).toHaveLength(input.length);
  expect([...output].sort()).toEqual([...input].sort());
  expect(input).toEqual(["a", "b", "c", "d"]);
});
