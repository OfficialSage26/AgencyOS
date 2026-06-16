import Link from "next/link";
import { Layers } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Layers className="size-4" />
          </span>
          AgencyOS
        </Link>

        <nav className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
              Sign in
            </Button>
            <Button size="sm" render={<Link href="/sign-up" />}>
              Get started
            </Button>
          </Show>
          <Show when="signed-in">
            <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
