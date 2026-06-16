import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
        <Badge variant="secondary" className="mb-6">
          One platform for your whole agency
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Run your agency without the spreadsheet chaos
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty">
          AgencyOS replaces scattered tools with a single operating system: clients, leads,
          projects, invoicing, scheduling, a client portal, and AI-powered proposals — all in one
          dashboard.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/sign-up" />}>
            Start free
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="#features" />}>
            See features
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          No credit card required · Free plan forever
        </p>
      </div>
    </section>
  );
}
