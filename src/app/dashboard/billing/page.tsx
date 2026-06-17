import { Check } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantDb } from "@/lib/tenant/context";
import { getOrgPlan } from "@/lib/billing/limits";
import { isCheckoutConfigured } from "@/lib/billing/lemonsqueezy";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/billing/plans";
import { UpgradeButton } from "@/components/billing/upgrade-button";

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit === null ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          {used}
          {limit === null ? " · unlimited" : ` / ${limit}`}
        </span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full ${pct >= 100 ? "bg-rose-500" : "bg-primary"}`}
          style={{ width: `${limit === null ? 100 : pct}%`, opacity: limit === null ? 0.3 : 1 }}
        />
      </div>
    </div>
  );
}

export default async function BillingPage() {
  const { tenant, db } = await requireTenantDb();
  const [plan, clientCount, projectCount] = await Promise.all([
    getOrgPlan(tenant.organizationId),
    db.client.count(),
    db.project.count(),
  ]);

  const current = PLANS[plan];
  const configured: Record<PlanId, boolean> = {
    FREE: false,
    PRO: isCheckoutConfigured("PRO"),
    AGENCY: isCheckoutConfigured("AGENCY"),
  };

  return (
    <>
      <DashboardHeader title="Billing" />
      <main className="flex-1 px-4 py-8 md:px-6">
        <Card className="border-border/60 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your plan</CardTitle>
              <Badge variant="secondary">{current.name}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <UsageBar label="Clients" used={clientCount} limit={current.limits.clients} />
            <UsageBar label="Projects" used={projectCount} limit={current.limits.projects} />
          </CardContent>
        </Card>

        <h2 className="mb-4 text-lg font-semibold">Plans</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const p = PLANS[id];
            const isCurrent = id === plan;
            return (
              <Card
                key={id}
                className={`border-border/60 flex flex-col ${isCurrent ? "ring-primary ring-2" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-baseline justify-between">
                    <span>{p.name}</span>
                    <span className="text-2xl font-bold">
                      {p.priceLabel}
                      {id !== "FREE" && (
                        <span className="text-muted-foreground text-sm font-normal">/mo</span>
                      )}
                    </span>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">{p.tagline}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="mb-6 flex-1 space-y-2 text-sm">
                    {p.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="text-primary mt-0.5 size-4 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <UpgradeButton
                    plan={id}
                    label={`Upgrade to ${p.name}`}
                    configured={configured[id]}
                    current={isCurrent}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          Subscriptions are billed securely through Lemon Squeezy. Manage or cancel anytime.
        </p>
      </main>
    </>
  );
}
