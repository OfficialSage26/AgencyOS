"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  FolderKanban,
  FileText,
  CalendarClock,
  CreditCard,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/billing/plans";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** key into the badge counts passed from the server layout */
  badge?: "leads" | "invoices";
  disabled?: boolean;
};

type NavSection = { heading: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    heading: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/leads", label: "Leads", icon: KanbanSquare, badge: "leads" },
      { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
      { href: "/dashboard/invoices", label: "Invoices", icon: FileText, badge: "invoices" },
      { href: "/dashboard/appointments", label: "Appointments", icon: CalendarClock },
    ],
  },
  {
    heading: "Account",
    items: [{ href: "/dashboard/billing", label: "Billing", icon: CreditCard }],
  },
];

export type SidebarProps = {
  plan: PlanId;
  /** open leads (not won/lost) — drives the Leads badge */
  leadCount: number;
  /** overdue invoices — drives the Invoices badge */
  overdueCount: number;
};

export function DashboardSidebar({ plan, leadCount, overdueCount }: SidebarProps) {
  const pathname = usePathname();
  const badgeCounts: Record<"leads" | "invoices", number> = {
    leads: leadCount,
    invoices: overdueCount,
  };
  const badgeTone: Record<"leads" | "invoices", string> = {
    leads: "bg-primary/10 text-primary",
    invoices: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  };

  return (
    <aside className="border-border/60 bg-background hidden w-60 shrink-0 flex-col md:flex">
      <div className="flex h-16 items-center gap-2 px-6 font-semibold">
        <span className="bg-aurora shadow-aurora flex size-8 items-center justify-center rounded-lg text-white">
          <Layers className="size-4" />
        </span>
        <span className="tracking-tight">
          Agency<span className="text-aurora">OS</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.heading} className="flex flex-col gap-1">
            <div className="text-muted-foreground/70 px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider uppercase">
              {section.heading}
            </div>
            {section.items.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const count = item.badge ? badgeCounts[item.badge] : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium before:bg-primary before:absolute before:top-1.5 before:bottom-1.5 before:-left-px before:w-1 before:rounded-full before:content-['']"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                  {item.badge && count > 0 && (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                        badgeTone[item.badge],
                      )}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {plan === "FREE" && (
          <div className="bg-aurora shadow-aurora mt-auto rounded-2xl p-4 text-white">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="size-4" />
              Upgrade to Pro
            </div>
            <p className="mt-1.5 text-xs text-white/80">
              Unlock AI proposals and unlimited clients & projects.
            </p>
            <Link
              href="/dashboard/billing"
              className="text-primary mt-3 block rounded-lg bg-white py-2 text-center text-xs font-semibold transition-opacity hover:opacity-90"
            >
              See plans
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
