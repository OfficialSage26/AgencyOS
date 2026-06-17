import { z } from "zod";

export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

// A small, currency-agnostic set covering the common cases. Stored as the ISO
// code; formatting happens at display time with Intl.NumberFormat.
export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const optionalDate = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? new Date(v) : undefined),
  z.date({ error: "Enter a valid date" }).optional(),
);

export const invoiceInputSchema = z.object({
  clientId: z.preprocess(emptyToUndefined, z.string().optional()),
  currency: z.enum(CURRENCIES).default("USD"),
  status: z.enum(INVOICE_STATUSES).default("DRAFT"),
  issuedAt: optionalDate,
  dueDate: optionalDate,
});
export type InvoiceInput = z.infer<typeof invoiceInputSchema>;

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(300, "Description is too long"),
  quantity: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : 1),
    z.number({ error: "Enter a valid quantity" }).positive("Must be greater than 0"),
  ),
  unitPrice: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : 0),
    z.number({ error: "Enter a valid price" }).nonnegative("Must be 0 or more"),
  ),
});
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const invoiceStatusSchema = z.object({ status: z.enum(INVOICE_STATUSES) });

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
