import { z } from "zod";
import { audienceSchema } from "@/lib/audience";

export const policyQuestionSchema = z.object({
  question: z.string().trim().min(8).max(500),
  options: z.array(z.string().trim().min(1).max(300)).length(3),
  correctIndex: z.number().int().min(0).max(2),
  explanation: z.string().trim().min(8).max(1000),
  sourceQuote: z.string().trim().min(8).max(500),
});
export const policyDraftSchema = z.object({
  briefing: z.string().trim().min(20).max(3000),
  questions: z.array(policyQuestionSchema).length(3),
});
export const policyLaunchSchema = policyDraftSchema.extend({
  requestId: z.string().uuid(),
  title: z.string().trim().min(4).max(120),
  version: z.string().trim().min(1).max(80),
  policyText: z.string().trim().min(80).max(24000),
  sourceName: z.string().max(200),
  recipients: z.array(z.string().uuid()).min(1).max(200),
  reviewed: z.literal(true),
  audience: audienceSchema.default({mode:"individuals",departmentKeys:[]}),
}).superRefine((data, ctx) => {
  data.questions.forEach((q, index) => {
    if (!data.policyText.includes(q.sourceQuote)) ctx.addIssue({ code: "custom", path: ["questions", index, "sourceQuote"], message: "Each supporting quotation must appear exactly in the reviewed policy text." });
    if (new Set(q.options.map(option => option.trim().toLowerCase())).size !== 3) ctx.addIssue({ code: "custom", path: ["questions", index, "options"], message: "Use three distinct answer choices." });
  });
});
export type PolicyDraft = z.infer<typeof policyDraftSchema>;
export type PolicyQuestion = z.infer<typeof policyQuestionSchema>;
