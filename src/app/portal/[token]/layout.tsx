import { Layers } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 flex min-h-full flex-col">
      <header className="border-border/60 bg-background flex h-16 items-center justify-between border-b px-6">
        <span className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Layers className="size-4" />
          </span>
          Client Portal
        </span>
        <span className="text-muted-foreground text-xs">Powered by AgencyOS</span>
      </header>
      {children}
      <footer className="text-muted-foreground border-border/60 border-t px-6 py-4 text-center text-xs">
        This is a private, read-only view shared with you. Questions? Reply to your point of contact.
      </footer>
    </div>
  );
}
