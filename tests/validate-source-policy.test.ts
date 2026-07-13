import { expect, test } from "bun:test";
import type { LearningItemInput } from "../src/schemas/learning-item.schema";
import { validateSourcePolicy } from "../src/application/validate-source-policy";

const validItem: LearningItemInput = {
  id: "git-001",
  title: "Git divergent branches",
  category: "git",
  difficulty: "basic",
  sourceType: "official-doc",
  sourceUrl: "https://git-scm.com/docs/git-pull",
  summary: "Understand how to handle divergent branches.",
  tags: ["git", "troubleshooting", "workflow"]
};

function withoutSourceUrl(item: LearningItemInput): LearningItemInput {
  const { sourceUrl: _sourceUrl, ...rest } = item;
  return rest;
}

test("valid source policy passes", () => {
  const issues = validateSourcePolicy([validItem]);

  expect(issues).toHaveLength(0);
});

test("non-original source requires sourceUrl", () => {
  const issues = validateSourcePolicy([withoutSourceUrl(validItem)]);

  expect(issues.some((issue) => issue.rule === "source-url-required")).toBe(true);
});

test("sourceUrl must be HTTPS URL", () => {
  const issues = validateSourcePolicy([
    {
      ...validItem,
      sourceUrl: "http://example.com"
    }
  ]);

  expect(issues.some((issue) => issue.rule === "https-source-url")).toBe(true);
});

test("id should start with category prefix", () => {
  const issues = validateSourcePolicy([
    {
      ...validItem,
      id: "ci-001",
      category: "git"
    }
  ]);

  expect(issues.some((issue) => issue.rule === "id-prefix")).toBe(true);
});

test("tags must not contain duplicate values", () => {
  const issues = validateSourcePolicy([
    {
      ...validItem,
      tags: ["git", "git"]
    }
  ]);

  expect(issues.some((issue) => issue.rule === "unique-tags")).toBe(true);
});

test("tags should include category", () => {
  const issues = validateSourcePolicy([
    {
      ...validItem,
      category: "git",
      tags: ["troubleshooting"]
    }
  ]);

  expect(issues.some((issue) => issue.rule === "category-tag")).toBe(true);
});

test("original-note can omit sourceUrl", () => {
  const originalNote = withoutSourceUrl({
    ...validItem,
    id: "note-001",
    category: "note",
    sourceType: "original-note",
    tags: ["note", "learning"]
  });

  const issues = validateSourcePolicy([originalNote]);

  expect(issues).toHaveLength(0);
});