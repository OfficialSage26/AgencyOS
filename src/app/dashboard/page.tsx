import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await currentUser();
  const greetingName = user?.firstName ?? user?.username ?? "there";

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-border/60 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <Layers className="size-4" />
            </span>
            AgencyOS
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {greetingName} 👋</h1>
        <p className="text-muted-foreground mt-1">
          This is your AgencyOS dashboard. Modules will appear here as they ship.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Total Revenue", "Active Clients", "Open Projects", "Pending Invoices"].map((label) => (
            <Card key={label} className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">—</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
