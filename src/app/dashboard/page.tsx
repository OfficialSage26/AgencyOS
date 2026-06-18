import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  DollarSign,
  FolderKanban,
  ReceiptText,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { requireTenantDb } from "@/lib/tenant/context";
import {
  AreaChart,
  Donut,
  FunnelBars,
  compactMoney,
  type DonutSegment,
} from "@/components/dashboard/charts";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/validations/project";
import { LEAD_STAGES, LEAD_STAGE_LABELS } from "@/lib/validations/lead";
import { formatMoney } from "@/lib/validations/invoice";
import { PH_LOCALE, PH_TIMEZONE, formatTime, manilaDayParts } from "@/lib/format";

type Db = Awaited<ReturnType<typeof requireTenantDb>>["db"];

const PROJECT_COLORS: Record<ProjectStatus, string> = {
  PLANNING: "#94a3b8",
  ACTIVE: "#6366f1",
  REVIEW: "#f59e0b",
  COMPLETED: "#10b981",
};

const STAGE_COLORS: Record<string, string> = {
  NEW: "#94a3b8",
  CONTACTED: "#38bdf8",
  PROPOSAL_SENT: "#6366f1",
  NEGOTIATION: "#8b5cf6",
  WON: "#10b981",
  LOST: "#f43f5e",
};

