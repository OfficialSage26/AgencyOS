import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarClock, FolderKanban, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/validations/project";
import {
  INVOICE_STATUS_LABELS,
  formatMoney,
  type InvoiceStatus,
} from "@/lib/validations/invoice";
import { formatDate, formatTime, manilaDayParts } from "@/lib/format";

export const metadata: Metadata = { title: "Client Portal" };

const projectBadge: Record<ProjectStatus, string> = {
  PLANNING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};

const invoiceBadge: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SENT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

// Resolve the capability token to a client and load their shareable data.
// Drafts are never exposed; appointments are split into upcoming/past here so
// the impure time read stays out of the component render path.
async function loadPortal(token: string) {
  const client = await db.client.findUnique({
    where: { portalToken: token },
    include: { organization: { select: { name: true } } },
  });
  if (!client) return null;

  const scope = { clientId: client.id, organizationId: client.organizationId };
  const [projects, invoices, appointments] = await Promise.all([
    db.project.findMany({ where: scope, orderBy: { createdAt: "desc" } }),
    db.invoice.findMany({
      where: { ...scope, status: { in: ["SENT", "PAID", "OVERDUE"] } },
      orderBy: { createdAt: "desc" },
    }),
    db.appointment.findMany({ where: scope, orderBy: { startTime: "asc" } }),
  ]);

  const now = Date.now();
  const upcoming = appointments.filter((a) => a.endTime.getTime() >= now);
  const currency = invoices[0]?.currency ?? "PHP";
  const outstanding = invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const activeProjects = projects.filter((p) => p.status !== "COMPLETED").length;

  return { client, projects, invoices, upcoming, currency, outstanding, activeProjects };
}

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await loadPortal(token);
  if (!data) notFound();

  const { client, projects, invoices, upcoming, currency, outstanding, activeProjects } = data;
  const nextAppt = upcoming[0];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 md:px-6">
      <p className="text-muted-foreground text-sm">{client.organization.name}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Welcome, {client.name}</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Here&apos;s an overview of your work with us.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={FolderKanban}
          label="Active projects"
          value={String(activeProjects)}
          tint="#6366f1"
        />
        <SummaryCard
          icon={ReceiptText}
          label="Outstanding"
          value={formatMoney(outstanding, currency)}
          tint="#f59e0b"
        />
        <SummaryCard
          icon={CalendarClock}
          label="Next meeting"
          value={nextAppt ? formatDate(nextAppt.startTime) : "—"}
          tint="#10b981"
        />
      </div>

      <section className="mt-8 space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-muted-foreground text-sm">No projects to show yet.</p>
            ) : (
              <ul className="space-y-4">
                {projects.map((project) => (
                  <li key={project.id}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-medium">{project.title}</span>
                      <Badge variant="secondary" className={projectBadge[project.status]}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <p className="text-muted-foreground px-6 py-4 text-sm">No invoices yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-border/60 border-b text-left text-xs">
                    <th className="px-6 py-3 font-medium">Number</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Due</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-border/60 border-b last:border-0">
                      <td className="px-6 py-3 font-medium">{invoice.number}</td>
                      <td className="px-6 py-3">
                        <Badge variant="secondary" className={invoiceBadge[invoice.status]}>
                          {INVOICE_STATUS_LABELS[invoice.status]}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground px-6 py-3">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {formatMoney(Number(invoice.amount), invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Upcoming appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming appointments.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((appt) => (
                  <li key={appt.id} className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary flex size-9 shrink-0 flex-col items-center justify-center rounded-lg text-[10px] leading-none font-medium">
                      <span>{manilaDayParts(appt.startTime).month}</span>
                      <span className="text-sm font-bold">{manilaDayParts(appt.startTime).day}</span>
                    </span>
                    <div>
                      <p className="text-sm font-medium">{appt.title ?? "Appointment"}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 py-5">
        <span
          className="flex size-10 items-center justify-center rounded-lg"
          style={{ background: `${tint}1a`, color: tint }}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
