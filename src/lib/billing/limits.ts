import { db } from "@/lib/db";
import type { ScopedDb } from "@/lib/tenant/scoped-db";
import { PLANS, limitFor, type PlanId, type PlanLimits } from "@/lib/billing/plans";

/** The active plan for an org (defaults to FREE). Looked up by the org's own id. */
export async function getOrgPlan(organizationId: string): Promise<PlanId> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true },
  });
  return (org?.plan as PlanId | undefined) ?? "FREE";
}

/**
 * Enforce a plan's resource cap before a create. Returns an error string when
 * the org is at/over the limit, otherwise null. Counts go through the scoped
 * client so they're already org-isolated.
 */
export async function planLimitError(
  orgDb: ScopedDb,
  organizationId: string,
  resource: keyof PlanLimits,
): Promise<string | null> {
  const plan = await getOrgPlan(organizationId);
  const limit = limitFor(plan, resource);
  if (limit === null) return null;

  const count =
    resource === "clients" ? await orgDb.client.count() : await orgDb.project.count();
  if (count >= limit) {
    return `Your ${PLANS[plan].name} plan is limited to ${limit} ${resource}. Upgrade to add more.`;
  }
  return null;
}
