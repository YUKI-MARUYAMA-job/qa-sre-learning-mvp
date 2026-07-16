import { validateQuizPolicy } from "../application/validate-quiz-policy.ts";
import { validateQuizTaxonomy } from "../application/validate-quiz-taxonomy.ts";
import { QuizQuestionsSchema } from "../schemas/quiz-question.schema.ts";
import { SubjectTaxonomySchema } from "../schemas/subject-taxonomy.schema.ts";

type ExpectedBoolean = boolean | null;

type FixtureExpectation = {
  label: string;
  path: string;
  expected: {
    schemaSuccess: boolean;
    taxonomySuccess: ExpectedBoolean;
    policySuccess: ExpectedBoolean;
  };
};

type IssueSummary = {
  id: string;
  rule: string;
  message: string;
};

type FixtureCheckResult = {
  label: string;
  path: string;
  schemaSuccess: boolean;
  taxonomyIssueCount: number | null;
  policyIssueCount: number | null;
  schemaIssues: string[];
  taxonomyIssues: IssueSummary[];
  policyIssues: IssueSummary[];
  passed: boolean;
};

const args = new Set(process.argv.slice(2));
const verbose = args.has("--verbose");
const jsonOutput = args.has("--json");

const fixtureExpectations: FixtureExpectation[] = [
  {
    label: "schema-invalid",
    path: "data/fixtures/invalid-quiz-schema.json",
    expected: {
      schemaSuccess: false,
      taxonomySuccess: null,
      policySuccess: null
    }
  },
  {
    label: "taxonomy-invalid",
    path: "data/fixtures/invalid-quiz-taxonomy.json",
    expected: {
      schemaSuccess: true,
      taxonomySuccess: false,
      policySuccess: null
    }
  },
  {
    label: "policy-invalid",
    path: "data/fixtures/policy-invalid-quiz-questions.json",
    expected: {
      schemaSuccess: true,
      taxonomySuccess: true,
      policySuccess: false
    }
  }
];

const taxonomyJson = await Bun.file("data/raw/subject-taxonomy.json").json();
const taxonomyResult = SubjectTaxonomySchema.safeParse(taxonomyJson);

if (!taxonomyResult.success) {
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          passed: false,
          error: "Subject taxonomy schema validation failed.",
          issues: taxonomyResult.error.issues.map((issue) => ({
            path: issue.path.join(".") || "(root)",
            message: issue.message
          }))
        },
        null,
        2
      )
    );
  } else {
    console.error("FAIL taxonomy master: Subject taxonomy schema validation failed.");
    for (const issue of taxonomyResult.error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
  }

  process.exit(1);
}

const taxonomy = taxonomyResult.data;

function formatSchemaIssue(issue: { path: PropertyKey[]; message: string }): string {
  return `${issue.path.join(".") || "(root)"}: ${issue.message}`;
}

function didPassExpectation(
  result: Omit<FixtureCheckResult, "passed">,
  expectation: FixtureExpectation["expected"]
): boolean {
  if (result.schemaSuccess !== expectation.schemaSuccess) {
    return false;
  }

  if (expectation.taxonomySuccess !== null) {
    const taxonomySuccess = result.taxonomyIssueCount === 0;
    if (taxonomySuccess !== expectation.taxonomySuccess) {
      return false;
    }
  }

  if (expectation.policySuccess !== null) {
    const policySuccess = result.policyIssueCount === 0;
    if (policySuccess !== expectation.policySuccess) {
      return false;
    }
  }

  return true;
}

async function checkFixture(fixture: FixtureExpectation): Promise<FixtureCheckResult> {
  const json = await Bun.file(fixture.path).json();
  const schemaResult = QuizQuestionsSchema.safeParse(json);

  if (!schemaResult.success) {
    const baseResult = {
      label: fixture.label,
      path: fixture.path,
      schemaSuccess: false,
      taxonomyIssueCount: null,
      policyIssueCount: null,
      schemaIssues: schemaResult.error.issues.map(formatSchemaIssue),
      taxonomyIssues: [],
      policyIssues: []
    };

    return {
      ...baseResult,
      passed: didPassExpectation(baseResult, fixture.expected)
    };
  }

  const taxonomyIssues = validateQuizTaxonomy(schemaResult.data, taxonomy);
  const policyIssues = validateQuizPolicy(schemaResult.data);

  const baseResult = {
    label: fixture.label,
    path: fixture.path,
    schemaSuccess: true,
    taxonomyIssueCount: taxonomyIssues.length,
    policyIssueCount: policyIssues.length,
    schemaIssues: [],
    taxonomyIssues,
    policyIssues
  };

  return {
    ...baseResult,
    passed: didPassExpectation(baseResult, fixture.expected)
  };
}

const results = [];

for (const fixture of fixtureExpectations) {
  results.push(await checkFixture(fixture));
}

const allPassed = results.every((result) => result.passed);

if (jsonOutput) {
  console.log(
    JSON.stringify(
      {
        passed: allPassed,
        fixtures: results
      },
      null,
      2
    )
  );

  process.exit(allPassed ? 0 : 1);
}

console.log("Checking quiz fixtures by expected validation layer...");

for (const result of results) {
  const status = result.passed ? "PASS" : "FAIL";

  console.log(
    `${status} fixture: ${result.label} | schema=${result.schemaSuccess ? "pass" : "fail"} | taxonomyIssues=${result.taxonomyIssueCount ?? "n/a"} | policyIssues=${result.policyIssueCount ?? "n/a"} | path=${result.path}`
  );

  if (!result.passed || verbose) {
    if (result.schemaIssues.length > 0) {
      console.log("  schema issues:");
      for (const issue of result.schemaIssues) {
        console.log(`  - ${issue}`);
      }
    }

    if (result.taxonomyIssues.length > 0) {
      console.log("  taxonomy issues:");
      for (const issue of result.taxonomyIssues) {
        console.log(`  - [${issue.id}] ${issue.rule}: ${issue.message}`);
      }
    }

    if (result.policyIssues.length > 0) {
      console.log("  policy issues:");
      for (const issue of result.policyIssues) {
        console.log(`  - [${issue.id}] ${issue.rule}: ${issue.message}`);
      }
    }
  }
}

if (!allPassed) {
  console.error("\nQuiz fixture validation failed.");
  process.exit(1);
}

console.log("\nQuiz fixture validation passed.");
