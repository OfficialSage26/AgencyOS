import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/marketing/brand-mark";

const navLinks = [
  { href: "#features", label: "Product" },
  { href: "#testimonials", label: "Customers" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "Docs" },
];

export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-7">
        <Link
          href="/"
          className="font-display flex items-center gap-2.5 text-[18px] font-bold tracking-tight"
        >
          <BrandMark className="size-[30px] rounded-[9px]" />
          AgencyOS
        </Link>

        <nav className="text-muted-foreground hidden items-center gap-[34px] text-[14.5px] font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
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
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90"
              render={<Link href="/sign-up" />}
            >
              Start free
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
