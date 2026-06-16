import { z } from "zod";

export const LEAD_STAGES = [
  "NEW",
  "CONTACTED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const leadInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  source: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  value: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : undefined),
    z.number({ error: "Enter a valid number" }).nonnegative("Must be 0 or more").optional(),
  ),
  stage: z.enum(LEAD_STAGES).default("NEW"),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export const moveLeadSchema = z.object({
  stage: z.enum(LEAD_STAGES),
});
