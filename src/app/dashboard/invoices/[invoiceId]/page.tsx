import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantDb } from "@/lib/tenant/context";
import {
  InvoiceFormDialog,
  type InvoiceFormValues,
} from "@/components/invoices/invoice-form-dialog";
import { InvoiceItems, type InvoiceItemRow } from "@/components/invoices/invoice-items";
import { InvoiceStatusSelect } from "@/components/invoices/invoice-status-select";
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";
import { formatMoney, type Currency } from "@/lib/validations/invoice";
import { formatDate } from "@/lib/format";

const toDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const { db } = await requireTenantDb();

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId },
    include: {
      client: { select: { name: true, email: true } },
      items: { orderBy: { id: "asc" } },
    },
  });
  if (!invoice) notFound();

  const clients = await db.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const items: InvoiceItemRow[] = invoice.items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const formValues: InvoiceFormValues = {
    id: invoice.id,
    clientId: invoice.clientId,
    currency: invoice.currency as Currency,
    status: invoice.status,
    issuedAt: toDateInput(invoice.issuedAt),
    dueDate: toDateInput(invoice.dueDate),
  };

  return (
    <>
      <DashboardHeader title={invoice.number} />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" render={<Link href="/dashboard/invoices" />}>
            <ArrowLeft className="size-4" />
            Back to invoices
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/dashboard/invoices/${invoice.id}/print`} target="_blank" />}
            >
              <Printer className="size-4" />
              Export PDF
            </Button>
            <InvoiceFormDialog
              mode="edit"
              invoice={formValues}
              clients={clients}
              triggerVariant="outline"
              triggerSize="sm"
              triggerChildren={
                <>
                  <Pencil className="size-4" />
                  Edit
                </>
              }
            />
            <DeleteInvoiceButton invoiceId={invoice.id} invoiceNumber={invoice.number} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 lg:col-span-1">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-2">
                <span className="text-muted-foreground text-xs">Status</span>
                <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} />
              </div>
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="text-muted-foreground">Client</dt>
                <dd className="text-right">{invoice.client?.name ?? "—"}</dd>
                <dt className="text-muted-foreground">Currency</dt>
                <dd className="text-right">{invoice.currency}</dd>
                <dt className="text-muted-foreground">Issued</dt>
                <dd className="text-right">
                  {invoice.issuedAt ? formatDate(invoice.issuedAt) : "—"}
                </dd>
                <dt className="text-muted-foreground">Due</dt>
                <dd className="text-right">{invoice.dueDate ? formatDate(invoice.dueDate) : "—"}</dd>
                <dt className="text-muted-foreground">Total</dt>
                <dd className="text-right font-semibold">{formatMoney(total, invoice.currency)}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card className="border-border/60 lg:col-span-2">
            <CardHeader>
              <CardTitle>Line items</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceItems
                invoiceId={invoice.id}
                items={items}
                currency={invoice.currency}
                total={total}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
