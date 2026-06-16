import { z } from "zod";

export const CLIENT_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
  email: z.preprocess(emptyToUndefined, z.email("Enter a valid email").optional()),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(50).optional()),
  company: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(5000).optional()),
  status: z.enum(CLIENT_STATUSES).default("ACTIVE"),
});

export type ClientInput = z.infer<typeof clientInputSchema>;

export const noteInputSchema = z.object({
  content: z.string().trim().min(1, "Note cannot be empty").max(5000, "Note is too long"),
});
