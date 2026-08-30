import { translateStatusLabel } from "@/lib/i18n/intelligence-labels";
import type { PriceHistoryPoint } from "@/types/intelligence";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    notEnough: "Not enough price-history evidence to draw a trend.",
    ariaLabel: "Illustrative price per square foot history",
    footnote: "AED per sqft. Demo points remain visibly labelled until a permitted production data source is connected.",
  },
  fr: {
    notEnough: "Pas assez d'historique de prix pour tracer une tendance.",
    ariaLabel: "Historique illustratif du prix au pied carré",
    footnote: "AED par pi². Les points de démonstration restent visiblement identifiés tant qu'une source de données de production autorisée n'est pas connectée.",
  },
} as const;

const DATE_LOCALES: Record<KeyHoldLocale, string> = { en: "en-GB", fr: "fr-FR" };

export function PriceHistoryChart({ points, locale = "en" }: { points: PriceHistoryPoint[]; locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  if (points.length < 2) {
    return <p className="text-sm text-[var(--color-stone)]">{copy.notEnough}</p>;
  }

  const width = 620;
  const height = 220;
  const padX = 38;
  const padY = 28;
  const values = points.map((item) => item.pricePerSqftAed);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const coords = points.map((item, index) => {
    const x = padX + (index / Math.max(1, points.length - 1)) * (width - padX * 2);
    const y = height - padY - ((item.pricePerSqftAed - min) / range) * (height - padY * 2);
    return { x, y, item };
  });
  const polyline = coords.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={copy.ariaLabel} className="w-full">
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="rgba(23,23,23,0.14)" />
        <polyline points={polyline} fill="none" stroke="var(--color-teal)" strokeWidth="2.5" />
        {coords.map(({ x, y, item }) => (
          <g key={item.date}>
            <circle cx={x} cy={y} r="4.5" fill="var(--color-sage)" />
            <text x={x} y={Math.max(14, y - 12)} textAnchor="middle" fontSize="11" fill="var(--color-graphite)">{Math.round(item.pricePerSqftAed).toLocaleString("en-US")}</text>
            <text x={x} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--color-stone)">{new Intl.DateTimeFormat(DATE_LOCALES[locale], { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${item.date}T00:00:00Z`))}</text>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">{points.map((item) => <span key={`${item.date}-status`} className="border border-black/10 bg-[var(--color-teal-soft)] px-2 py-1 text-[0.62rem] uppercase tracking-[0.08em] text-[var(--color-stone)]">{item.date} · {translateStatusLabel(item.sourceStatus, locale)}</span>)}</div>
      <p className="mt-2 text-[0.7rem] leading-5 text-[var(--color-stone)]">{copy.footnote}</p>
    </div>
  );
}
