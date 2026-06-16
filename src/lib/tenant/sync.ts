import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

export type TenantContext = {
  userId: string; // our DB User id
  clerkUserId: string;
  organizationId: string; // our DB Organization id
  clerkOrgId: string;
  role: Role;
};

// Clerk org roles ("org:admin" | "org:member") → our Role enum.
function mapClerkRole(role: string | null | undefined): Role {
  return role === "org:admin" ? "OWNER" : "MEMBER";
}

/**
 * Just-in-time provisioning: ensure the signed-in Clerk user, their active
 * organization, and their membership all exist in our database, then return
 * the tenant context. Returns `null` when there is no signed-in user or no
 * active organization (the caller should route to onboarding).
 *
 * Using sync-on-read keeps local development simple (no public webhook URL
 * required); a Clerk webhook can later mirror the same upserts for changes
 * that happen outside an authenticated request.
 */
export async function syncTenant(): Promise<TenantContext | null> {
  const { userId: clerkUserId, orgId: clerkOrgId, orgRole } = await auth();
  if (!clerkUserId || !clerkOrgId) return null;

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || null;
  const avatar = user?.imageUrl ?? null;

  const client = await clerkClient();
  const clerkOrg = await client.organizations.getOrganization({ organizationId: clerkOrgId });
  const slug = clerkOrg.slug ?? clerkOrgId;

  const dbUser = await db.user.upsert({
    where: { clerkUserId },
    create: { clerkUserId, email, name, avatar },
    update: { email, name, avatar },
  });

  const dbOrg = await db.organization.upsert({
    where: { clerkOrgId },
    create: { clerkOrgId, name: clerkOrg.name, slug },
    update: { name: clerkOrg.name, slug },
  });

  const role = mapClerkRole(orgRole);
  await db.membership.upsert({
    where: { userId_organizationId: { userId: dbUser.id, organizationId: dbOrg.id } },
    create: { userId: dbUser.id, organizationId: dbOrg.id, role },
    update: { role },
  });

  return {
    userId: dbUser.id,
    clerkUserId,
    organizationId: dbOrg.id,
    clerkOrgId,
    role,
  };
}
