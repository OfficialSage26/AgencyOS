import { DashboardHeader } from "@/components/dashboard/header";
import { PageShell, ToolbarSkeleton, TableSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <>
      <DashboardHeader title="Clients" />
      <PageShell>
        <ToolbarSkeleton />
        <TableSkeleton rows={6} cols={6} />
      </PageShell>
    </>
  );
}
