import type { LearningItemInput } from "../schemas/learning-item.schema";

export type SourcePolicyIssue = {
  itemId: string;
  rule: string;
  message: string;
};

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasDuplicateValues(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

function isValidTag(value: string): boolean {
  return /^[a-z0-9-]+$/.test(value);
}

export function validateSourcePolicy(
  items: readonly LearningItemInput[]
): SourcePolicyIssue[] {
  const issues: SourcePolicyIssue[] = [];

  for (const item of items) {
    const sourceUrl = item.sourceUrl;

    if (!item.id.startsWith(`${item.category}-`)) {
      issues.push({
        itemId: item.id,
        rule: "id-prefix",
        message: `id should start with category prefix '${item.category}-'.`
      });
    }

    if (item.sourceType !== "original-note" && !hasText(sourceUrl)) {
      issues.push({
        itemId: item.id,
        rule: "source-url-required",
        message: "sourceUrl is required when sourceType is not original-note."
      });
    }

    if (hasText(sourceUrl) && !isValidHttpsUrl(sourceUrl)) {
      issues.push({
        itemId: item.id,
        rule: "https-source-url",
        message: "sourceUrl must be a valid HTTPS URL."
      });
    }

    if (item.summary.trim().length < 10) {
      issues.push({
        itemId: item.id,
        rule: "summary-length",
        message: "summary must be at least 10 characters."
      });
    }

    if (hasDuplicateValues(item.tags)) {
      issues.push({
        itemId: item.id,
        rule: "unique-tags",
        message: "tags must not contain duplicate values."
      });
    }

    for (const tag of item.tags) {
      if (!isValidTag(tag)) {
        issues.push({
          itemId: item.id,
          rule: "tag-format",
          message: `tag '${tag}' must use lowercase letters, numbers, or hyphens.`
        });
      }
    }

    if (!item.tags.includes(item.category)) {
      issues.push({
        itemId: item.id,
        rule: "category-tag",
        message: "tags should include the item category."
      });
    }
  }

  return issues;
}
