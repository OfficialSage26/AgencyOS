import { z } from "zod";

export const PROJECT_STATUSES = ["PLANNING", "ACTIVE", "REVIEW", "COMPLETED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  REVIEW: "Review",
  COMPLETED: "Completed",
};

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  DONE: "Done",
};

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const optionalDate = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? new Date(v) : undefined),
  z.date({ error: "Enter a valid date" }).optional(),
);

const optionalNonNegativeNumber = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : undefined),
  z.number({ error: "Enter a valid number" }).nonnegative("Must be 0 or more").optional(),
);

export const projectInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(5000).optional()),
  clientId: z.preprocess(emptyToUndefined, z.string().optional()),
  status: z.enum(PROJECT_STATUSES).default("PLANNING"),
  progress: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : 0),
    z.number().int().min(0).max(100).default(0),
  ),
  deadline: optionalDate,
  budget: optionalNonNegativeNumber,
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  status: z.enum(TASK_STATUSES).default("TODO"),
  assignedTo: z.preprocess(emptyToUndefined, z.string().optional()),
  dueDate: optionalDate,
});
export type TaskInput = z.infer<typeof taskInputSchema>;

export const taskStatusSchema = z.object({ status: z.enum(TASK_STATUSES) });
