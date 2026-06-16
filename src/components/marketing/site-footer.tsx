import Link from "next/link";
import { Layers } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
            <Layers className="size-4" />
          </span>
          AgencyOS
        </Link>
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} AgencyOS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
