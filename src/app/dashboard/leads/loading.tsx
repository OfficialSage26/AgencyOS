import { DashboardHeader } from "@/components/dashboard/header";
import { BoardSkeleton, PageShell, ToolbarSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <>
      <DashboardHeader title="Leads" />
      <PageShell>
        <ToolbarSkeleton />
        <BoardSkeleton />
      </PageShell>
    </>
  );
}
