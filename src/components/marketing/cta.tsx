import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-7 pb-24">
      <div className="bg-aurora relative overflow-hidden rounded-3xl px-7 py-[72px] text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 60% at 80% 0%, rgba(255,255,255,0.18), transparent 70%)",
          }}
        />
        <div className="relative">
          <h2 className="font-display text-[clamp(30px,5vw,44px)] font-bold tracking-[-0.03em] text-white text-balance">
            Your agency, finally organized
          </h2>
          <p className="mx-auto mt-3.5 max-w-[480px] text-[18px] text-white/85">
            Join 4,000+ agencies running calmer on AgencyOS. Free to start.
          </p>
          <Link
            href="/sign-up"
            className="text-primary mt-[30px] inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-[16px] font-semibold transition-transform hover:scale-[1.02]"
          >
            Start free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
