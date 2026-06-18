const testimonials = [
  {
    quote:
      "We killed four subscriptions in our first week. Everything our team needs now lives in one tab.",
    name: "Maya Okonkwo",
    role: "Founder, Lumen Studio",
  },
  {
    quote:
      "The AI proposals alone save me a full day every week. It writes the first draft, I just refine it.",
    name: "Dev Sharma",
    role: "Director, Apex Co",
  },
  {
    quote:
      "Our clients love the portal. They finally stopped emailing us for invoice copies and status updates.",
    name: "Tara Lindqvist",
    role: "Ops Lead, Foundry",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="border-border/60 bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-7 py-[84px]">
        <h2 className="font-display mb-12 text-center text-[clamp(28px,4.5vw,38px)] font-bold tracking-[-0.03em] text-balance">
          Agencies run calmer on AgencyOS
        </h2>
        <div className="grid gap-[18px] md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="border-border/70 bg-card rounded-2xl border p-[26px]"
            >
              <blockquote className="text-foreground/90 text-[15.5px] leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="bg-aurora size-[38px] rounded-full" />
                <div>
                  <div className="text-[14px] font-semibold">{t.name}</div>
                  <div className="text-muted-foreground text-[12.5px]">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
