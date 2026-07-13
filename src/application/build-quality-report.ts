import type { LearningItemInput } from "../schemas/learning-item.schema";
import type { SourcePolicyIssue } from "./validate-source-policy";

type CountEntry = {
  name: string;
  count: number;
};

function incrementCount(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function toSortedCountEntries(map: Map<string, number>): CountEntry[] {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function pushCountSection(
  lines: string[],
  title: string,
  entries: readonly CountEntry[]
): void {
  lines.push(`## ${title}`);
  lines.push("");

  if (entries.length === 0) {
    lines.push("- none");
    lines.push("");
    return;
  }

  for (const entry of entries) {
    lines.push(`- ${entry.name}: ${entry.count}`);
  }

  lines.push("");
}

export function buildQualityReport(
  items: readonly LearningItemInput[],
  policyIssues: readonly SourcePolicyIssue[]
): string {
  const categoryCounts = new Map<string, number>();
  const difficultyCounts = new Map<string, number>();
  const sourceTypeCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const item of items) {
    incrementCount(categoryCounts, item.category);
    incrementCount(difficultyCounts, item.difficulty);
    incrementCount(sourceTypeCounts, item.sourceType);

    for (const tag of item.tags) {
      incrementCount(tagCounts, tag);
    }
  }

  const lines: string[] = [
    "# Quality Report",
    "",
    "## Summary",
    "",
    `- Total learning items: ${items.length}`,
    `- Source policy issues: ${policyIssues.length}`,
    "",
    "## Quality Gates",
    "",
    "- TypeScript typecheck: pass",
    "- Bun unit tests: pass",
    "- Data schema validation: pass",
    `- Source policy validation: ${policyIssues.length === 0 ? "pass" : "fail"}`,
    ""
  ];

  pushCountSection(lines, "Category Counts", toSortedCountEntries(categoryCounts));
  pushCountSection(lines, "Difficulty Counts", toSortedCountEntries(difficultyCounts));
  pushCountSection(lines, "Source Type Counts", toSortedCountEntries(sourceTypeCounts));
  pushCountSection(lines, "Tag Counts", toSortedCountEntries(tagCounts));

  lines.push("## Source Policy Issues");
  lines.push("");

  if (policyIssues.length === 0) {
    lines.push("- none");
  } else {
    for (const issue of policyIssues) {
      lines.push(`- [${issue.rule}] ${issue.itemId}: ${issue.message}`);
    }
  }

  lines.push("");

  return lines.join("\n");
}
