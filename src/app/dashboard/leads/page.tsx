import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { requireTenantDb } from "@/lib/tenant/context";
import { LeadsBoard } from "@/components/leads/leads-board";
import { LeadFormDialog, type LeadFormValues } from "@/components/leads/lead-form-dialog";

export default async function LeadsPage() {
  const { db } = await requireTenantDb();

  const rows = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  const leads: LeadFormValues[] = rows.map((lead) => ({
    id: lead.id,
    title: lead.title,
    source: lead.source,
    value: lead.value != null ? Number(lead.value) : null,
    stage: lead.stage,
  }));

  return (
    <>
      <DashboardHeader title="Leads" />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            Drag cards between stages to update your pipeline.
          </p>
          <LeadFormDialog
            mode="create"
            triggerSize="sm"
            triggerChildren={
              <>
                <Plus className="size-4" />
                New lead
              </>
            }
          />
        </div>
        <LeadsBoard leads={leads} />
      </main>
    </>
  );
}
