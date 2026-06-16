import type { Plan } from "@/generated/prisma/enums";

/**
 * Single source of truth for subscription plans: marketing copy, pricing, and
 * the enforced usage limits. `null` for a limit means "unlimited".
 */
export type PlanLimits = {
  clients: number | null;
  projects: number | null;
  aiFeatures: boolean;
  teamManagement: boolean;
  clientPortal: boolean;
  advancedAnalytics: boolean;
};

export type PlanConfig = {
  id: Plan;
  name: string;
  description: string;
  priceMonthly: number;
  highlighted: boolean;
  features: string[];
  limits: PlanLimits;
};

export const PLANS: Record<Plan, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    description: "For freelancers just getting started.",
    priceMonthly: 0,
    highlighted: false,
    features: ["Up to 5 clients", "Up to 2 projects", "CRM & lead pipeline", "Basic invoicing"],
    limits: {
      clients: 5,
      projects: 2,
      aiFeatures: false,
      teamManagement: false,
      clientPortal: false,
      advancedAnalytics: false,
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "For growing freelancers and solo operators.",
    priceMonthly: 29,
    highlighted: true,
    features: [
      "Unlimited clients",
      "Unlimited projects",
      "AI proposals, contracts & follow-ups",
      "Invoicing with PDF export",
      "Appointment scheduling",
    ],
    limits: {
      clients: null,
      projects: null,
      aiFeatures: true,
      teamManagement: false,
      clientPortal: false,
      advancedAnalytics: false,
    },
  },
  AGENCY: {
    id: "AGENCY",
    name: "Agency",
    description: "For teams running multiple clients at scale.",
    priceMonthly: 79,
    highlighted: false,
    features: [
      "Everything in Pro",
      "Team management & roles",
      "Client portal",
      "Advanced analytics",
    ],
    limits: {
      clients: null,
      projects: null,
      aiFeatures: true,
      teamManagement: true,
      clientPortal: true,
      advancedAnalytics: true,
    },
  },
};

export const PLAN_ORDER: Plan[] = ["FREE", "PRO", "AGENCY"];
