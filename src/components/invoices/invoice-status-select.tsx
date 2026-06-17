"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setInvoiceStatus } from "@/app/dashboard/invoices/actions";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/validations/invoice";

const selectClass = "border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs";

export function InvoiceStatusSelect({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(async () => {
      const result = await setInvoiceStatus(invoiceId, next);
      if (result.ok) toast.success("Status updated");
      else toast.error(result.error ?? "Failed to update status");
    });
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      disabled={pending}
      className={selectClass}
      aria-label="Invoice status"
    >
      {INVOICE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {INVOICE_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
