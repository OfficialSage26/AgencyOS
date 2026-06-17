"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/app/dashboard/billing/actions";
import type { PlanId } from "@/lib/billing/plans";

export function UpgradeButton({
  plan,
  label,
  configured,
  current,
}: {
  plan: PlanId;
  label: string;
  configured: boolean;
  current: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (current) {
    return (
      <Button variant="outline" disabled className="w-full">
        Current plan
      </Button>
    );
  }

  if (!configured) {
    return (
      <Button variant="outline" disabled className="w-full" title="Set up this product in Lemon Squeezy">
        Coming soon
      </Button>
    );
  }

  function onClick() {
    startTransition(async () => {
      const result = await startCheckout(plan);
      if (result.ok && result.redirectTo) {
        window.location.href = result.redirectTo;
      } else {
        toast.error(result.error ?? "Could not start checkout");
      }
    });
  }

  return (
    <Button className="w-full" onClick={onClick} disabled={pending}>
      {pending ? "Redirecting…" : label}
    </Button>
  );
}
