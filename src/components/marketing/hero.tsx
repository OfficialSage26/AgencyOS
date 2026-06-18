import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/marketing/brand-mark";

const navItems = [
  { label: "Dashboard", active: true },
  { label: "Clients", active: false },
  { label: "Pipeline", active: false },
  { label: "Projects", active: false },
  { label: "Invoices", active: false },
];

const stats = [
  { label: "Revenue", value: "$128.4k", note: "↑ 12.4% this month", noteClass: "text-emerald-600" },
  { label: "Open deals", value: "37", note: "$94k in pipeline", noteClass: "text-primary" },
  { label: "Active projects", value: "12", note: "4 due this week", noteClass: "text-muted-foreground" },
];

// Pipeline bar heights + whether each bar uses the accent gradient.
const bars: Array<{ h: number; accent: boolean }> = [
  { h: 46, accent: false },
  { h: 66, accent: false },
  { h: 54, accent: false },
  { h: 82, accent: true },
  { h: 70, accent: false },
  { h: 92, accent: true },
  { h: 60, accent: false },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-7 pt-24 text-center">
      <div className="aurora-glow pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      <div className="relative mx-auto max-w-[880px]">
        <div className="border-border bg-card text-primary inline-flex items-center gap-2.5 rounded-full border py-1.5 pr-3.5 pl-2 text-[13px] font-semibold shadow-sm">
          <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-0.5 text-[11.5px] tracking-wide">
            NEW
          </span>
          AI proposals that close themselves
        </div>

        <h1 className="font-display mt-6 text-[clamp(40px,7vw,68px)] leading-[1.04] font-bold tracking-[-0.035em] text-balance">
          Run your whole agency from{" "}
          <span className="text-aurora">one calm dashboard</span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-[580px] text-[19px] leading-relaxed text-pretty">
          Clients, pipeline, projects, invoicing and a client portal — replace five disconnected
          tools with a single operating system built for agencies.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="bg-aurora shadow-aurora border-0" render={<Link href="/sign-up" />}>
            Start free
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="#features" />}>
            Book a demo
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-[13.5px]">
          No credit card required · Free plan forever
        </p>
      </div>

      {/* Product UI showcase */}
      <div className="animate-aurora-float relative mx-auto mt-16 max-w-[1040px]">
        <div className="border-border/70 bg-card overflow-hidden rounded-[18px] border text-left shadow-[0_40px_80px_-40px_rgba(60,40,140,0.35),0_8px_24px_-12px_rgba(27,26,35,0.10)]">
          {/* Browser chrome */}
          <div className="border-border/60 bg-muted/40 flex items-center gap-1.5 border-b px-[18px] py-3.5">
            <span className="size-[11px] rounded-full bg-[#ff6058]" />
            <span className="size-[11px] rounded-full bg-[#ffbe2f]" />
            <span className="size-[11px] rounded-full bg-[#2aca44]" />
            <span className="text-muted-foreground ml-3.5 text-[12.5px] font-medium">
              app.agencyos.com/dashboard
            </span>
          </div>

          <div className="grid grid-cols-[200px_1fr]">
            {/* Sidebar */}
            <div className="border-border/60 bg-muted/30 hidden border-r p-[18px_14px] sm:block">
              <div className="font-display flex items-center gap-2 px-1.5 pb-4 text-[14px] font-bold">
                <BrandMark className="size-[22px] rounded-[7px]" />
                AgencyOS
              </div>
              <div className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className={
                      item.active
                        ? "bg-accent text-accent-foreground flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold"
                        : "text-muted-foreground flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium"
                    }
                  >
                    <span
                      className={
                        item.active
                          ? "bg-primary size-[7px] rounded-[2px]"
                          : "bg-border size-[7px] rounded-[2px]"
                      }
                    />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Main panel */}
            <div className="p-5 sm:p-[22px]">
              <div className="mb-[18px] flex items-center justify-between">
                <div>
                  <div className="font-display text-[18px] font-bold tracking-tight">
                    Good morning, Maya
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[12.5px]">
                    Here&apos;s what&apos;s happening across your agency
                  </div>
                </div>
                <span className="bg-foreground text-background rounded-lg px-3.5 py-2 text-[12px] font-semibold">
                  + New client
                </span>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="border-border/60 bg-card rounded-xl border p-3.5">
                    <div className="text-muted-foreground text-[11.5px] font-semibold tracking-wide uppercase">
                      {stat.label}
                    </div>
                    <div className="font-display mt-1.5 text-[24px] font-bold">{stat.value}</div>
                    <div className={`mt-0.5 text-[11.5px] font-semibold ${stat.noteClass}`}>
                      {stat.note}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-border/60 bg-card rounded-xl border p-4">
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="text-[13.5px] font-semibold">Pipeline</div>
                  <div className="text-muted-foreground text-[11.5px]">This quarter</div>
                </div>
                <div className="flex h-[84px] items-end gap-2.5">
                  {bars.map((bar, i) => (
                    <div key={i} className="flex h-full flex-1 flex-col justify-end">
                      <div
                        className={
                          bar.accent
                            ? "bg-aurora rounded-t-md"
                            : "bg-primary/25 rounded-t-md"
                        }
                        style={{ height: `${bar.h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
