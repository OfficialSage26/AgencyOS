import {
  KanbanSquare,
  FolderKanban,
  FileText,
  LayoutDashboard,
  CalendarClock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  highlighted?: boolean;
};

const features: Feature[] = [
  {
    icon: KanbanSquare,
    title: "CRM & pipeline",
    description: "Track every client and move deals New → Won on a drag-and-drop board.",
  },
  {
    icon: FolderKanban,
    title: "Projects & tasks",
    description: "Assign team members, track tasks, and watch progress update in real time.",
  },
  {
    icon: FileText,
    title: "Invoicing",
    description: "Build line-item invoices, export clean PDFs, and track every payment.",
  },
  {
    icon: LayoutDashboard,
    title: "Client portal",
    description: "Give clients their own dashboard for progress, invoices, and messages.",
  },
  {
    icon: CalendarClock,
    title: "Scheduling",
    description: "Share a booking page, manage availability, and auto-send reminders.",
  },
  {
    icon: Sparkles,
    title: "AI generators",
    description: "Draft proposals, contracts, and follow-ups in seconds — then edit and send.",
    highlighted: true,
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-7 py-[90px]">
      <div className="mx-auto mb-14 max-w-[620px] text-center">
        <p className="text-primary text-[13px] font-bold tracking-[0.06em] uppercase">
          Everything in one place
        </p>
        <h2 className="font-display mt-3 text-[clamp(30px,5vw,42px)] font-bold tracking-[-0.03em] text-balance">
          Stop stitching tools together
        </h2>
        <p className="text-muted-foreground mt-3.5 text-[17px] leading-relaxed">
          From first lead to final invoice, every part of the agency workflow lives under one roof.
        </p>
      </div>

      <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          if (feature.highlighted) {
            return (
              <div
                key={feature.title}
                className="bg-aurora rounded-2xl p-[26px] text-white"
              >
                <span className="flex size-[42px] items-center justify-center rounded-[11px] bg-white/20">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-[18px] font-semibold">{feature.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/85">
                  {feature.description}
                </p>
              </div>
            );
          }
          return (
            <div
              key={feature.title}
              className="border-border/70 bg-card rounded-2xl border p-[26px] transition-shadow hover:shadow-md"
            >
              <span className="bg-accent text-primary flex size-[42px] items-center justify-center rounded-[11px]">
                <Icon className="size-5" />
              </span>
              <h3 className="font-display mt-4 text-[18px] font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-[14.5px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
