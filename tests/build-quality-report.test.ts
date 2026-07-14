import { expect, test } from "bun:test";
import type { LearningItemInput } from "../src/schemas/learning-item.schema";
import { buildQualityReport } from "../src/application/build-quality-report";

const officialDocItem: LearningItemInput = {
  id: "git-001",
  title: "Git divergent branches",
  category: "git",
  difficulty: "basic",
  sourceType: "official-doc",
  sourceUrl: "https://git-scm.com/docs/git-pull",
  summary: "Understand how to handle divergent branches.",
  tags: ["git", "troubleshooting", "workflow"]
};

const originalNoteItem: LearningItemInput = {
  id: "note-001",
  title: "Local QA workflow note",
  category: "note",
  difficulty: "basic",
  sourceType: "original-note",
  summary: "Maintain a local QA workflow that can be reproduced in CI.",
  tags: ["note", "qa", "workflow"]
};

test("builds quality report from learning items", () => {
  const report = buildQualityReport([officialDocItem, originalNoteItem], []);

  expect(report).toContain("# Quality Report");
  expect(report).toContain("- Total learning items: 2");
  expect(report).toContain("- Source policy violations: 0");
  expect(report).toContain("- Source policy validation: pass");
  expect(report).toContain("## Validation Scope");
  expect(report).toContain("- Data file: `data/raw/learning-items.json`");
  expect(report).toContain("- Schema: `LearningItemsSchema`");
  expect(report).toContain("- Source policy: `validateSourcePolicy`");
  expect(report).toContain("## Limitations");
  expect(report).toContain("This report validates metadata quality only.");
  expect(report).toContain("## Data Source Summary");
  expect(report).toContain("- Items with source URL: 1");
  expect(report).toContain("- Items without source URL: 1");
  expect(report).toContain("## Source URL Domains");
  expect(report).toContain("- git-scm.com: 1");
  expect(report).toContain("- git: 1");
  expect(report).toContain("- note: 1");
  expect(report).toContain("- official-doc: 1");
  expect(report).toContain("- original-note: 1");
});

test("quality report records source policy violations", () => {
  const report = buildQualityReport(
    [officialDocItem],
    [
      {
        itemId: "git-001",
        rule: "example-rule",
        message: "Example issue."
      }
    ]
  );

  expect(report).toContain("- Source policy violations: 1");
  expect(report).toContain("- Source policy validation: fail");
  expect(report).toContain("## Source Policy Violations");
  expect(report).toContain("- [example-rule] git-001: Example issue.");
});
