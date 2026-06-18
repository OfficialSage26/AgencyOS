import { DashboardHeader } from "@/components/dashboard/header";
import { PageShell, TableSkeleton, ToolbarSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <>
      <DashboardHeader title="Invoices" />
      <PageShell>
        <ToolbarSkeleton />
        <TableSkeleton rows={6} cols={5} />
      </PageShell>
    </>
  );
}
