"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteLead, moveLead } from "@/app/dashboard/leads/actions";
import { LeadFormDialog, type LeadFormValues } from "@/components/leads/lead-form-dialog";
import { LEAD_STAGES, LEAD_STAGE_LABELS, type LeadStage } from "@/lib/validations/lead";

function formatValue(value: number | null) {
  if (value == null) return null;
  return `$${value.toLocaleString()}`;
}

function DeleteLeadButton({ lead }: { lead: LeadFormValues }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteLead(lead.id);
      if (result.ok) {
        toast.success("Lead deleted");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to delete lead");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="Delete lead"
        className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete lead</DialogTitle>
          <DialogDescription>
            This permanently deletes “{lead.title}”. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadCard({ lead }: { lead: LeadFormValues }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="bg-background border-border/60 group cursor-grab rounded-lg border p-3 shadow-xs active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{lead.title}</p>
        <GripVertical className="text-muted-foreground/40 size-4 shrink-0" />
      </div>
      {lead.source && <p className="text-muted-foreground mt-1 text-xs">{lead.source}</p>}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{formatValue(lead.value) ?? "—"}</span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <LeadFormDialog
            mode="edit"
            lead={lead}
            triggerVariant="ghost"
            triggerSize="icon-xs"
            triggerAriaLabel="Edit lead"
            triggerChildren={<span className="text-muted-foreground text-xs">Edit</span>}
            triggerClassName="px-2 text-xs"
          />
          <DeleteLeadButton lead={lead} />
        </div>
      </div>
    </div>
  );
}

export function LeadsBoard({ leads }: { leads: LeadFormValues[] }) {
  const [optimisticLeads, applyOptimistic] = useOptimistic(
    leads,
    (state, move: { id: string; stage: LeadStage }) =>
      state.map((lead) => (lead.id === move.id ? { ...lead, stage: move.stage } : lead)),
  );
  const [, startTransition] = useTransition();
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);

  function onDrop(stage: LeadStage, event: React.DragEvent) {
    event.preventDefault();
    setDragOverStage(null);
    const id = event.dataTransfer.getData("text/plain");
    if (!id) return;
    const lead = optimisticLeads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    startTransition(async () => {
      applyOptimistic({ id, stage });
      const result = await moveLead(id, stage);
      if (!result.ok) toast.error(result.error ?? "Failed to move lead");
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {LEAD_STAGES.map((stage) => {
        const stageLeads = optimisticLeads.filter((lead) => lead.stage === stage);
        const total = stageLeads.reduce((sum, lead) => sum + (lead.value ?? 0), 0);
        return (
          <section
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStage(stage);
            }}
            onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
            onDrop={(e) => onDrop(stage, e)}
            className={cn(
              "bg-muted/30 flex w-72 shrink-0 flex-col rounded-xl border border-transparent",
              dragOverStage === stage && "border-primary bg-muted/60",
            )}
          >
            <header className="flex items-center justify-between px-3 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{LEAD_STAGE_LABELS[stage]}</span>
                <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-xs">
                  {stageLeads.length}
                </span>
              </div>
              <LeadFormDialog
                mode="create"
                defaultStage={stage}
                triggerVariant="ghost"
                triggerSize="icon-xs"
                triggerAriaLabel={`Add lead to ${LEAD_STAGE_LABELS[stage]}`}
                triggerChildren={<Plus className="size-4" />}
              />
            </header>
            {total > 0 && (
              <p className="text-muted-foreground px-3 pb-2 text-xs">
                ${total.toLocaleString()} total
              </p>
            )}
            <div className="flex min-h-24 flex-col gap-2 p-2">
              {stageLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
