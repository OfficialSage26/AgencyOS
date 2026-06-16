import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { requireTenantDb } from "@/lib/tenant/context";

export default async function DashboardPage() {
  const { db } = await requireTenantDb();
  const user = await currentUser();
  const greetingName = user?.firstName ?? user?.username ?? "there";

  // All queries are automatically scoped to the active organization.
  const [activeClients, openProjects, pendingInvoices, revenue] = await Promise.all([
    db.client.count({ where: { status: "ACTIVE" } }),
    db.project.count({ where: { status: { in: ["PLANNING", "ACTIVE", "REVIEW"] } } }),
    db.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } }),
    db.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
  ]);

  const totalRevenue = revenue._sum.amount ?? 0;
  const stats = [
    { label: "Total Revenue", value: `$${Number(totalRevenue).toLocaleString()}` },
    { label: "Active Clients", value: activeClients.toLocaleString() },
    { label: "Open Projects", value: openProjects.toLocaleString() },
    { label: "Pending Invoices", value: pendingInvoices.toLocaleString() },
  ];

  return (
    <>
      <DashboardHeader title="Overview" />
      <main className="flex-1 px-4 py-8 md:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {greetingName} 👋</h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s a snapshot of your business. Modules appear here as they ship.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
