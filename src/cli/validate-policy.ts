import { validateSourcePolicy } from "../application/validate-source-policy";
import { readJsonFile } from "../infrastructure/read-json";
import { LearningItemsSchema } from "../schemas/learning-item.schema";

const target = "data/raw/learning-items.json";

try {
  const json = await readJsonFile(target);
  const items = LearningItemsSchema.parse(json);
  const issues = validateSourcePolicy(items);

  if (issues.length > 0) {
    console.error("Source policy validation failed.");

    for (const issue of issues) {
      console.error(`- [${issue.rule}] ${issue.itemId}: ${issue.message}`);
    }

    process.exit(1);
  }

  console.log("Source policy validation passed.");
} catch (error) {
  console.error(error);
  process.exit(1);
}
