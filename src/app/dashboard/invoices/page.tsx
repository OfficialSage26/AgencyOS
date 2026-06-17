import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireTenantDb } from "@/lib/tenant/context";
import { InvoiceFormDialog } from "@/components/invoices/invoice-form-dialog";
import {
  INVOICE_STATUS_LABELS,
  formatMoney,
  type InvoiceStatus,
} from "@/lib/validations/invoice";

const statusBadge: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SENT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default async function InvoicesPage() {
  const { db } = await requireTenantDb();

  const [invoices, clients] = await Promise.all([
    db.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true } } },
    }),
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const outstanding = invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <>
      <DashboardHeader title="Invoices" />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">Bill clients and track payments.</p>
            {outstanding > 0 && (
              <p className="mt-1 text-sm font-medium">
                {formatMoney(outstanding, invoices[0]?.currency ?? "USD")} outstanding
              </p>
            )}
          </div>
          <InvoiceFormDialog
            mode="create"
            clients={clients}
            triggerSize="sm"
            triggerChildren={
              <>
                <Plus className="size-4" />
                New invoice
              </>
            }
          />
        </div>

        {invoices.length === 0 ? (
          <div className="border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <span className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
              <FileText className="size-6" />
            </span>
            <h3 className="text-lg font-semibold">No invoices yet</h3>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm text-sm">
              Create your first invoice, add line items, and export it as a PDF.
            </p>
            <InvoiceFormDialog
              mode="create"
              clients={clients}
              triggerSize="sm"
              triggerChildren={
                <>
                  <Plus className="size-4" />
                  New invoice
                </>
              }
            />
          </div>
        ) : (
          <Card className="border-border/60">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-border/60 border-b text-left text-xs">
                    <th className="px-4 py-3 font-medium">Number</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-border/60 hover:bg-muted/40 border-b transition-colors last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="hover:underline">
                          {invoice.number}
                        </Link>
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {invoice.client?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={statusBadge[invoice.status]}>
                          {INVOICE_STATUS_LABELS[invoice.status]}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {invoice.dueDate ? invoice.dueDate.toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatMoney(Number(invoice.amount), invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
