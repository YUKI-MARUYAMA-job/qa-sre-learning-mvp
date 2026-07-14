import { expect, test } from "bun:test";
import { validateSourcePolicy } from "../src/application/validate-source-policy";
import { LearningItemsSchema } from "../src/schemas/learning-item.schema";

test("invalid fixture fails schema validation", async () => {
  const file = Bun.file("data/fixtures/invalid-learning-items.json");
  const json = await file.json();

  const result = LearningItemsSchema.safeParse(json);

  expect(result.success).toBe(false);
});

test("source policy detects policy-level invalid items", () => {
  const policyInvalidItems = [
    {
      id: "ci-001",
      title: "Missing source URL",
      category: "ci",
      difficulty: "basic",
      sourceType: "official-doc",
      summary: "This item intentionally omits sourceUrl for policy validation.",
      tags: ["ci", "quality-gate"]
    },
    {
      id: "note-001",
      title: "Duplicate tags",
      category: "note",
      difficulty: "basic",
      sourceType: "original-note",
      summary: "This item intentionally contains duplicate tags.",
      tags: ["note", "note"]
    }
  ];

  const parsed = LearningItemsSchema.safeParse(policyInvalidItems);

  expect(parsed.success).toBe(true);

  if (!parsed.success) {
    throw new Error("Expected schema-compatible policy fixture.");
  }

  const issues = validateSourcePolicy(parsed.data);

  expect(issues.some((issue) => issue.rule === "source-url-required")).toBe(true);
  expect(issues.some((issue) => issue.rule === "unique-tags")).toBe(true);
});
