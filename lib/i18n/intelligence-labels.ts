import type { IntelligenceDataStatus, MarketPositionBand, RiskBand, SourceStatus } from "@/types/intelligence";
import type { KeyHoldLocale } from "@/types/localization";

const STATUS_LABELS: Record<KeyHoldLocale, Record<IntelligenceDataStatus | SourceStatus, string>> = {
  en: { verified: "Verified", "pending-verification": "Pending verification", "demo-placeholder": "Demo placeholder" },
  fr: { verified: "Vérifié", "pending-verification": "Vérification en attente", "demo-placeholder": "Espace réservé de démonstration" },
};

const RISK_BAND_LABELS: Record<KeyHoldLocale, Record<RiskBand, string>> = {
  en: { Low: "Low", Moderate: "Moderate", Elevated: "Elevated", High: "High" },
  fr: { Low: "Faible", Moderate: "Modéré", Elevated: "Élevé", High: "Haut" },
};

const MARKET_POSITION_LABELS: Record<KeyHoldLocale, Record<MarketPositionBand, string>> = {
  en: {
    "Below comparator median": "Below comparator median",
    "Slightly below comparator median": "Slightly below comparator median",
    "Near comparator median": "Near comparator median",
    "Slightly above comparator median": "Slightly above comparator median",
    "Above comparator median": "Above comparator median",
  },
  fr: {
    "Below comparator median": "Sous la médiane comparable",
    "Slightly below comparator median": "Légèrement sous la médiane comparable",
    "Near comparator median": "Proche de la médiane comparable",
    "Slightly above comparator median": "Légèrement au-dessus de la médiane comparable",
    "Above comparator median": "Au-dessus de la médiane comparable",
  },
};

const NOT_MODELLED: Record<KeyHoldLocale, string> = { en: "Not modelled", fr: "Non modélisé" };

export function translateStatusLabel(status: IntelligenceDataStatus | SourceStatus, locale: KeyHoldLocale) {
  return STATUS_LABELS[locale][status];
}

export function translateRiskBand(band: RiskBand, locale: KeyHoldLocale) {
  return RISK_BAND_LABELS[locale][band];
}

export function translateMarketPositionBand(band: MarketPositionBand | "Not modelled", locale: KeyHoldLocale) {
  if (band === "Not modelled") return NOT_MODELLED[locale];
  return MARKET_POSITION_LABELS[locale][band];
}

export function translateNotModelled(locale: KeyHoldLocale) {
  return NOT_MODELLED[locale];
}
