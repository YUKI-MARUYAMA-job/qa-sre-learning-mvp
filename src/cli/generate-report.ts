import { validateSourcePolicy } from "../application/validate-source-policy";
import { buildQualityReport } from "../application/build-quality-report";
import { readJsonFile } from "../infrastructure/read-json";
import { LearningItemsSchema } from "../schemas/learning-item.schema";

const target = "data/raw/learning-items.json";
const output = "reports/quality-report.md";

try {
  const json = await readJsonFile(target);
  const items = LearningItemsSchema.parse(json);
  const policyIssues = validateSourcePolicy(items);
  const report = buildQualityReport(items, policyIssues);

  await Bun.write(output, report);

  console.log(`Quality report generated: ${output}`);

  if (policyIssues.length > 0) {
    console.error("Quality report contains source policy issues.");

    for (const issue of policyIssues) {
      console.error(`- [${issue.rule}] ${issue.itemId}: ${issue.message}`);
    }

    process.exit(1);
  }
} catch (error) {
  console.error(error);
  process.exit(1);
}
