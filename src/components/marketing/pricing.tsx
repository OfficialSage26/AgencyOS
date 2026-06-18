import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER } from "@/config/plans";

const ctaLabel: Record<string, string> = {
  FREE: "Get started",
  PRO: "Start free trial",
  AGENCY: "Contact sales",
};

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-7 py-[90px]">
      <div className="mx-auto mb-[52px] max-w-[560px] text-center">
        <h2 className="font-display text-[clamp(30px,5vw,42px)] font-bold tracking-[-0.03em] text-balance">
          Simple, honest pricing
        </h2>
        <p className="text-muted-foreground mt-3.5 text-[17px]">
          Start free. Upgrade when your agency grows. Cancel anytime.
        </p>
      </div>

      <div className="grid items-start gap-[18px] lg:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const highlighted = plan.highlighted;
          return (
            <div
              key={plan.id}
              className={cn(
                "bg-card relative rounded-[18px] border p-[30px]",
                highlighted
                  ? "border-primary shadow-aurora border-[1.5px]"
                  : "border-border/70",
              )}
            >
              {highlighted && (
                <span className="bg-aurora absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-[5px] text-[12px] font-semibold text-white">
                  MOST POPULAR
                </span>
              )}
              <div
                className={cn(
                  "text-[16px] font-semibold",
                  highlighted ? "text-primary" : "text-muted-foreground",
                )}
              >
                {plan.name}
              </div>
              <div className="mt-3">
                <span className="font-display text-[46px] font-bold tracking-[-0.03em]">
                  ${plan.priceMonthly}
                </span>
                <span className="text-muted-foreground text-[15px]">/mo</span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-[14px]">{plan.description}</p>

              <div className="bg-border/70 my-[22px] h-px" />

              <ul className="flex flex-col gap-[11px] text-[14px]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={cn(
                  "mt-[26px] block rounded-[11px] py-3 text-center text-[14.5px] font-semibold transition-opacity hover:opacity-90",
                  highlighted
                    ? "bg-aurora shadow-aurora text-white"
                    : "border-border text-foreground border",
                )}
              >
                {ctaLabel[plan.id] ?? "Get started"}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
