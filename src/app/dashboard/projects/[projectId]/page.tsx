import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantDb } from "@/lib/tenant/context";
import {
  ProjectFormDialog,
  type ProjectFormValues,
} from "@/components/projects/project-form-dialog";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { TaskList, type MemberOption, type TaskItem } from "@/components/projects/task-list";
import { ProjectMembers } from "@/components/projects/project-members";
import { ProjectFiles, type ProjectFileItem } from "@/components/projects/project-files";
import {
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
  type TaskStatus,
} from "@/lib/validations/project";

const statusBadge: Record<ProjectStatus, string> = {
  PLANNING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};

const displayName = (user: { name: string | null; email: string }) => user.name ?? user.email;

function mimeHint(fileName: string): ProjectFileItem["mimeHint"] {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (ext === "zip") return "zip";
  return "other";
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { db } = await requireTenantDb();

  const project = await db.project.findFirst({
    where: { id: projectId },
    include: {
      client: { select: { name: true } },
      tasks: {
        orderBy: { createdAt: "asc" },
        include: { assignee: { select: { name: true, email: true } } },
      },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      files: {
        orderBy: { createdAt: "desc" },
        include: { uploader: { select: { name: true, email: true } } },
      },
    },
  });
  if (!project) notFound();

  const [clients, orgMemberships] = await Promise.all([
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.membership.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const formValues: ProjectFormValues = {
    id: project.id,
    title: project.title,
    description: project.description,
    clientId: project.clientId,
    status: project.status,
    progress: project.progress,
    deadline: project.deadline ? project.deadline.toISOString().slice(0, 10) : null,
    budget: project.budget != null ? Number(project.budget) : null,
  };

  const tasks: TaskItem[] = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status as TaskStatus,
    dueDate: task.dueDate ? task.dueDate.toLocaleDateString() : null,
    assigneeName: task.assignee ? displayName(task.assignee) : null,
  }));

  const allMembers: MemberOption[] = orgMemberships.map((m) => ({
    userId: m.user.id,
    name: displayName(m.user),
  }));
  const projectMembers: MemberOption[] = project.members.map((m) => ({
    userId: m.user.id,
    name: displayName(m.user),
  }));
  const memberIds = new Set(projectMembers.map((m) => m.userId));
  const availableMembers = allMembers.filter((m) => !memberIds.has(m.userId));

  const files: ProjectFileItem[] = project.files.map((f) => ({
    id: f.id,
    fileName: f.fileName,
    fileUrl: f.fileUrl,
    sizeBytes: f.sizeBytes,
    uploaderName: f.uploader ? displayName(f.uploader) : null,
    createdAt: f.createdAt.toLocaleDateString(),
    mimeHint: mimeHint(f.fileName),
  }));

  return (
    <>
      <DashboardHeader title={project.title} />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" render={<Link href="/dashboard/projects" />}>
            <ArrowLeft className="size-4" />
            Back to projects
          </Button>
          <div className="flex items-center gap-2">
            <ProjectFormDialog
              mode="edit"
              project={formValues}
              clients={clients}
              triggerVariant="outline"
              triggerSize="sm"
              triggerChildren={
                <>
                  <Pencil className="size-4" />
                  Edit
                </>
              }
            />
            <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Details</CardTitle>
                  <Badge variant="secondary" className={statusBadge[project.status]}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                    />
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-y-2">
                  <dt className="text-muted-foreground">Client</dt>
                  <dd className="text-right">{project.client?.name ?? "—"}</dd>
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd className="text-right">
                    {project.budget != null ? `$${Number(project.budget).toLocaleString()}` : "—"}
                  </dd>
                  <dt className="text-muted-foreground">Deadline</dt>
                  <dd className="text-right">
                    {project.deadline ? project.deadline.toLocaleDateString() : "—"}
                  </dd>
                </dl>
                {project.description && (
                  <p className="text-muted-foreground border-t pt-3 whitespace-pre-wrap">
                    {project.description}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Team</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectMembers
                  projectId={project.id}
                  members={projectMembers}
                  available={availableMembers}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 lg:col-span-2">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList projectId={project.id} tasks={tasks} members={allMembers} />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 mt-6">
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectFiles projectId={project.id} files={files} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
