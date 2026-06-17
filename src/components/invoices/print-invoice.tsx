"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/validations/invoice";

type Party = { name: string; email?: string | null } | null;

export type PrintInvoiceData = {
  number: string;
  status: string;
  currency: string;
  issuedAt: string | null;
  dueDate: string | null;
  org: { name: string };
  client: Party;
  items: { id: string; description: string; quantity: number; unitPrice: number }[];
  total: number;
};

export function PrintInvoice({ data }: { data: PrintInvoiceData }) {
  // Open the browser print dialog automatically; the user picks "Save as PDF".
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="mb-10 flex items-start justify-between print:hidden">
          <span className="text-sm text-slate-500">Preview — use your browser to save as PDF</span>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print / Save as PDF
          </Button>
        </div>

        <header className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.org.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{data.number}</p>
            <p className="text-sm text-slate-500">{data.status}</p>
          </div>
        </header>

        <div className="mb-10 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-1 font-medium text-slate-500">Bill to</p>
            <p className="font-medium">{data.client?.name ?? "—"}</p>
            {data.client?.email && <p className="text-slate-500">{data.client.email}</p>}
          </div>
          <div className="text-right">
            <p>
              <span className="text-slate-500">Issued: </span>
              {data.issuedAt ?? "—"}
            </p>
            <p>
              <span className="text-slate-500">Due: </span>
              {data.dueDate ?? "—"}
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs text-slate-500">
              <th className="py-2 pr-2 font-medium">Description</th>
              <th className="py-2 pr-2 text-right font-medium">Qty</th>
              <th className="py-2 pr-2 text-right font-medium">Unit price</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2 pr-2">{item.description}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{item.quantity}</td>
                <td className="py-2 pr-2 text-right tabular-nums">
                  {formatMoney(item.unitPrice, data.currency)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatMoney(item.quantity * item.unitPrice, data.currency)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-base font-semibold">
              <td className="py-3" colSpan={3}>
                Total
              </td>
              <td className="py-3 text-right tabular-nums">
                {formatMoney(data.total, data.currency)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-16 text-center text-xs text-slate-400">Thank you for your business.</p>
      </div>
    </div>
  );
}
