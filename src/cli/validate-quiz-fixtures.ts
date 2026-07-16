import { validateQuizPolicy } from "../application/validate-quiz-policy.ts";
import { validateQuizTaxonomy } from "../application/validate-quiz-taxonomy.ts";
import { QuizQuestionsSchema } from "../schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../schemas/subject-taxonomy.schema.ts";

const FIXTURE_PATHS = {
  schemaInvalid: "data/fixtures/invalid-quiz-schema.json",
  taxonomyInvalid: "data/fixtures/invalid-quiz-taxonomy.json",
  policyInvalid: "data/fixtures/policy-invalid-quiz-questions.json",
  taxonomy: "data/raw/subject-taxonomy.json"
} as const;

type ValidationIssue = {
  id: string;
  rule: string;
  message: string;
};

function fail(message: string): never {
  console.error(`Fixture validation failed: ${message}`);
  process.exit(1);
}

function printIssues(label: string, issues: ValidationIssue[]): void {
  if (issues.length === 0) {
    console.log(`${label}: none`);
    return;
  }

  console.log(`${label}:`);
  for (const issue of issues) {
    console.log(`- [${issue.id}] ${issue.rule}: ${issue.message}`);
  }
}

function printSchemaIssues(
  label: string,
  issues: Array<{ path: PropertyKey[]; message: string }>
): void {
  console.log(label);
  for (const issue of issues) {
    console.log(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
}

async function readJson(path: string): Promise<unknown> {
  try {
    return await Bun.file(path).json();
  } catch (error) {
    fail(`Could not read JSON file: ${path}\n${String(error)}`);
  }
}

async function main(): Promise<void> {
  const taxonomyJson = await readJson(FIXTURE_PATHS.taxonomy);
  const taxonomyResult = SubjectTaxonomySchema.safeParse(taxonomyJson);

  if (!taxonomyResult.success) {
    printSchemaIssues("Subject taxonomy schema issues:", taxonomyResult.error.issues);
    fail("subject taxonomy master must be schema-valid before fixture validation.");
  }

  const taxonomy = taxonomyResult.data;

  console.log("Checking quiz fixtures by expected validation layer...");

  // 1. invalid-quiz-schema.json
  // Expected:
  //   schema: fail
  {
    const json = await readJson(FIXTURE_PATHS.schemaInvalid);
    const result = QuizQuestionsSchema.safeParse(json);

    if (result.success) {
      fail(
        `${FIXTURE_PATHS.schemaInvalid} was expected to fail Zod schema validation, but it passed.`
      );
    }

    console.log(`PASS: ${FIXTURE_PATHS.schemaInvalid} fails Zod schema validation as expected.`);
  }

  // 2. invalid-quiz-taxonomy.json
  // Expected:
  //   schema: pass
  //   taxonomy: fail
  {
    const json = await readJson(FIXTURE_PATHS.taxonomyInvalid);
    const result = QuizQuestionsSchema.safeParse(json);

    if (!result.success) {
      printSchemaIssues("Schema issues:", result.error.issues);
      fail(
        `${FIXTURE_PATHS.taxonomyInvalid} must pass Zod schema validation and fail taxonomy validation.`
      );
    }

    const taxonomyIssues = validateQuizTaxonomy(result.data, taxonomy);

    if (taxonomyIssues.length === 0) {
      fail(
        `${FIXTURE_PATHS.taxonomyInvalid} was expected to fail taxonomy validation, but no taxonomy issues were found.`
      );
    }

    console.log(`PASS: ${FIXTURE_PATHS.taxonomyInvalid} passes Zod schema validation.`);
    printIssues("Expected taxonomy issues", taxonomyIssues);
  }

  // 3. policy-invalid-quiz-questions.json
  // Expected:
  //   schema: pass
  //   taxonomy: pass
  //   policy: fail
  {
    const json = await readJson(FIXTURE_PATHS.policyInvalid);
    const result = QuizQuestionsSchema.safeParse(json);

    if (!result.success) {
      printSchemaIssues("Schema issues:", result.error.issues);
      fail(
        `${FIXTURE_PATHS.policyInvalid} must pass Zod schema validation and fail policy validation.`
      );
    }

    const taxonomyIssues = validateQuizTaxonomy(result.data, taxonomy);

    if (taxonomyIssues.length > 0) {
      printIssues("Unexpected taxonomy issues", taxonomyIssues);
      fail(
        `${FIXTURE_PATHS.policyInvalid} must pass taxonomy validation before policy validation is tested.`
      );
    }

    const policyIssues = validateQuizPolicy(result.data);

    if (policyIssues.length === 0) {
      fail(
        `${FIXTURE_PATHS.policyInvalid} was expected to fail quiz policy validation, but no policy issues were found.`
      );
    }

    console.log(`PASS: ${FIXTURE_PATHS.policyInvalid} passes Zod schema and taxonomy validation.`);
    printIssues("Expected policy issues", policyIssues);
  }

  console.log("Quiz fixture validation passed.");
}

await main();
