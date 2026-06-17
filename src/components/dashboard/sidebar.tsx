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
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/leads", label: "Leads", icon: KanbanSquare },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarClock },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border/60 bg-background hidden w-60 shrink-0 border-r md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 px-6 font-semibold">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
          <Layers className="size-4" />
        </span>
        AgencyOS
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="text-muted-foreground/50 flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm"
                title="Coming soon"
              >
                <item.icon className="size-4" />
                {item.label}
                <span className="bg-muted text-muted-foreground ml-auto rounded px-1.5 py-0.5 text-[10px]">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
