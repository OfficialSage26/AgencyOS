"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { requireTenant } from "@/lib/tenant/context";
import { forOrg } from "@/lib/tenant/scoped-db";
import { clientInputSchema, noteInputSchema } from "@/lib/validations/client";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false };

function toFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function readClientForm(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    notes: formData.get("notes"),
    status: formData.get("status") ?? "ACTIVE",
  };
}

export async function createClient(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = clientInputSchema.safeParse(readClientForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const db = forOrg(tenant.organizationId);
  const client = await db.client.create({
    data: { ...parsed.data, organizationId: tenant.organizationId },
  });
  await db.activity.create({
    data: {
      organizationId: tenant.organizationId,
      clientId: client.id,
      userId: tenant.userId,
      type: "STATUS_CHANGE",
      description: `Created client “${client.name}”`,
    },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateClient(
  clientId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = clientInputSchema.safeParse(readClientForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const db = forOrg(tenant.organizationId);
  const result = await db.client.updateMany({ where: { id: clientId }, data: parsed.data });
  if (result.count === 0) {
    return { ok: false, error: "Client not found." };
  }

  await db.activity.create({
    data: {
      organizationId: tenant.organizationId,
      clientId,
      userId: tenant.userId,
      type: "STATUS_CHANGE",
      description: `Updated client details`,
    },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { ok: true };
}

export async function deleteClient(clientId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const db = forOrg(tenant.organizationId);
  const result = await db.client.deleteMany({ where: { id: clientId } });
  if (result.count === 0) {
    return { ok: false, error: "Client not found." };
  }
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function addClientNote(
  clientId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = noteInputSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const db = forOrg(tenant.organizationId);
  // Confirm the client belongs to this organization before logging against it.
  const client = await db.client.findFirst({ where: { id: clientId }, select: { id: true } });
  if (!client) {
    return { ok: false, error: "Client not found." };
  }

  await db.activity.create({
    data: {
      organizationId: tenant.organizationId,
      clientId,
      userId: tenant.userId,
      type: "NOTE",
      description: parsed.data.content,
    },
  });

  revalidatePath(`/dashboard/clients/${clientId}`);
  return { ok: true };
}
