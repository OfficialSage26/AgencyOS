import Link from "next/link";
import { BrandMark } from "@/components/marketing/brand-mark";

const links = ["Product", "Pricing", "Customers", "Docs", "Privacy"];

export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-[18px] px-7 py-11">
        <Link
          href="/"
          className="font-display flex items-center gap-2.5 text-[16px] font-bold"
        >
          <BrandMark className="size-[26px] rounded-lg" />
          AgencyOS
        </Link>
        <div className="text-muted-foreground flex gap-7 text-[14px] font-medium">
          {links.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="text-muted-foreground/70 text-[13px]">© 2026 AgencyOS, Inc.</div>
      </div>
    </footer>
  );
}
