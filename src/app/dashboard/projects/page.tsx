import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantDb } from "@/lib/tenant/context";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/validations/project";

const statusBadge: Record<ProjectStatus, string> = {
  PLANNING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};

export default async function ProjectsPage() {
  const { db } = await requireTenantDb();

  const [projects, clients] = await Promise.all([
    db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
    }),
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <DashboardHeader title="Projects" />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">Track delivery across all your projects.</p>
          <ProjectFormDialog
            mode="create"
            clients={clients}
            triggerSize="sm"
            triggerChildren={
              <>
                <Plus className="size-4" />
                New project
              </>
            }
          />
        </div>

        {projects.length === 0 ? (
          <div className="border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <span className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
              <FolderKanban className="size-6" />
            </span>
            <h3 className="text-lg font-semibold">No projects yet</h3>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm text-sm">
              Create your first project to track tasks, team, and progress.
            </p>
            <ProjectFormDialog
              mode="create"
              clients={clients}
              triggerSize="sm"
              triggerChildren={
                <>
                  <Plus className="size-4" />
                  New project
                </>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="border-border/60 hover:border-primary/40 h-full transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <Badge variant="secondary" className={statusBadge[project.status]}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {project.client?.name ?? "No client"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>{project._count.tasks} tasks</span>
                      {project.deadline && <span>Due {project.deadline.toLocaleDateString()}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
