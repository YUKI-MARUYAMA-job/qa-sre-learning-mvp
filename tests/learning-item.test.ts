import { expect, test } from "bun:test";
import type { LearningItem } from "../src/domain/learning-item";

test("learning item type can represent a valid item", () => {
  const item: LearningItem = {
    id: "git-001",
    title: "Git divergent branches",
    category: "git",
    difficulty: "basic",
    sourceType: "official-doc",
    sourceUrl: "https://git-scm.com/docs/git-pull",
    summary: "Understand how to handle divergent branches.",
    tags: ["git", "troubleshooting"]
  };

  expect(item.id).toBe("git-001");
  expect(item.tags).toContain("git");
});
