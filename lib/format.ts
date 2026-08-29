export function formatAed(value: number, options?: { compact?: boolean }) {
  if (options?.compact) {
    if (value >= 1_000_000) {
      const millions = value / 1_000_000;
      return `AED ${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(2)}M`;
    }
    if (value >= 100_000) {
      return `AED ${(value / 1_000).toFixed(0)}K`;
    }
  }

  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatProjectPrice(input: {
  priceFromAed: number | null;
  rentalPriceFromAed?: number | null;
  rentalPeriod?: "night" | "year";
}) {
  if (input.priceFromAed !== null) {
    return `From ${formatAed(input.priceFromAed, { compact: true })}`;
  }

  if (input.rentalPriceFromAed) {
    const suffix = input.rentalPeriod === "night" ? " / night" : " / year";
    return `From ${formatAed(input.rentalPriceFromAed, { compact: true })}${suffix}`;
  }

  return "Price on request";
}

export function formatDateTimeDubai(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Verification date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dubai",
  }).format(date);
}

export function formatSqftRange(from: number | null, to: number | null) {
  if (from === null) return "Size on request";
  const formatter = new Intl.NumberFormat("en-US");
  if (to && to !== from) return `${formatter.format(from)}–${formatter.format(to)} sqft`;
  return `${formatter.format(from)} sqft`;
}

export function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
