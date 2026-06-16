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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createProject, updateProject } from "@/app/dashboard/projects/actions";
import { initialActionState, type ActionState } from "@/lib/forms";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/lib/validations/project";

export type ProjectFormValues = {
  id: string;
  title: string;
  description: string | null;
  clientId: string | null;
  status: ProjectStatus;
  progress: number;
  deadline: string | null; // YYYY-MM-DD
  budget: number | null;
};

type ClientOption = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  project?: ProjectFormValues;
  clients: ClientOption[];
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

const selectClass = "border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs";

export function ProjectFormDialog({
  mode,
  project,
  clients,
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
        mode === "edit" && project
          ? await updateProject(project.id, initialActionState, formData)
          : await createProject(initialActionState, formData);
      setState(result);
      if (result.ok) {
        toast.success(mode === "create" ? "Project created" : "Project updated");
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
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "New project" : "Edit project"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a project for your organization."
                : "Update this project."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={project?.title ?? ""} required />
              <FieldError message={state.fieldErrors?.title} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={project?.description ?? ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientId">Client</Label>
                <select
                  id="clientId"
                  name="clientId"
                  defaultValue={project?.clientId ?? ""}
                  className={selectClass}
                >
                  <option value="">No client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={project?.status ?? "PLANNING"}
                  className={selectClass}
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {PROJECT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="progress">Progress %</Label>
                <Input
                  id="progress"
                  name="progress"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={project?.progress ?? 0}
                />
                <FieldError message={state.fieldErrors?.progress} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={project?.budget ?? ""}
                />
                <FieldError message={state.fieldErrors?.budget} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  defaultValue={project?.deadline ?? ""}
                />
                <FieldError message={state.fieldErrors?.deadline} />
              </div>
            </div>
            {state.error && <FieldError message={state.error} />}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
