import { DashboardHeader } from "@/components/dashboard/header";
import { CardGridSkeleton, PageShell, ToolbarSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <>
      <DashboardHeader title="Projects" />
      <PageShell>
        <ToolbarSkeleton />
        <CardGridSkeleton count={6} />
      </PageShell>
    </>
  );
}
