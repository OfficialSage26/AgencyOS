// Plan catalog for AgencyOS. Plain module (no server imports) so it can be used
// by both server actions and client components. Prices are display-only and
// should match what you configure on the Lemon Squeezy variants (store: PHP).

export type PlanId = "FREE" | "PRO" | "AGENCY";

export type PlanLimits = {
  // null = unlimited
  clients: number | null;
  projects: number | null;
};

export type PlanFlags = {
  ai: boolean;
  clientPortal: boolean;
  advancedAnalytics: boolean;
  team: boolean;
};

export type PlanDef = {
  id: PlanId;
  name: string;
  priceLabel: string;
  tagline: string;
  limits: PlanLimits;
  features: string[];
  flags: PlanFlags;
};

export const PLANS: Record<PlanId, PlanDef> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceLabel: "₱0",
    tagline: "For getting started",
    limits: { clients: 5, projects: 2 },
    features: ["Up to 5 clients", "Up to 2 projects", "Invoicing & appointments", "Client portal"],
    flags: { ai: false, clientPortal: true, advancedAnalytics: false, team: false },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceLabel: "₱499",
    tagline: "For growing freelancers",
    limits: { clients: null, projects: null },
    features: [
      "Unlimited clients & projects",
      "AI proposal & contract generators",
      "Invoicing, appointments & files",
      "Client portal",
    ],
    flags: { ai: true, clientPortal: true, advancedAnalytics: false, team: false },
  },
  AGENCY: {
    id: "AGENCY",
    name: "Agency",
    priceLabel: "₱1,499",
    tagline: "For teams & agencies",
    limits: { clients: null, projects: null },
    features: [
      "Everything in Pro",
      "Team members & assignment",
      "Advanced analytics",
      "Priority support",
    ],
    flags: { ai: true, clientPortal: true, advancedAnalytics: true, team: true },
  },
};

export const PLAN_ORDER: PlanId[] = ["FREE", "PRO", "AGENCY"];
export const PAID_PLANS: Exclude<PlanId, "FREE">[] = ["PRO", "AGENCY"];

export function limitFor(plan: PlanId, resource: keyof PlanLimits): number | null {
  return PLANS[plan].limits[resource];
}

export function isPlanId(value: string): value is PlanId {
  return value === "FREE" || value === "PRO" || value === "AGENCY";
}
