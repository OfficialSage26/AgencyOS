/**
 * Pure organization-scoping logic for the multi-tenancy choke point.
 * Kept free of any Prisma/runtime imports so it can be unit-tested in
 * isolation. See `scoped-db.ts` for how this is wired into Prisma.
 */

// Models that carry `organizationId` directly and must be tenant-scoped.
export const TENANT_MODELS = new Set([
  "Subscription",
  "Membership",
  "Client",
  "Lead",
  "Activity",
  "Project",
  "Invoice",
  "Appointment",
  "Conversation",
  "Message",
  "File",
  "Notification",
  "AiDocument",
]);

// Operations that filter rows through a `where` clause.
export const WHERE_OPERATIONS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "updateMany",
  "deleteMany",
]);

// Operations that target a single row by unique key — unsafe to auto-scope.
export const UNSCOPABLE_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "update",
  "delete",
  "upsert",
]);

const SCOPED_ALTERNATIVE: Record<string, string> = {
  findUnique: "findFirst",
  findUniqueOrThrow: "findFirstOrThrow",
  update: "updateMany",
  delete: "deleteMany",
  upsert: "create / updateMany",
};

export type AnyArgs = Record<string, unknown> & {
  where?: Record<string, unknown>;
  data?: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Apply organization scoping to a single Prisma operation's arguments.
 * Throws for operations that cannot be safely scoped.
 */
export function scopeArgs(
  model: string,
  operation: string,
  args: AnyArgs | undefined,
  organizationId: string,
): AnyArgs {
  const next: AnyArgs = { ...(args ?? {}) };

  if (!TENANT_MODELS.has(model)) {
    return next;
  }

  if (UNSCOPABLE_OPERATIONS.has(operation)) {
    throw new Error(
      `[tenant] ${operation} is not allowed on org-scoped model "${model}". ` +
        `Use ${SCOPED_ALTERNATIVE[operation]} so tenant isolation is enforced.`,
    );
  }

  if (WHERE_OPERATIONS.has(operation)) {
    next.where = { ...(next.where ?? {}), organizationId };
    return next;
  }

  if (operation === "create") {
    next.data = { ...((next.data as Record<string, unknown>) ?? {}), organizationId };
    return next;
  }

  if (operation === "createMany") {
    const rows = Array.isArray(next.data) ? next.data : [next.data ?? {}];
    next.data = rows.map((row) => ({ ...(row as Record<string, unknown>), organizationId }));
    return next;
  }

  return next;
}
