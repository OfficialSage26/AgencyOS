import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="border-border/60 border-t">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-16 text-center sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to run your agency in one place?
          </h2>
          <p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl">
            Join freelancers and agencies replacing spreadsheets and scattered tools with AgencyOS.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" render={<Link href="/sign-up" />}>
            Start free today
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
