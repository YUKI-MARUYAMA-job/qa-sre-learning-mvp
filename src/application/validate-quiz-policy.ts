import type { QuizQuestion } from "../schemas/quiz-question.schema.ts";

export type QuizPolicyRule =
  | "internal-source-required"
  | "source-publisher-internal"
  | "project-scope-only"
  | "review-required"
  | "review-date-required"
  | "no-verbatim-copy"
  | "no-official-question-reproduction"
  | "no-official-certification-claim"
  | "no-affiliation-endorsement-claim"
  | "no-external-exam-claim"
  | "official-misrepresentation-text"
  | "no-secret-like-text";

export type QuizPolicyIssue = {
  id: string;
  rule: QuizPolicyRule;
  message: string;
};

const allowedInternalSourcePathPrefixes = [
  "README.md",
  "docs/",
  "reports/",
  "src/",
  "tests/",
  "e2e/",
  ".github/workflows/",
  "data/raw/",
  "public/study-it/",
  "package.json",
  "tsconfig.json",
  "playwright.config.ts",
  "vite.config.ts"
];

const projectScopeKeywords = [
  "qa-sre-learning-mvp",
  "portfolio",
  "ポートフォリオ",
  "README",
  "docs",
  "reports",
  "quality gate",
  "品質ゲート",
  "Bun",
  "TypeScript",
  "Vite",
  "React",
  "Zod",
  "Playwright",
  "GitHub Actions",
  "Cloudflare Pages",
  "schema validation",
  "taxonomy validation",
  "policy validation",
  "public safety",
  "CI",
  "E2E",
  "データ検証",
  "公開用JSON",
  "受け入れ基準",
  "project_overview",
  "data_quality_pipeline",
  "schema_taxonomy_validation",
  "policy_validation",
  "quality_gate_ci",
  "frontend_quiz_ui",
  "deployment_cloudflare_pages",
  "documentation_workflow",
  "git_workflow"
];

const externalExamClaimPattern =
  /(?:official\s+(?:certification|exam|training|course|question|problem|guide)|certification\s+exam|official\s+practice|past\s+exam|exam\s+prep|認定試験対策|公式問題集|公式問題|公式教材|実問再現|本試験再現|過去問再現|公認教材|認定講座)/i;

const officialMisrepresentationPattern =
  /(?:公認|提携|後援|承認済み|公式認定|公式教材|officially\s+endorsed|officially\s+approved|affiliated\s+with|endorsed\s+by|sponsored\s+by)/i;

const secretLikePattern =
  /(?:api[_-]?key|access[_-]?token|secret|password|passwd|private[_-]?key|client[_-]?secret|BEGIN\s+(?:RSA|OPENSSH|PRIVATE)\s+KEY)/i;

function addIssue(
  issues: QuizPolicyIssue[],
  question: QuizQuestion,
  rule: QuizPolicyRule,
  message: string
): void {
  issues.push({
    id: question.id,
    rule,
    message
  });
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function isExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasAllowedInternalSourcePath(sourcePath: string): boolean {
  if (isExternalUrl(sourcePath)) {
    return false;
  }

  return allowedInternalSourcePathPrefixes.some((prefix) => {
    return sourcePath === prefix || sourcePath.startsWith(prefix);
  });
}

function buildSearchableText(question: QuizQuestion): string {
  return [
    question.id,
    question.track,
    question.category,
    question.sub_category,
    question.sub_sub_category,
    question.sub_sub_sub_category ?? "",
    question.question,
    ...Object.values(question.options),
    question.explanation,
    question.source.title,
    question.source.url,
    question.source.publisher,
    question.legal.attribution,
    ...question.tags
  ].join(" ");
}

function buildPolicyClaimText(question: QuizQuestion): string {
  return [
    question.id,
    question.source.title,
    question.source.url,
    question.source.publisher,
    question.legal.attribution,
    ...question.tags
  ].join(" ");
}

function isProjectScoped(question: QuizQuestion): boolean {
  const searchableText = buildSearchableText(question);
  const normalized = normalizeText(searchableText);

  return projectScopeKeywords.some((keyword) => {
    return normalized.includes(keyword.toLowerCase());
  });
}

export function validateQuizPolicy(questions: QuizQuestion[]): QuizPolicyIssue[] {
  const issues: QuizPolicyIssue[] = [];

  for (const question of questions) {
    const searchableText = buildSearchableText(question);
    const policyClaimText = buildPolicyClaimText(question);
    const normalizedPublisher = normalizeText(question.source.publisher);

    if (!hasAllowedInternalSourcePath(question.source.url)) {
      addIssue(
        issues,
        question,
        "internal-source-required",
        "quiz data must reference an internal repository path as its source."
      );
    }

    if (normalizedPublisher !== "qa-sre-learning-mvp") {
      addIssue(
        issues,
        question,
        "source-publisher-internal",
        "quiz source.publisher must be qa-sre-learning-mvp for internal portfolio quiz data."
      );
    }

    if (!isProjectScoped(question)) {
      addIssue(
        issues,
        question,
        "project-scope-only",
        "quiz data should focus on this portfolio's architecture, data validation, quality gate, UI, deployment, documentation, or Git workflow."
      );
    }

    if (question.review.status !== "reviewed") {
      addIssue(
        issues,
        question,
        "review-required",
        "production quiz data must be reviewed."
      );
    }

    if (question.review.status === "reviewed" && question.review.reviewed_at === null) {
      addIssue(
        issues,
        question,
        "review-date-required",
        "reviewed quiz data must include reviewed_at."
      );
    }

    if (question.legal.is_copied_verbatim) {
      addIssue(
        issues,
        question,
        "no-verbatim-copy",
        "quiz data must not be copied verbatim from third-party materials."
      );
    }

    if (question.legal.is_official_question_reproduction) {
      addIssue(
        issues,
        question,
        "no-official-question-reproduction",
        "this MVP must not use external official exam or official question reproduction."
      );
    }

    if (question.legal.is_official_certification_claim) {
      addIssue(
        issues,
        question,
        "no-official-certification-claim",
        "quiz data must not claim official certification, official exam, or official training status."
      );
    }

    if (question.legal.is_affiliation_or_endorsement_claim) {
      addIssue(
        issues,
        question,
        "no-affiliation-endorsement-claim",
        "quiz data must not imply affiliation, endorsement, sponsorship, approval, or support by a third party."
      );
    }

    if (externalExamClaimPattern.test(policyClaimText)) {
      addIssue(
        issues,
        question,
        "no-external-exam-claim",
        "quiz metadata must not imply external exam preparation, official question reproduction, or past-exam reproduction."
      );
    }

    if (officialMisrepresentationPattern.test(policyClaimText)) {
      addIssue(
        issues,
        question,
        "official-misrepresentation-text",
        "quiz metadata must not imply official certification, endorsement, affiliation, approval, or sponsorship."
      );
    }

    if (secretLikePattern.test(searchableText)) {
      addIssue(
        issues,
        question,
        "no-secret-like-text",
        "quiz data must not contain secret-like values such as tokens, passwords, client secrets, or private keys."
      );
    }
  }

  return issues;
}
