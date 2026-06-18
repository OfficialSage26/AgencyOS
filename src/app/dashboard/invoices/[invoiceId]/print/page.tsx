import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireTenant } from "@/lib/tenant/context";
import { forOrg } from "@/lib/tenant/scoped-db";
import { PrintInvoice, type PrintInvoiceData } from "@/components/invoices/print-invoice";
import { formatDate } from "@/lib/format";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const tenant = await requireTenant();
  const orgDb = forOrg(tenant.organizationId);

  const [invoice, organization] = await Promise.all([
    orgDb.invoice.findFirst({
      where: { id: invoiceId },
      include: {
        client: { select: { name: true, email: true } },
        items: { orderBy: { id: "asc" } },
      },
    }),
    // The tenant's own organization — looked up by the id resolved from the session.
    db.organization.findUnique({ where: { id: tenant.organizationId }, select: { name: true } }),
  ]);
  if (!invoice) notFound();

  const items = invoice.items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));

  const data: PrintInvoiceData = {
    number: invoice.number,
    status: invoice.status,
    currency: invoice.currency,
    issuedAt: invoice.issuedAt ? formatDate(invoice.issuedAt) : null,
    dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : null,
    org: { name: organization?.name ?? "AgencyOS" },
    client: invoice.client,
    items,
    total: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  };

  return <PrintInvoice data={data} />;
}
