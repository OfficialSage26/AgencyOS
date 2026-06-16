import { db } from "@/lib/db";
import { scopeArgs, type AnyArgs } from "@/lib/tenant/scope-args";

/**
 * Multi-tenancy choke point.
 *
 * `forOrg(organizationId)` returns a Prisma client whose queries are
 * automatically scoped to a single organization. This is the single place
 * tenant isolation is enforced — application code should never filter by
 * `organizationId` by hand.
 *
 * Safe surface (auto-scoped):
 *   - reads/lists:    findFirst, findFirstOrThrow, findMany, count,
 *                     aggregate, groupBy
 *   - bulk mutations: updateMany, deleteMany
 *   - creates:        create, createMany
 *
 * Deliberately unsupported (they target a row by a unique key, where an
 * `organizationId` filter cannot be injected without silently leaking across
 * tenants): findUnique, update, delete, upsert. Use the scoped equivalents
 * (e.g. `findFirst({ where: { id } })`, `updateMany`, `deleteMany`).
 */
export function forOrg(organizationId: string) {
  if (!organizationId) {
    throw new Error("[tenant] forOrg requires a non-empty organizationId");
  }

  return db.$extends({
    name: "org-scope",
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          const scoped = scopeArgs(model, operation, args as AnyArgs, organizationId);
          return query(scoped);
        },
      },
    },
  });
}

export type ScopedDb = ReturnType<typeof forOrg>;
