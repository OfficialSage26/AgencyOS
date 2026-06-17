"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { createInvoice, updateInvoice } from "@/app/dashboard/invoices/actions";
import { initialActionState, type ActionState } from "@/lib/forms";
import {
  CURRENCIES,
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  type Currency,
  type InvoiceStatus,
} from "@/lib/validations/invoice";

export type InvoiceFormValues = {
  id: string;
  clientId: string | null;
  currency: Currency;
  status: InvoiceStatus;
  issuedAt: string | null; // YYYY-MM-DD
  dueDate: string | null; // YYYY-MM-DD
};

type ClientOption = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  invoice?: InvoiceFormValues;
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

export function InvoiceFormDialog({
  mode,
  invoice,
  clients,
  triggerChildren,
  triggerVariant,
  triggerSize,
  triggerClassName,
  triggerAriaLabel,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>(initialActionState);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result =
        mode === "edit" && invoice
          ? await updateInvoice(invoice.id, initialActionState, formData)
          : await createInvoice(initialActionState, formData);
      setState(result);
      if (result.ok) {
        toast.success(mode === "create" ? "Invoice created" : "Invoice updated");
        setOpen(false);
        if (result.redirectTo) router.push(result.redirectTo);
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
            <DialogTitle>{mode === "create" ? "New invoice" : "Edit invoice"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create an invoice, then add line items."
                : "Update invoice details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientId">Client</Label>
                <select
                  id="clientId"
                  name="clientId"
                  defaultValue={invoice?.clientId ?? ""}
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
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  name="currency"
                  defaultValue={invoice?.currency ?? "USD"}
                  className={selectClass}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={invoice?.status ?? "DRAFT"}
                  className={selectClass}
                >
                  {INVOICE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {INVOICE_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="issuedAt">Issued</Label>
                <Input
                  id="issuedAt"
                  name="issuedAt"
                  type="date"
                  defaultValue={invoice?.issuedAt ?? ""}
                />
                <FieldError message={state.fieldErrors?.issuedAt} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due</Label>
                <Input id="dueDate" name="dueDate" type="date" defaultValue={invoice?.dueDate ?? ""} />
                <FieldError message={state.fieldErrors?.dueDate} />
              </div>
            </div>
            {state.error && <FieldError message={state.error} />}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create invoice" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
