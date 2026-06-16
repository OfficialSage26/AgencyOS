"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { VariantProps } from "class-variance-authority";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createLead, updateLead } from "@/app/dashboard/leads/actions";
import { initialActionState, type ActionState } from "@/lib/forms";
import { LEAD_STAGES, LEAD_STAGE_LABELS, type LeadStage } from "@/lib/validations/lead";

export type LeadFormValues = {
  id: string;
  title: string;
  source: string | null;
  value: number | null;
  stage: LeadStage;
};

type Props = {
  mode: "create" | "edit";
  lead?: LeadFormValues;
  defaultStage?: LeadStage;
  triggerChildren: React.ReactNode;
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  triggerSize?: VariantProps<typeof buttonVariants>["size"];
  triggerClassName?: string;
  triggerAriaLabel?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

export function LeadFormDialog({
  mode,
  lead,
  defaultStage,
  triggerChildren,
  triggerVariant,
  triggerSize,
  triggerClassName,
  triggerAriaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>(initialActionState);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result =
        mode === "edit" && lead
          ? await updateLead(lead.id, initialActionState, formData)
          : await createLead(initialActionState, formData);
      setState(result);
      if (result.ok) {
        toast.success(mode === "create" ? "Lead created" : "Lead updated");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={triggerAriaLabel}
        className={cn(
          buttonVariants({ variant: triggerVariant, size: triggerSize }),
          triggerClassName,
        )}
      >
        {triggerChildren}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "New lead" : "Edit lead"}</DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Add a lead to your pipeline." : "Update this lead."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={lead?.title ?? ""} required />
              <FieldError message={state.fieldErrors?.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="source">Source</Label>
                <Input id="source" name="source" defaultValue={lead?.source ?? ""} />
                <FieldError message={state.fieldErrors?.source} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={lead?.value ?? ""}
                />
                <FieldError message={state.fieldErrors?.value} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage">Stage</Label>
              <select
                id="stage"
                name="stage"
                defaultValue={lead?.stage ?? defaultStage ?? "NEW"}
                className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            {state.error && <FieldError message={state.error} />}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create lead" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
