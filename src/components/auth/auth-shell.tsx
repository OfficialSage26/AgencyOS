import { cn } from "@/lib/utils";

/**
 * White logo mark for the dark brand panel — the inverse of the app's
 * indigo BrandMark (white tile, light-violet triangle, indigo "A").
 */
function WhiteMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden rounded-[10px]", className)}>
      <svg viewBox="0 0 52 52" width="100%" height="100%" fill="none" aria-hidden="true">
        <rect width="52" height="52" fill="#fff" />
        <polygon points="0,52 52,0 52,52" fill="#d9c8ff" />
        <polygon points="26,14 38,38 14,38" fill="#5b3fe0" />
        <rect x="21" y="32" width="10" height="6" fill="#fff" />
      </svg>
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-2xl font-bold tracking-tight">{value}</dt>
      <dd className="mt-0.5 text-[12.5px] text-white/70">{label}</dd>
    </div>
  );
}

/** Left brand panel — gradient, glass testimonial, trust stats. Desktop only. */
function AuthBrandPanel() {
  return (
    <div
      className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
      style={{ background: "linear-gradient(155deg,#5b3fe0,#7d4cff 48%,#a259ff)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-36 -right-32 size-[440px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(255,255,255,0.18),transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 size-[420px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(57,230,196,0.16),transparent 65%)" }}
      />

      <div className="font-display relative flex items-center gap-3 text-xl font-bold tracking-tight">
        <WhiteMark className="size-9" />
        AgencyOS
      </div>

      <div className="relative">
        <h2 className="font-display max-w-[420px] text-[40px] leading-[1.08] font-bold tracking-tight text-balance">
          One calm dashboard for your whole agency.
        </h2>
        <p className="mt-[18px] max-w-[400px] text-base leading-relaxed text-white/80">
          Clients, pipeline, projects, invoicing and AI — sign in to pick up right where your team
          left off.
        </p>

        <figure className="animate-aurora-float mt-[34px] max-w-[430px] rounded-[18px] border border-white/20 bg-white/10 p-[22px] backdrop-blur">
          <blockquote className="text-[15px] leading-relaxed">
            &ldquo;We killed four subscriptions in our first week. Everything our team needs now
            lives in one tab.&rdquo;
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <span
              className="size-9 rounded-full"
              style={{ background: "linear-gradient(135deg,#fff,#d9c8ff)" }}
            />
            <span className="leading-tight">
              <span className="block text-[13.5px] font-semibold">Maya Okonkwo</span>
              <span className="block text-xs text-white/70">Founder, Lumen Studio</span>
            </span>
          </figcaption>
        </figure>
      </div>

      <dl className="relative flex gap-9">
        <Stat value="4,000+" label="agencies" />
        <Stat value="$1.2B" label="invoiced" />
        <Stat value="4.9/5" label="rating" />
      </dl>
    </div>
  );
}

/**
 * Split-screen auth layout: brand panel on the left (desktop), the Clerk
 * form centered on the right with a persistent footer line.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <AuthBrandPanel />
      <div className="relative flex flex-col px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <p className="text-muted-foreground mt-8 text-center text-xs">
          © 2026 AgencyOS, Inc. · Free plan forever
        </p>
      </div>
    </div>
  );
}
