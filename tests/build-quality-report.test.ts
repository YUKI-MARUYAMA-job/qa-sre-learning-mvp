import { expect, test } from "bun:test";
import type { LearningItemInput } from "../src/schemas/learning-item.schema";
import { buildQualityReport } from "../src/application/build-quality-report";

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

test("builds quality report from learning items", () => {
  const report = buildQualityReport([validItem], []);

  expect(report).toContain("# Quality Report");
  expect(report).toContain("- Total learning items: 1");
  expect(report).toContain("- Source policy issues: 0");
  expect(report).toContain("- Source policy validation: pass");
  expect(report).toContain("- git: 1");
  expect(report).toContain("- official-doc: 1");
});

test("quality report records source policy issues", () => {
  const report = buildQualityReport(
    [validItem],
    [
      {
        itemId: "git-001",
        rule: "example-rule",
        message: "Example issue."
      }
    ]
  );

  expect(report).toContain("- Source policy issues: 1");
  expect(report).toContain("- Source policy validation: fail");
  expect(report).toContain("- [example-rule] git-001: Example issue.");
});
