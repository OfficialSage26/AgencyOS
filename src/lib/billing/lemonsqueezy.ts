import "server-only";
import type { PlanId } from "@/lib/billing/plans";

/**
 * Minimal Lemon Squeezy client for creating subscription checkouts. Server-only
 * (uses the secret API key). Variant IDs come from env so no code change is
 * needed once the products exist in the LS dashboard.
 */

const API = "https://api.lemonsqueezy.com/v1";
const KEY = (process.env.LEMONSQUEEZY_API_KEY ?? "").replace(/^["']|["']$/g, "");
const STORE_ID = (process.env.LEMONSQUEEZY_STORE_ID ?? "").replace(/^["']|["']$/g, "");

const VARIANT_BY_PLAN: Record<Exclude<PlanId, "FREE">, string> = {
  PRO: (process.env.LEMONSQUEEZY_VARIANT_PRO ?? "").replace(/^["']|["']$/g, ""),
  AGENCY: (process.env.LEMONSQUEEZY_VARIANT_AGENCY ?? "").replace(/^["']|["']$/g, ""),
};

/** True when this paid plan has a variant id configured and is checkout-ready. */
export function isCheckoutConfigured(plan: Exclude<PlanId, "FREE">): boolean {
  return Boolean(KEY && STORE_ID && VARIANT_BY_PLAN[plan]);
}

export async function createCheckoutUrl(opts: {
  plan: Exclude<PlanId, "FREE">;
  email: string;
  organizationId: string;
  userId: string;
  redirectUrl: string;
}): Promise<string> {
  const variantId = VARIANT_BY_PLAN[opts.plan];
  if (!KEY || !STORE_ID || !variantId) {
    throw new Error("Billing is not configured for this plan yet.");
  }

  const res = await fetch(`${API}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: opts.email || undefined,
            // Echoed back on webhooks so we can map the subscription to the org.
            custom: { organization_id: opts.organizationId, user_id: opts.userId },
          },
          product_options: { redirect_url: opts.redirectUrl },
        },
        relationships: {
          store: { data: { type: "stores", id: STORE_ID } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Could not start checkout (${res.status}): ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as { data?: { attributes?: { url?: string } } };
  const url = json.data?.attributes?.url;
  if (!url) throw new Error("Checkout response did not include a URL.");
  return url;
}
