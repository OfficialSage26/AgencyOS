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
import { createAppointment, updateAppointment } from "@/app/dashboard/appointments/actions";
import { initialActionState, type ActionState } from "@/lib/forms";

export type AppointmentFormValues = {
  id: string;
  title: string | null;
  clientId: string | null;
  startTime: string; // YYYY-MM-DDTHH:mm
  endTime: string; // YYYY-MM-DDTHH:mm
  notes: string | null;
};

type ClientOption = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  appointment?: AppointmentFormValues;
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

export function AppointmentFormDialog({
  mode,
  appointment,
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
        mode === "edit" && appointment
          ? await updateAppointment(appointment.id, initialActionState, formData)
          : await createAppointment(initialActionState, formData);
      setState(result);
      if (result.ok) {
        toast.success(mode === "create" ? "Appointment scheduled" : "Appointment updated");
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
            <DialogTitle>{mode === "create" ? "New appointment" : "Edit appointment"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Schedule a meeting with a client."
                : "Update this appointment."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Kickoff call"
                defaultValue={appointment?.title ?? ""}
              />
              <FieldError message={state.fieldErrors?.title} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientId">Client</Label>
              <select
                id="clientId"
                name="clientId"
                defaultValue={appointment?.clientId ?? ""}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  required
                  defaultValue={appointment?.startTime ?? ""}
                />
                <FieldError message={state.fieldErrors?.startTime} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  required
                  defaultValue={appointment?.endTime ?? ""}
                />
                <FieldError message={state.fieldErrors?.endTime} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={appointment?.notes ?? ""} />
            </div>
            {state.error && <FieldError message={state.error} />}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Schedule" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
