import type { QuizQuestion } from "../schemas/quiz-question.schema.ts";

export type QuizPolicyIssue = {
  id: string;
  rule: string;
  message: string;
};

const officialMisrepresentationPattern =
  /official\s+(certification|exam|training|course|question|problem|guide)|certification\s+exam|official\s+practice|認定試験対策|公式問題集|公式問題|公式教材|実問再現|本試験再現|公認|提携|認定講座/i;

const cloudflareOfficialClaimPattern =
  /Cloudflare\s+(official|certified|certification|exam|training|course|question|problem)|Cloudflare公式|Cloudflare認定|Cloudflare公認|Cloudflare提携|Cloudflare公式問題集|Cloudflare認定試験/i;

export function validateQuizPolicy(questions: QuizQuestion[]): QuizPolicyIssue[] {
  const issues: QuizPolicyIssue[] = [];

  for (const question of questions) {
    const sourceUrl = question.source.url;
    const publisher = question.source.publisher;
    const searchableText = [
      question.id,
      question.question,
      ...Object.values(question.options),
      question.explanation,
      question.source.title,
      question.source.publisher,
      question.legal.attribution,
      ...question.tags
    ].join(" ");

    if (!sourceUrl.startsWith("https://")) {
      issues.push({
        id: question.id,
        rule: "https-source-url",
        message: "source.url must use HTTPS."
      });
    }

    if (question.review.status !== "reviewed") {
      issues.push({
        id: question.id,
        rule: "review-required",
        message: "production quiz data must be reviewed."
      });
    }

    if (question.review.status === "reviewed" && question.review.reviewed_at === null) {
      issues.push({
        id: question.id,
        rule: "review-date-required",
        message: "reviewed quiz data must include reviewed_at."
      });
    }

    if (question.legal.is_copied_verbatim) {
      issues.push({
        id: question.id,
        rule: "no-verbatim-copy",
        message: "quiz data must not be copied verbatim."
      });
    }

    if (question.legal.is_official_question_reproduction && question.legal.is_modified_or_original) {
      issues.push({
        id: question.id,
        rule: "official-reproduction-conflict",
        message: "official reproduction cannot also be marked as modified or original."
      });
    }

    if (question.legal.is_official_certification_claim) {
      issues.push({
        id: question.id,
        rule: "no-official-certification-claim",
        message: "quiz data must not claim official certification, official exam, or official training status."
      });
    }

    if (question.legal.is_affiliation_or_endorsement_claim) {
      issues.push({
        id: question.id,
        rule: "no-affiliation-endorsement-claim",
        message: "quiz data must not imply affiliation, endorsement, sponsorship, or support."
      });
    }

    if (officialMisrepresentationPattern.test(searchableText)) {
      issues.push({
        id: question.id,
        rule: "official-misrepresentation-text",
        message: "quiz text may imply official, certified, endorsed, or exam-reproduction status."
      });
    }

    if (publisher.toLowerCase().includes("cloudflare")) {
      if (cloudflareOfficialClaimPattern.test(searchableText)) {
        issues.push({
          id: question.id,
          rule: "cloudflare-official-misrepresentation",
          message: "Cloudflare-inspired quiz data must not imply official Cloudflare certification, official exam, endorsement, or partnership."
        });
      }

      if (!question.legal.attribution.toLowerCase().includes("cloudflare")) {
        issues.push({
          id: question.id,
          rule: "cloudflare-attribution-required",
          message: "Cloudflare-inspired quiz data requires Cloudflare attribution."
        });
      }
    }

    if (publisher.toLowerCase().includes("ipa")) {
      if (!question.legal.attribution.toLowerCase().includes("ipa")) {
        issues.push({
          id: question.id,
          rule: "ipa-attribution-required",
          message: "IPA-inspired quiz data requires IPA attribution."
        });
      }

      if (question.legal.is_official_question_reproduction) {
        issues.push({
          id: question.id,
          rule: "no-official-question-reproduction",
          message: "this MVP should use modified or original IPA-inspired questions, not official question reproduction."
        });
      }
    }
  }

  return issues;
}
