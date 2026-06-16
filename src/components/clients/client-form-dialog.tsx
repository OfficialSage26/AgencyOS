"use client";

import { useState, useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient, updateClient } from "@/app/dashboard/clients/actions";
import { initialActionState, type ActionState } from "@/app/dashboard/clients/types";
import { CLIENT_STATUSES } from "@/lib/validations/client";

export type ClientFormValues = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  status: (typeof CLIENT_STATUSES)[number];
};

type Props = {
  mode: "create" | "edit";
  client?: ClientFormValues;
  trigger: React.ReactNode;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

export function ClientFormDialog({ mode, client, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>(initialActionState);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result =
        mode === "edit" && client
          ? await updateClient(client.id, initialActionState, formData)
          : await createClient(initialActionState, formData);
      setState(result);
      if (result.ok) {
        toast.success(mode === "create" ? "Client created" : "Client updated");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "New client" : "Edit client"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a client to your organization."
                : "Update this client's details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={client?.name ?? ""} required />
              <FieldError message={state.fieldErrors?.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
              <FieldError message={state.fieldErrors?.email} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
                <FieldError message={state.fieldErrors?.phone} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" defaultValue={client?.company ?? ""} />
                <FieldError message={state.fieldErrors?.company} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={client?.status ?? "ACTIVE"}
                className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
              >
                {CLIENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={client?.notes ?? ""} />
              <FieldError message={state.fieldErrors?.notes} />
            </div>
            {state.error && <FieldError message={state.error} />}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create client" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
