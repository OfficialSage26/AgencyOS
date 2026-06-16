import {
  Users,
  KanbanSquare,
  FolderKanban,
  FileText,
  CalendarClock,
  FolderUp,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "CRM",
    description: "Manage clients, notes, and a full activity timeline in one organized place.",
  },
  {
    icon: KanbanSquare,
    title: "Lead pipeline",
    description: "Track deals from New to Won on a drag-and-drop Kanban board.",
  },
  {
    icon: FolderKanban,
    title: "Projects & tasks",
    description: "Assign team members, track tasks, and watch progress in real time.",
  },
  {
    icon: FileText,
    title: "Invoicing",
    description: "Create line-item invoices, export PDFs, and track payments.",
  },
  {
    icon: CalendarClock,
    title: "Scheduling",
    description: "Share a booking page, manage availability, and send reminders.",
  },
  {
    icon: FolderUp,
    title: "File sharing",
    description: "Organize files in project folders and share them with clients.",
  },
  {
    icon: LayoutDashboard,
    title: "Client portal",
    description: "Give clients their own dashboard for progress, invoices, and messages.",
  },
  {
    icon: Sparkles,
    title: "AI generators",
    description: "Draft proposals, contracts, and follow-ups in seconds with AI.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-border/60 bg-muted/30 border-t">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to run the business
          </h2>
          <p className="text-muted-foreground mt-4">
            Stop stitching together five different tools. AgencyOS brings your whole workflow under
            one roof.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/60">
              <CardHeader>
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <feature.icon className="size-5" />
                </span>
                <CardTitle className="pt-2 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
