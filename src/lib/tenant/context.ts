import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { forOrg } from "@/lib/tenant/scoped-db";
import { syncTenant, type TenantContext } from "@/lib/tenant/sync";

/**
 * Resolve the active tenant for the current request.
 *
 * Fast path: a single indexed lookup against our own database. Falls back to a
 * full just-in-time sync — which calls Clerk and writes records — only when the
 * tenant has not been provisioned yet (first visit after creating an org).
 *
 * Wrapped in React `cache()` so every component in a single render (layout +
 * page + nested) shares one lookup instead of re-querying.
 */
export const getTenant = cache(async (): Promise<TenantContext | null> => {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
  if (!clerkUserId || !clerkOrgId) return null;

  const membership = await db.membership.findFirst({
    where: { organization: { clerkOrgId }, user: { clerkUserId } },
    select: { role: true, organizationId: true, userId: true },
  });

  if (membership) {
    return {
      userId: membership.userId,
      clerkUserId,
      organizationId: membership.organizationId,
      clerkOrgId,
      role: membership.role,
    };
  }

  return syncTenant();
});

/** Like {@link getTenant} but throws when there is no active tenant. */
export async function requireTenant(): Promise<TenantContext> {
  const tenant = await getTenant();
  if (!tenant) {
    throw new Error("No active organization for the current request.");
  }
  return tenant;
}

/** Convenience: the org-scoped Prisma client for the active tenant. */
export async function requireTenantDb() {
  const tenant = await requireTenant();
  return { tenant, db: forOrg(tenant.organizationId) };
}
