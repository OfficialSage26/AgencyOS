import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import type { PlanId } from "@/lib/billing/plans";

// Lemon Squeezy → app sync. Verifies the HMAC signature, then maps subscription
// events onto Organization.plan + the Subscription record. Set
// LEMONSQUEEZY_WEBHOOK_SECRET (and point an LS webhook at /api/webhooks/lemonsqueezy)
// to enable; until then this safely no-ops.

const SECRET = (process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "").replace(/^["']|["']$/g, "");
const VARIANT_PRO = (process.env.LEMONSQUEEZY_VARIANT_PRO ?? "").replace(/^["']|["']$/g, "");
const VARIANT_AGENCY = (process.env.LEMONSQUEEZY_VARIANT_AGENCY ?? "").replace(/^["']|["']$/g, "");

function verifySignature(raw: string, signature: string | null): boolean {
  if (!signature) return false;
  const digest = createHmac("sha256", SECRET).update(raw).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

function planFromVariant(variantId: string | null): PlanId | null {
  if (!variantId) return null;
  if (variantId === VARIANT_AGENCY) return "AGENCY";
  if (variantId === VARIANT_PRO) return "PRO";
  return null;
}

const STATUS_MAP: Record<string, "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED"> = {
  active: "ACTIVE",
  on_trial: "TRIALING",
  paused: "PAST_DUE",
  past_due: "PAST_DUE",
  unpaid: "PAST_DUE",
  cancelled: "CANCELED",
  expired: "CANCELED",
};

export async function POST(request: Request) {
  if (!SECRET) {
    // Not configured yet — acknowledge so LS doesn't retry forever.
    return new Response("Webhook not configured", { status: 200 });
  }

  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: {
    meta?: { event_name?: string; custom_data?: { organization_id?: string } };
    data?: {
      id?: string;
      attributes?: { status?: string; variant_id?: number | string; renews_at?: string | null };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const eventName = event.meta?.event_name ?? "";
  const organizationId = event.meta?.custom_data?.organization_id;
  if (!organizationId || !eventName.startsWith("subscription_")) {
    return new Response("Ignored", { status: 200 });
  }

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  });
  if (!org) return new Response("Unknown org", { status: 200 });

  const attrs = event.data?.attributes ?? {};
  const lsStatus = attrs.status ?? "";
  const variantId = attrs.variant_id != null ? String(attrs.variant_id) : null;
  const status = STATUS_MAP[lsStatus] ?? "ACTIVE";
  const canceled = status === "CANCELED";
  const plan: PlanId = canceled ? "FREE" : (planFromVariant(variantId) ?? "PRO");
  const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;

  await db.organization.update({ where: { id: organizationId }, data: { plan } });
  await db.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      stripeSubscriptionId: event.data?.id ?? null,
      stripePriceId: variantId,
      plan,
      status,
      currentPeriodEnd: renewsAt,
    },
    update: {
      stripeSubscriptionId: event.data?.id ?? null,
      stripePriceId: variantId,
      plan,
      status,
      currentPeriodEnd: renewsAt,
    },
  });

  return new Response("ok", { status: 200 });
}
