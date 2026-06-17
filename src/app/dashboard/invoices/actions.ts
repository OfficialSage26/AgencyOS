"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTenant } from "@/lib/tenant/context";
import { forOrg, type ScopedDb } from "@/lib/tenant/scoped-db";
import { type ActionState, toFieldErrors } from "@/lib/forms";
import {
  invoiceInputSchema,
  invoiceItemSchema,
  invoiceStatusSchema,
} from "@/lib/validations/invoice";

// InvoiceItem has no organizationId; it is scoped through its parent Invoice.
// Always confirm the invoice belongs to the active org via the org-scoped
// client before reading or writing its line items.
async function ownsInvoice(orgDb: ScopedDb, invoiceId: string) {
  const invoice = await orgDb.invoice.findFirst({
    where: { id: invoiceId },
    select: { id: true },
  });
  return Boolean(invoice);
}

// Recompute and persist the invoice total from its line items. Runs after any
// item mutation. Invoice ownership must already be verified by the caller.
async function recalcInvoiceTotal(invoiceId: string) {
  const items = await db.invoiceItem.findMany({
    where: { invoiceId },
    select: { quantity: true, unitPrice: true },
  });
  const amount = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0,
  );
  await db.invoice.update({ where: { id: invoiceId }, data: { amount } });
}

// Generate the next sequential invoice number for the org (INV-0001, …),
// skipping any numbers already taken (e.g. after deletions).
async function nextInvoiceNumber(orgDb: ScopedDb): Promise<string> {
  const existing = await orgDb.invoice.findMany({ select: { number: true } });
  const taken = new Set(existing.map((i) => i.number));
  let n = existing.length + 1;
  let candidate = `INV-${String(n).padStart(4, "0")}`;
  while (taken.has(candidate)) {
    n += 1;
    candidate = `INV-${String(n).padStart(4, "0")}`;
  }
  return candidate;
}

function readInvoiceForm(formData: FormData) {
  return {
    clientId: formData.get("clientId"),
    currency: formData.get("currency") ?? "USD",
    status: formData.get("status") ?? "DRAFT",
    issuedAt: formData.get("issuedAt"),
    dueDate: formData.get("dueDate"),
  };
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export async function createInvoice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = invoiceInputSchema.safeParse(readInvoiceForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const orgDb = forOrg(tenant.organizationId);
  if (parsed.data.clientId) {
    const client = await orgDb.client.findFirst({
      where: { id: parsed.data.clientId },
      select: { id: true },
    });
    if (!client) return { ok: false, error: "Selected client not found." };
  }

  const number = await nextInvoiceNumber(orgDb);
  const invoice = await orgDb.invoice.create({
    data: { ...parsed.data, number, organizationId: tenant.organizationId },
  });
  revalidatePath("/dashboard/invoices");
  return { ok: true, redirectTo: `/dashboard/invoices/${invoice.id}` };
}

export async function updateInvoice(
  invoiceId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = invoiceInputSchema.safeParse(readInvoiceForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const orgDb = forOrg(tenant.organizationId);
  if (parsed.data.clientId) {
    const client = await orgDb.client.findFirst({
      where: { id: parsed.data.clientId },
      select: { id: true },
    });
    if (!client) return { ok: false, error: "Selected client not found." };
  }

  const result = await orgDb.invoice.updateMany({ where: { id: invoiceId }, data: parsed.data });
  if (result.count === 0) return { ok: false, error: "Invoice not found." };

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { ok: true };
}

export async function deleteInvoice(invoiceId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const orgDb = forOrg(tenant.organizationId);
  const result = await orgDb.invoice.deleteMany({ where: { id: invoiceId } });
  if (result.count === 0) return { ok: false, error: "Invoice not found." };
  revalidatePath("/dashboard/invoices");
  return { ok: true };
}

export async function setInvoiceStatus(invoiceId: string, status: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = invoiceStatusSchema.safeParse({ status });
  if (!parsed.success) return { ok: false, error: "Invalid status." };

  const orgDb = forOrg(tenant.organizationId);
  const invoice = await orgDb.invoice.findFirst({
    where: { id: invoiceId },
    select: { issuedAt: true },
  });
  if (!invoice) return { ok: false, error: "Invoice not found." };

  // Stamp the issue date the first time an invoice leaves Draft.
  const data: { status: typeof parsed.data.status; issuedAt?: Date } = {
    status: parsed.data.status,
  };
  if (parsed.data.status !== "DRAFT" && !invoice.issuedAt) data.issuedAt = new Date();

  await orgDb.invoice.updateMany({ where: { id: invoiceId }, data });
  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Line items
// ---------------------------------------------------------------------------

export async function addInvoiceItem(
  invoiceId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = invoiceItemSchema.safeParse({
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const orgDb = forOrg(tenant.organizationId);
  if (!(await ownsInvoice(orgDb, invoiceId))) return { ok: false, error: "Invoice not found." };

  await db.invoiceItem.create({ data: { ...parsed.data, invoiceId } });
  await recalcInvoiceTotal(invoiceId);
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { ok: true };
}

export async function deleteInvoiceItem(invoiceId: string, itemId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const orgDb = forOrg(tenant.organizationId);
  if (!(await ownsInvoice(orgDb, invoiceId))) return { ok: false, error: "Invoice not found." };

  const result = await db.invoiceItem.deleteMany({ where: { id: itemId, invoiceId } });
  if (result.count === 0) return { ok: false, error: "Line item not found." };

  await recalcInvoiceTotal(invoiceId);
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { ok: true };
}
