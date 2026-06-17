import { z } from "zod";

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

// datetime-local inputs arrive as "YYYY-MM-DDTHH:mm" (local time).
const dateTime = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? new Date(v) : undefined),
  z.date({ error: "Enter a valid date and time" }),
);

export const appointmentInputSchema = z
  .object({
    title: z.preprocess(emptyToUndefined, z.string().trim().max(200, "Title is too long").optional()),
    clientId: z.preprocess(emptyToUndefined, z.string().optional()),
    startTime: dateTime,
    endTime: dateTime,
    notes: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after the start time",
    path: ["endTime"],
  });
export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
