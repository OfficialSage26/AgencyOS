"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { deleteAppointment } from "@/app/dashboard/appointments/actions";

export function DeleteAppointmentButton({
  appointmentId,
  label,
}: {
  appointmentId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteAppointment(appointmentId);
      if (result.ok) {
        toast.success("Appointment deleted");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to delete appointment");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="Delete appointment"
        className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete appointment</DialogTitle>
          <DialogDescription>
            This permanently deletes “{label}”. This cannot be undone.
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
