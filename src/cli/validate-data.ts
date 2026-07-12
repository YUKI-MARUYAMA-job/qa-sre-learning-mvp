import { LearningItemsSchema } from "../schemas/learning-item.schema";
import { readJsonFile } from "../infrastructure/read-json";

const target = "data/raw/learning-items.json";

try {
  const json = await readJsonFile(target);
  const result = LearningItemsSchema.safeParse(json);

  if (!result.success) {
    console.error("Data validation failed.");
    console.error(result.error.format());
    process.exit(1);
  }

  console.log(`Data validation passed: ${target}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
