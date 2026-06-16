"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";
import { deleteClient } from "@/app/dashboard/clients/actions";
import { ClientFormDialog, type ClientFormValues } from "@/components/clients/client-form-dialog";

function DeleteClientDialog({ client }: { client: ClientFormValues }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteClient(client.id);
      if (result.ok) {
        toast.success("Client deleted");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to delete client");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="Delete client"
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
      >
        <Trash2 className="text-muted-foreground size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete client</DialogTitle>
          <DialogDescription>
            This permanently deletes “{client.name}” and its activity history. This cannot be
            undone.
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

export function ClientRowActions({ client }: { client: ClientFormValues }) {
  return (
    <div className="flex justify-end gap-1">
      <ClientFormDialog
        mode="edit"
        client={client}
        triggerVariant="ghost"
        triggerSize="icon-sm"
        triggerAriaLabel="Edit client"
        triggerChildren={<Pencil className="text-muted-foreground size-4" />}
      />
      <DeleteClientDialog client={client} />
    </div>
  );
}
