const companies = ["Northwind", "Lumen Studio", "Foundry", "Apex Co", "Vela", "Birch & Bly"];

export function Logos() {
  return (
    <section className="mx-auto max-w-[1040px] px-7 pt-16 pb-4 text-center">
      <p className="text-muted-foreground text-[13px] font-semibold tracking-[0.08em] uppercase">
        Trusted by 4,000+ agencies worldwide
      </p>
      <div className="font-display mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[21px] font-bold tracking-tight text-muted-foreground/55">
        {companies.map((name) => (
          <span key={name} className="whitespace-nowrap">
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
