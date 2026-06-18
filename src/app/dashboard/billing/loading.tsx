import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton, PageShell } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <>
      <DashboardHeader title="Billing" />
      <PageShell>
        <Card className="border-border/60 mb-8">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="mb-4 h-6 w-20" />
        <CardGridSkeleton count={3} />
      </PageShell>
    </>
  );
}
