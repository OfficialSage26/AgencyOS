import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Activity as ActivityIcon,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireTenantDb } from "@/lib/tenant/context";
import { ClientFormDialog, type ClientFormValues } from "@/components/clients/client-form-dialog";
import { AddNoteForm } from "@/components/clients/add-note-form";

const statusBadge: Record<ClientFormValues["status"], string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  INACTIVE: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const { db } = await requireTenantDb();

  const client = await db.client.findFirst({ where: { id: clientId } });
  if (!client) notFound();

  const activities = await db.activity.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const values: ClientFormValues = {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    notes: client.notes,
    status: client.status,
  };

  return (
    <>
      <DashboardHeader title={client.name} />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" render={<Link href="/dashboard/clients" />}>
            <ArrowLeft className="size-4" />
            Back to clients
          </Button>
          <ClientFormDialog
            mode="edit"
            client={values}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="size-4" />
                Edit
              </Button>
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Details */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Details</CardTitle>
                  <Badge variant="secondary" className={statusBadge[client.status]}>
                    {client.status.charAt(0) + client.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground size-4" />
                  <span>{client.email ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground size-4" />
                  <span>{client.phone ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="text-muted-foreground size-4" />
                  <span>{client.company ?? "—"}</span>
                </div>
                <Separator />
                <p className="text-muted-foreground">
                  Added {client.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            {client.notes && (
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm whitespace-pre-wrap">{client.notes}</CardContent>
              </Card>
            )}
          </div>

          {/* Activity timeline */}
          <Card className="border-border/60 lg:col-span-2">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AddNoteForm clientId={client.id} />
              <Separator />
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-sm">No activity yet.</p>
              ) : (
                <ol className="space-y-4">
                  {activities.map((activity) => (
                    <li key={activity.id} className="flex gap-3">
                      <span className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                        {activity.type === "NOTE" ? (
                          <MessageSquare className="size-4" />
                        ) : (
                          <ActivityIcon className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm whitespace-pre-wrap">{activity.description}</p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {activity.user?.name ?? activity.user?.email ?? "System"} ·{" "}
                          {activity.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
