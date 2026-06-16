"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTenant } from "@/lib/tenant/context";
import { forOrg, type ScopedDb } from "@/lib/tenant/scoped-db";
import { type ActionState, toFieldErrors } from "@/lib/forms";
import { projectInputSchema, taskInputSchema, taskStatusSchema } from "@/lib/validations/project";

// Task and ProjectMember have no organizationId; they are scoped through their
// parent Project. Always confirm the project belongs to the active org via the
// org-scoped client before touching its tasks or members.
async function ownsProject(orgDb: ScopedDb, projectId: string) {
  const project = await orgDb.project.findFirst({ where: { id: projectId }, select: { id: true } });
  return Boolean(project);
}

async function isOrgMember(orgDb: ScopedDb, userId: string) {
  const membership = await orgDb.membership.findFirst({
    where: { userId },
    select: { id: true },
  });
  return Boolean(membership);
}

function readProjectForm(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
    status: formData.get("status") ?? "PLANNING",
    progress: formData.get("progress") ?? "0",
    deadline: formData.get("deadline"),
    budget: formData.get("budget"),
  };
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = projectInputSchema.safeParse(readProjectForm(formData));
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

  await orgDb.project.create({ data: { ...parsed.data, organizationId: tenant.organizationId } });
  revalidatePath("/dashboard/projects");
  return { ok: true };
}

export async function updateProject(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = projectInputSchema.safeParse(readProjectForm(formData));
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

  const result = await orgDb.project.updateMany({ where: { id: projectId }, data: parsed.data });
  if (result.count === 0) return { ok: false, error: "Project not found." };

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}

export async function deleteProject(projectId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const orgDb = forOrg(tenant.organizationId);
  const result = await orgDb.project.deleteMany({ where: { id: projectId } });
  if (result.count === 0) return { ok: false, error: "Project not found." };
  revalidatePath("/dashboard/projects");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function createTask(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = taskInputSchema.safeParse({
    title: formData.get("title"),
    status: formData.get("status") ?? "TODO",
    assignedTo: formData.get("assignedTo"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const orgDb = forOrg(tenant.organizationId);
  if (!(await ownsProject(orgDb, projectId))) return { ok: false, error: "Project not found." };
  if (parsed.data.assignedTo && !(await isOrgMember(orgDb, parsed.data.assignedTo))) {
    return { ok: false, error: "Assignee is not a member of this organization." };
  }

  await db.task.create({ data: { ...parsed.data, projectId } });
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}

export async function setTaskStatus(
  projectId: string,
  taskId: string,
  status: string,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = taskStatusSchema.safeParse({ status });
  if (!parsed.success) return { ok: false, error: "Invalid status." };

  const orgDb = forOrg(tenant.organizationId);
  if (!(await ownsProject(orgDb, projectId))) return { ok: false, error: "Project not found." };

  const result = await db.task.updateMany({
    where: { id: taskId, projectId },
    data: { status: parsed.data.status },
  });
  if (result.count === 0) return { ok: false, error: "Task not found." };

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}

export async function deleteTask(projectId: string, taskId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const orgDb = forOrg(tenant.organizationId);
  if (!(await ownsProject(orgDb, projectId))) return { ok: false, error: "Project not found." };

  const result = await db.task.deleteMany({ where: { id: taskId, projectId } });
  if (result.count === 0) return { ok: false, error: "Task not found." };

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------

export async function addProjectMember(projectId: string, userId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const orgDb = forOrg(tenant.organizationId);
  if (!(await ownsProject(orgDb, projectId))) return { ok: false, error: "Project not found." };
  if (!(await isOrgMember(orgDb, userId))) {
    return { ok: false, error: "User is not a member of this organization." };
  }

  await db.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    create: { projectId, userId },
    update: {},
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}

export async function removeProjectMember(projectId: string, userId: string): Promise<ActionState> {
  const tenant = await requireTenant();
  const orgDb = forOrg(tenant.organizationId);
  if (!(await ownsProject(orgDb, projectId))) return { ok: false, error: "Project not found." };

  await db.projectMember.deleteMany({ where: { projectId, userId } });
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}
