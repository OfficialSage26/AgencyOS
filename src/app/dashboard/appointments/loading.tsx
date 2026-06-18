import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell, ToolbarSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <>
      <DashboardHeader title="Appointments" />
      <PageShell>
        <ToolbarSkeleton />
        <Skeleton className="mb-3 h-5 w-24" />
        <Card className="border-border/60">
          <CardContent className="p-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border-border/60 flex items-center justify-between border-b px-4 py-3.5 last:border-0">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-7 w-14" />
              </div>
            ))}
          </CardContent>
        </Card>
      </PageShell>
    </>
  );
}
