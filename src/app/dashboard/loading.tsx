import { DashboardHeader } from "@/components/dashboard/header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartCardSkeleton,
  PageShell,
  StatCardsSkeleton,
} from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <>
      <DashboardHeader title="Overview" />
      <PageShell>
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-2 h-4 w-96" />
        <div className="mt-8">
          <StatCardsSkeleton />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ChartCardSkeleton className="lg:col-span-2" />
          <ChartCardSkeleton />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ChartCardSkeleton className="lg:col-span-2" height="h-40" />
          <ChartCardSkeleton height="h-40" />
        </div>
      </PageShell>
    </>
  );
}
