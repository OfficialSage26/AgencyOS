"use server";

import { headers } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { requireTenant } from "@/lib/tenant/context";
import { type ActionState } from "@/lib/forms";
import { createCheckoutUrl, isCheckoutConfigured } from "@/lib/billing/lemonsqueezy";
import { isPlanId, type PlanId } from "@/lib/billing/plans";

export async function startCheckout(plan: string): Promise<ActionState> {
  if (!isPlanId(plan) || plan === "FREE") {
    return { ok: false, error: "Choose a paid plan." };
  }
  const paidPlan = plan as Exclude<PlanId, "FREE">;
  if (!isCheckoutConfigured(paidPlan)) {
    return { ok: false, error: "This plan isn't available for checkout yet." };
  }

  const tenant = await requireTenant();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const proto =
    headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const redirectUrl = host ? `${proto}://${host}/dashboard/billing?upgraded=1` : "";

  try {
    const url = await createCheckoutUrl({
      plan: paidPlan,
      email,
      organizationId: tenant.organizationId,
      userId: tenant.userId,
      redirectUrl,
    });
    return { ok: true, redirectTo: url };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not start checkout.",
    };
  }
}
