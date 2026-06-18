import { DashboardHeader } from "@/components/dashboard/header";
import { DetailSkeleton, PageShell } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <>
      <DashboardHeader title="Invoice" />
      <PageShell>
        <DetailSkeleton />
      </PageShell>
    </>
  );
}
