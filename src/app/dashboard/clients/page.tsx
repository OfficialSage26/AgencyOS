import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireTenantDb } from "@/lib/tenant/context";
import { ClientFormDialog, type ClientFormValues } from "@/components/clients/client-form-dialog";
import { ClientRowActions } from "@/components/clients/client-row-actions";
import { ClientsSearch } from "@/components/clients/clients-search";
import { formatDate } from "@/lib/format";

const statusBadge: Record<ClientFormValues["status"], string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  INACTIVE: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};

function NewClientButton() {
  return (
    <ClientFormDialog
      mode="create"
      triggerSize="sm"
      triggerChildren={
        <>
          <Plus className="size-4" />
          New client
        </>
      }
    />
  );
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const { db } = await requireTenantDb();

  const clients = await db.client.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <DashboardHeader title="Clients" />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <ClientsSearch initialQuery={query} />
          <NewClientButton />
        </div>

        {clients.length === 0 ? (
          <div className="border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <span className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
              <Users className="size-6" />
            </span>
            <h3 className="text-lg font-semibold">
              {query ? "No clients match your search" : "No clients yet"}
            </h3>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm text-sm">
              {query
                ? "Try a different name, email, or company."
                : "Add your first client to start tracking work, invoices, and conversations."}
            </p>
            {!query && <NewClientButton />}
          </div>
        ) : (
          <div className="border-border/60 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const values: ClientFormValues = {
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    phone: client.phone,
                    company: client.company,
                    notes: client.notes,
                    status: client.status,
                  };
                  return (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/clients/${client.id}`} className="hover:underline">
                          {client.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.company ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusBadge[client.status]}>
                          {client.status.charAt(0) + client.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(client.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ClientRowActions client={values} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  );
}
