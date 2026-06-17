"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/tenant/context";
import { forOrg } from "@/lib/tenant/scoped-db";
import { type ActionState, toFieldErrors } from "@/lib/forms";
import { appointmentInputSchema } from "@/lib/validations/appointment";

function readForm(formData: FormData) {
  return {
    title: formData.get("title"),
    clientId: formData.get("clientId"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    notes: formData.get("notes"),
  };
}

export async function createAppointment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = appointmentInputSchema.safeParse(readForm(formData));
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

  await orgDb.appointment.create({
    data: { ...parsed.data, organizationId: tenant.organizationId },
  });
  revalidatePath("/dashboard/appointments");
  return { ok: true };
}

export async function updateAppointment(
  appointmentId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = appointmentInputSchema.safeParse(readForm(formData));
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

  const result = await orgDb.appointment.updateMany({
    where: { id: appointmentId },
    data: parsed.data,
  });
  if (result.count === 0) return { ok: false, error: "Appointment not found." };

  revalidatePath("/dashboard/appointments");
  return { ok: true };
}

export async function deleteAppointment(appointmentId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const orgDb = forOrg(tenant.organizationId);
  const result = await orgDb.appointment.deleteMany({ where: { id: appointmentId } });
  if (result.count === 0) return { ok: false, error: "Appointment not found." };
  revalidatePath("/dashboard/appointments");
  return { ok: true };
}
