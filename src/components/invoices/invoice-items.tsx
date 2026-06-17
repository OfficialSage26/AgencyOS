"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addInvoiceItem, deleteInvoiceItem } from "@/app/dashboard/invoices/actions";
import { initialActionState } from "@/lib/forms";
import { formatMoney } from "@/lib/validations/invoice";

export type InvoiceItemRow = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

function AddItemForm({ invoiceId }: { invoiceId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await addInvoiceItem(invoiceId, initialActionState, formData);
      if (result.ok) {
        toast.success("Line item added");
        formRef.current?.reset();
      } else {
        toast.error(result.error ?? "Failed to add line item");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <Input name="description" placeholder="Description" required className="h-8 flex-1 text-sm" />
      <Input
        name="quantity"
        type="number"
        min="0"
        step="0.01"
        defaultValue="1"
        className="h-8 w-20 text-sm"
        aria-label="Quantity"
      />
      <Input
        name="unitPrice"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        className="h-8 w-28 text-sm"
        aria-label="Unit price"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add"}
      </Button>
    </form>
  );
}

function ItemRow({
  invoiceId,
  item,
  currency,
  editable,
}: {
  invoiceId: string;
  item: InvoiceItemRow;
  currency: string;
  editable: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      const result = await deleteInvoiceItem(invoiceId, item.id);
      if (result.ok) toast.success("Line item removed");
      else toast.error(result.error ?? "Failed to remove line item");
    });
  }

  return (
    <tr className="border-border/60 border-b last:border-0">
      <td className="py-2 pr-2">{item.description}</td>
      <td className="py-2 pr-2 text-right tabular-nums">{item.quantity}</td>
      <td className="py-2 pr-2 text-right tabular-nums">{formatMoney(item.unitPrice, currency)}</td>
      <td className="py-2 pr-2 text-right tabular-nums">
        {formatMoney(item.quantity * item.unitPrice, currency)}
      </td>
      {editable && (
        <td className="py-2 text-right">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Remove line item"
            onClick={onDelete}
            disabled={pending}
          >
            <Trash2 className="text-muted-foreground size-3.5" />
          </Button>
        </td>
      )}
    </tr>
  );
}

export function InvoiceItems({
  invoiceId,
  items,
  currency,
  total,
  editable = true,
}: {
  invoiceId: string;
  items: InvoiceItemRow[];
  currency: string;
  total: number;
  editable?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-border/60 border-b text-left text-xs">
              <th className="py-2 pr-2 font-medium">Description</th>
              <th className="py-2 pr-2 text-right font-medium">Qty</th>
              <th className="py-2 pr-2 text-right font-medium">Unit price</th>
              <th className="py-2 pr-2 text-right font-medium">Amount</th>
              {editable && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={editable ? 5 : 4} className="text-muted-foreground py-4 text-center">
                  No line items yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <ItemRow
                  key={item.id}
                  invoiceId={invoiceId}
                  item={item}
                  currency={currency}
                  editable={editable}
                />
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="py-2 pr-2" colSpan={3}>
                Total
              </td>
              <td className="py-2 pr-2 text-right tabular-nums">{formatMoney(total, currency)}</td>
              {editable && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {editable && <AddItemForm invoiceId={invoiceId} />}
    </div>
  );
}
