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

export function formatProjectPrice(
  input: {
    priceFromAed: number | null;
    rentalPriceFromAed?: number | null;
    rentalPeriod?: "night" | "year";
  },
  locale: "en" | "fr" = "en",
) {
  const from = locale === "fr" ? "À partir de" : "From";
  if (input.priceFromAed !== null) {
    return `${from} ${formatAed(input.priceFromAed, { compact: true })}`;
  }

  if (input.rentalPriceFromAed) {
    const suffix = locale === "fr" ? (input.rentalPeriod === "night" ? " / nuit" : " / an") : input.rentalPeriod === "night" ? " / night" : " / year";
    return `${from} ${formatAed(input.rentalPriceFromAed, { compact: true })}${suffix}`;
  }

  return locale === "fr" ? "Prix sur demande" : "Price on request";
}

export function formatDateTimeDubai(iso: string, locale: "en" | "fr" = "en") {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return locale === "fr" ? "Date de vérification indisponible" : "Verification date unavailable";

  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dubai",
  }).format(date);
}

export function formatSqftRange(from: number | null, to: number | null, locale: "en" | "fr" = "en") {
  const sizeOnRequest = locale === "fr" ? "Surface sur demande" : "Size on request";
  const sqft = locale === "fr" ? "pi²" : "sqft";
  if (from === null) return sizeOnRequest;
  const formatter = new Intl.NumberFormat("en-US");
  if (to && to !== from) return `${formatter.format(from)}–${formatter.format(to)} ${sqft}`;
  return `${formatter.format(from)} ${sqft}`;
}

export function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
