import { auth } from "@clerk/nextjs/server";
import { CreateOrganization, UserButton } from "@clerk/nextjs";
import { Layers } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getTenant } from "@/lib/tenant/context";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { orgId } = await auth();

  // No active organization yet → onboarding. Every tenant is an organization,
  // so the user creates or selects one before entering the app.
  if (!orgId) {
    return (
      <div className="flex min-h-full flex-col">
        <header className="border-border/60 flex h-16 items-center justify-between border-b px-6">
          <span className="flex items-center gap-2 font-semibold">
            <span className="bg-aurora shadow-aurora flex size-8 items-center justify-center rounded-lg text-white">
              <Layers className="size-4" />
            </span>
            <span className="tracking-tight">
              Agency<span className="text-aurora">OS</span>
            </span>
          </span>
          <UserButton />
        </header>
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

  // Ensure the tenant is provisioned. After the first visit this is a single
  // cached DB read (shared with the page below); it only calls Clerk + writes
  // on the very first load after an org is created.
  await getTenant();

  return (
    <div className="flex min-h-full">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
