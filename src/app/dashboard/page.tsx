import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CreateOrganization, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { syncTenant } from "@/lib/tenant/sync";
import { forOrg } from "@/lib/tenant/scoped-db";

function DashboardHeader({ showSwitcher = true }: { showSwitcher?: boolean }) {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Layers className="size-4" />
          </span>
          AgencyOS
        </Link>
        <div className="flex items-center gap-3">
          {showSwitcher && (
            <OrganizationSwitcher hidePersonal afterCreateOrganizationUrl="/dashboard" />
          )}
          <UserButton />
        </div>
      </div>
    </header>
  );
}

export default async function DashboardPage() {
  const { orgId } = await auth();

  // No active organization yet → onboarding. Every tenant in AgencyOS is an
  // organization, so the user creates or selects one before entering the app.
  if (!orgId) {
    return (
      <div className="flex min-h-full flex-col">
        <DashboardHeader showSwitcher={false} />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">Create your workspace</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            AgencyOS organizes everything under an organization. Create one to get started — your
            clients, projects, and invoices live here.
          </p>
          <CreateOrganization afterCreateOrganizationUrl="/dashboard" skipInvitationScreen />
        </main>
      </div>
    );
  }

  const tenant = await syncTenant();
  const user = await currentUser();
  const greetingName = user?.firstName ?? user?.username ?? "there";

  // All queries below are automatically scoped to this organization.
  const tdb = forOrg(tenant!.organizationId);
  const [activeClients, openProjects, pendingInvoices, revenue] = await Promise.all([
    tdb.client.count({ where: { status: "ACTIVE" } }),
    tdb.project.count({ where: { status: { in: ["PLANNING", "ACTIVE", "REVIEW"] } } }),
    tdb.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } }),
    tdb.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
  ]);

  const totalRevenue = revenue._sum.amount ?? 0;
  const stats = [
    { label: "Total Revenue", value: `$${Number(totalRevenue).toLocaleString()}` },
    { label: "Active Clients", value: activeClients.toLocaleString() },
    { label: "Open Projects", value: openProjects.toLocaleString() },
    { label: "Pending Invoices", value: pendingInvoices.toLocaleString() },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {greetingName} 👋</h1>
        <p className="text-muted-foreground mt-1">
          This is your AgencyOS dashboard. Modules will appear here as they ship.
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
    </div>
  );
}