// All time-dependent and aggregation logic lives here (outside the component
// body) so the impure current-time reads aren't flagged by react-hooks/purity.
async function loadDashboard(db: Db) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const monthStart = (offset: number) => new Date(y, m - offset, 1);
  const thisMonthStart = monthStart(0);
  const lastMonthStart = monthStart(1);

  const [
    paidInvoices,
    projectGroups,
    leadGroups,
    invoiceGroups,
    activeClients,
    newClientsThis,
    newClientsLast,
    upcoming,
    sampleInvoice,
  ] = await Promise.all([
    db.invoice.findMany({
      where: { status: "PAID" },
      select: { amount: true, issuedAt: true, createdAt: true },
    }),
    db.project.groupBy({ by: ["status"], _count: true }),
    db.lead.groupBy({ by: ["stage"], _count: true, _sum: { value: true } }),
    db.invoice.groupBy({ by: ["status"], _count: true, _sum: { amount: true } }),
    db.client.count({ where: { status: "ACTIVE" } }),
    db.client.count({ where: { createdAt: { gte: thisMonthStart } } }),
    db.client.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
    db.appointment.findMany({
      where: { endTime: { gte: now } },
      orderBy: { startTime: "asc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    db.invoice.findFirst({ orderBy: { createdAt: "desc" }, select: { currency: true } }),
  ]);

  const currency = sampleInvoice?.currency ?? "PHP";

  // Revenue trend: last 6 months of paid invoices, bucketed by issue date.
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const start = monthStart(5 - i);
    const end = monthStart(4 - i);
    return {
      label: start.toLocaleString(undefined, { month: "short" }),
      start: start.getTime(),
      end: end.getTime(),
      value: 0,
    };
  });
  for (const inv of paidInvoices) {
    const when = (inv.issuedAt ?? inv.createdAt).getTime();
    const bucket = buckets.find((b) => when >= b.start && when < b.end);
    if (bucket) bucket.value += Number(inv.amount);
  }
  const revenueTrend = buckets.map((b) => ({ label: b.label, value: b.value }));
  const revenueThisMonth = buckets[5].value;
  const revenueLastMonth = buckets[4].value;

  const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.amount), 0);

  const invoiceByStatus = Object.fromEntries(
    invoiceGroups.map((g) => [g.status, { count: g._count, sum: Number(g._sum.amount ?? 0) }]),
  );
  const outstanding =
    (invoiceByStatus.SENT?.sum ?? 0) + (invoiceByStatus.OVERDUE?.sum ?? 0);
  const pendingInvoices =
    (invoiceByStatus.SENT?.count ?? 0) + (invoiceByStatus.OVERDUE?.count ?? 0);

  const projectByStatus = Object.fromEntries(
    projectGroups.map((g) => [g.status, g._count]),
  ) as Record<ProjectStatus, number>;
  const totalProjects = projectGroups.reduce((s, g) => s + g._count, 0);
  const openProjects =
    (projectByStatus.PLANNING ?? 0) +
    (projectByStatus.ACTIVE ?? 0) +
    (projectByStatus.REVIEW ?? 0);

  const leadByStage = Object.fromEntries(
    leadGroups.map((g) => [g.stage, { count: g._count, value: Number(g._sum.value ?? 0) }]),
  );
  const pipelineValue = LEAD_STAGES.filter((s) => s !== "WON" && s !== "LOST").reduce(
    (sum, s) => sum + (leadByStage[s]?.value ?? 0),
    0,
  );

  const todayLabel = now.toLocaleDateString(PH_LOCALE, {
    timeZone: PH_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return {
    currency,
    todayLabel,
    revenueTrend,
    revenueThisMonth,
    revenueLastMonth,
    totalRevenue,
    outstanding,
    pendingInvoices,
    activeClients,
    newClientsThis,
    newClientsLast,
    projectByStatus,
    totalProjects,
    openProjects,
    leadByStage,
    pipelineValue,
    upcoming,
  };
}

function delta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function StatCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <Card className="border-border/60 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full opacity-10 blur-2xl"
        style={{ background: tint }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
          <span
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: `${tint}1a`, color: tint }}
          >
            <Icon className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(trend).toFixed(0)}%
            </span>
          )}
        </div>
        {sub && <p className="text-muted-foreground mt-1 text-xs">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const { tenant, db } = await requireTenantDb();
  const [d, me] = await Promise.all([
    loadDashboard(db),
    db.user.findUnique({ where: { id: tenant.userId }, select: { name: true } }),
  ]);
  const greetingName = me?.name?.split(" ")[0] ?? "there";

  const projectSegments: DonutSegment[] = (
    Object.keys(PROJECT_COLORS) as ProjectStatus[]
  )
    .map((status) => ({
      label: PROJECT_STATUS_LABELS[status],
      value: d.projectByStatus[status] ?? 0,
      color: PROJECT_COLORS[status],
    }))
    .filter((s) => s.value > 0);

  const funnelRows = LEAD_STAGES.map((stage) => ({
    label: LEAD_STAGE_LABELS[stage],
    count: d.leadByStage[stage]?.count ?? 0,
    value: d.leadByStage[stage]?.value ?? 0,
    color: STAGE_COLORS[stage],
  }));

  const revenueTrendPct = delta(d.revenueThisMonth, d.revenueLastMonth);
  const clientsTrendPct = delta(d.newClientsThis, d.newClientsLast);

  return (
    <>
      <DashboardHeader title="Overview" />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back, {greetingName} 👋</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {d.todayLabel} · Here&apos;s how your business is tracking.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Revenue (paid)"
            value={compactMoney(d.totalRevenue, d.currency)}
            sub={`${compactMoney(d.revenueThisMonth, d.currency)} this month`}
            trend={revenueTrendPct}
            icon={DollarSign}
            tint="#6366f1"
          />
          <StatCard
            label="Outstanding"
            value={compactMoney(d.outstanding, d.currency)}
            sub={`${d.pendingInvoices} invoice${d.pendingInvoices === 1 ? "" : "s"} awaiting payment`}
            icon={ReceiptText}
            tint="#f59e0b"
          />
          <StatCard
            label="Active clients"
            value={d.activeClients.toLocaleString()}
            sub={`${d.newClientsThis} new this month`}
            trend={clientsTrendPct}
            icon={Users}
            tint="#10b981"
          />
          <StatCard
            label="Open projects"
            value={d.openProjects.toLocaleString()}
            sub={`${d.totalProjects} total`}
            icon={FolderKanban}
            tint="#8b5cf6"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue</CardTitle>
                <span className="text-muted-foreground text-xs">Last 6 months · paid invoices</span>
              </div>
            </CardHeader>
            <CardContent>
              <AreaChart data={d.revenueTrend} currency={d.currency} />
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projectSegments.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">No projects yet.</p>
              ) : (
                <Donut
                  segments={projectSegments}
                  centerValue={String(d.totalProjects)}
                  centerLabel="total"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lead pipeline</CardTitle>
                <span className="text-sm font-medium">
                  {compactMoney(d.pipelineValue, d.currency)} open
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <FunnelBars rows={funnelRows} currency={d.currency} />
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming</CardTitle>
                <Link
                  href="/dashboard/appointments"
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {d.upcoming.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm">
                  <CalendarClock className="size-5" />
                  No upcoming appointments.
                </div>
              ) : (
                <ul className="space-y-3">
                  {d.upcoming.map((appt) => (
                    <li key={appt.id} className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 flex-col items-center justify-center rounded-lg text-[10px] leading-none font-medium">
                        <span>{manilaDayParts(appt.startTime).month}</span>
                        <span className="text-sm font-bold">
                          {manilaDayParts(appt.startTime).day}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {appt.title ?? appt.client?.name ?? "Appointment"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatTime(appt.startTime)}
                          {appt.client && appt.title ? ` · ${appt.client.name}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          Showing live data scoped to your organization ·{" "}
          {formatMoney(d.totalRevenue, d.currency)} earned to date
        </p>
      </main>
    </>
  );
}
