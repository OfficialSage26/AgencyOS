"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/tenant/context";
import { forOrg } from "@/lib/tenant/scoped-db";
import { type ActionState, toFieldErrors } from "@/lib/forms";
import { leadInputSchema, moveLeadSchema } from "@/lib/validations/lead";

function readLeadForm(formData: FormData) {
  return {
    title: formData.get("title"),
    source: formData.get("source"),
    value: formData.get("value"),
    stage: formData.get("stage") ?? "NEW",
  };
}

export async function createLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = leadInputSchema.safeParse(readLeadForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const db = forOrg(tenant.organizationId);
  await db.lead.create({ data: { ...parsed.data, organizationId: tenant.organizationId } });

  revalidatePath("/dashboard/leads");
  return { ok: true };
}

export async function updateLead(
  leadId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = leadInputSchema.safeParse(readLeadForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const db = forOrg(tenant.organizationId);
  const result = await db.lead.updateMany({ where: { id: leadId }, data: parsed.data });
  if (result.count === 0) {
    return { ok: false, error: "Lead not found." };
  }

  revalidatePath("/dashboard/leads");
  return { ok: true };
}

export async function deleteLead(leadId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const db = forOrg(tenant.organizationId);
  const result = await db.lead.deleteMany({ where: { id: leadId } });
  if (result.count === 0) {
    return { ok: false, error: "Lead not found." };
  }
  revalidatePath("/dashboard/leads");
  return { ok: true };
}

/** Move a lead to a different pipeline stage (drag-and-drop). */
export async function moveLead(leadId: string, stage: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = moveLeadSchema.safeParse({ stage });
  if (!parsed.success) {
    return { ok: false, error: "Invalid stage." };
  }

  const db = forOrg(tenant.organizationId);
  const result = await db.lead.updateMany({
    where: { id: leadId },
    data: { stage: parsed.data.stage },
  });
  if (result.count === 0) {
    return { ok: false, error: "Lead not found." };
  }

  revalidatePath("/dashboard/leads");
  return { ok: true };
}
