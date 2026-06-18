/**
 * Bespoke, dependency-free dashboard charts. All server-rendered as pure SVG/CSS
 * so there's no client-side charting library and no extra JS on the wire.
 */

// --- shared helpers ---------------------------------------------------------

export function compactMoney(amount: number, currency = "PHP") {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  const symbol =
    { PHP: "₱", USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "$" }[currency] ?? `${currency} `;
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${symbol}${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// --- Revenue area chart -----------------------------------------------------

export function AreaChart({
  data,
  currency,
}: {
  data: { label: string; value: number }[];
  currency: string;
}) {
  const W = 760;
  const H = 240;
  const padX = 12;
  const padTop = 18;
  const padBottom = 34;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const pts = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = padTop + innerH * (1 - d.value / max);
    return { x, y, ...d };
  });
  const baseline = padTop + innerH;
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${padX},${baseline} ${line} ${(padX + innerW).toFixed(1)},${baseline}`;

  // Three horizontal guide lines.
  const guides = [0.25, 0.5, 0.75].map((g) => padTop + innerH * g);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue over time">
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {guides.map((y, i) => (
        <line
          key={i}
          x1={padX}
          x2={padX + innerW}
          y1={y}
          y2={y}
          className="stroke-border/60"
          strokeDasharray="3 5"
          strokeWidth={1}
        />
      ))}

      <polygon points={area} fill="url(#revFill)" />
      <polyline
        points={line}
        fill="none"
        className="stroke-primary"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {pts.map((p, i) => (
        <g key={i}>
          {i === pts.length - 1 && (
            <circle cx={p.x} cy={p.y} r={4.5} className="fill-primary stroke-background" strokeWidth={2} />
          )}
          <text
            x={p.x}
            y={H - 12}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            {p.label}
          </text>
        </g>
      ))}

      <text
        x={pts.at(-1)?.x ?? 0}
        y={(pts.at(-1)?.y ?? 0) - 12}
        textAnchor="end"
        className="fill-foreground text-[12px] font-semibold"
      >
        {compactMoney(pts.at(-1)?.value ?? 0, currency)}
      </text>
    </svg>
  );
}

// --- Donut chart ------------------------------------------------------------

export type DonutSegment = { label: string; value: number; color: string };

export function Donut({ segments, centerLabel, centerValue }: {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const size = 168;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Precompute each arc's length and starting offset without mutating state
  // during render (keeps the react-hooks/immutability rule happy).
  const arcs = segments.map((seg, i) => {
    const len = (seg.value / total) * c;
    const offset = segments
      .slice(0, i)
      .reduce((sum, prev) => sum + (prev.value / total) * c, 0);
    return { seg, len, offset };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="stroke-muted"
            strokeWidth={stroke}
          />
          {arcs.map(({ seg, len, offset }) => (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{centerValue}</span>
          <span className="text-muted-foreground text-xs">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-muted-foreground flex-1">{seg.label}</span>
            <span className="font-medium tabular-nums">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Pipeline funnel bars ---------------------------------------------------

export function FunnelBars({
  rows,
  currency,
}: {
  rows: { label: string; count: number; value: number; color: string }[];
  currency: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="tabular-nums">
              {row.count} · {compactMoney(row.value, currency)}
            </span>
          </div>
          <div className="bg-muted h-2.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(row.count / max) * 100}%`, background: row.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
