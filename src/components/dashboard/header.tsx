import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader({ title }: { title?: string }) {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur md:px-6">
      <h1 className="truncate text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
        />
        <UserButton />
      </div>
    </header>
  );
}
