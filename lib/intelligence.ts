import { intelligenceProfiles } from "@/data/intelligence-catalog";
import type { Project } from "@/types/real-estate";
import type {
  IntelligenceRiskDimension,
  IntelligenceScoreDimension,
  IntelligenceSummary,
  MarketPositionBand,
  MarketPositionResult,
  ProjectIntelligenceProfile,
  RiskBand,
} from "@/types/intelligence";

export const SCORE_WEIGHT_TOTAL = 100;

export function clampTen(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10, value));
}

export function calculateInvestmentScore(dimensions: IntelligenceScoreDimension[]) {
  const valid = dimensions.filter((item) => Number.isFinite(item.score) && Number.isFinite(item.weight) && item.weight > 0);
  const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return 0;
  const weighted = valid.reduce((sum, item) => sum + clampTen(item.score) * item.weight, 0) / totalWeight;
  return Math.round(weighted * 10) / 10;
}

export function calculateAverageRisk(dimensions: IntelligenceRiskDimension[]) {
  if (dimensions.length === 0) return 0;
  const average = dimensions.reduce((sum, item) => sum + clampTen(item.risk), 0) / dimensions.length;
  return Math.round(average * 10) / 10;
}

export function getRiskBand(averageRisk: number): RiskBand {
  if (averageRisk <= 3) return "Low";
  if (averageRisk <= 5) return "Moderate";
  if (averageRisk <= 7) return "Elevated";
  return "High";
}

export function median(values: number[]) {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (clean.length === 0) return null;
  const middle = Math.floor(clean.length / 2);
  if (clean.length % 2 === 0) return (clean[middle - 1] + clean[middle]) / 2;
  return clean[middle];
}

export function getMarketPositionBand(deltaPct: number): MarketPositionBand {
  if (deltaPct <= -8) return "Below comparator median";
  if (deltaPct < -3) return "Slightly below comparator median";
  if (deltaPct <= 3) return "Near comparator median";
  if (deltaPct < 8) return "Slightly above comparator median";
  return "Above comparator median";
}

export function calculateMarketPosition(project: Project, profile: ProjectIntelligenceProfile): MarketPositionResult {
  if (project.priceFromAed === null) {
    return { subjectPricePerSqftAed: null, comparatorMedianPricePerSqftAed: null, deltaPct: null, band: "Not modelled" };
  }

  const referenceSize = project.investment?.defaultUnitSizeSqft ?? project.sizeFromSqft;
  if (!referenceSize || referenceSize <= 0) {
    return { subjectPricePerSqftAed: null, comparatorMedianPricePerSqftAed: null, deltaPct: null, band: "Not modelled" };
  }

  const comparatorMedian = median(profile.comparables.map((item) => item.pricePerSqftAed));
  if (comparatorMedian === null || comparatorMedian <= 0) {
    return { subjectPricePerSqftAed: project.priceFromAed / referenceSize, comparatorMedianPricePerSqftAed: null, deltaPct: null, band: "Not modelled" };
  }

  const subject = project.priceFromAed / referenceSize;
  const deltaPct = ((subject - comparatorMedian) / comparatorMedian) * 100;

  return {
    subjectPricePerSqftAed: Math.round(subject),
    comparatorMedianPricePerSqftAed: Math.round(comparatorMedian),
    deltaPct: Math.round(deltaPct * 10) / 10,
    band: getMarketPositionBand(deltaPct),
  };
}

export function getIntelligenceProfile(projectSlug: string) {
  return intelligenceProfiles.find((profile) => profile.projectSlug === projectSlug) ?? null;
}

export function getIntelligenceSummary(project: Project): IntelligenceSummary | null {
  const profile = getIntelligenceProfile(project.slug);
  if (!profile) return null;
  const averageRisk = calculateAverageRisk(profile.riskDimensions);
  return {
    investmentScore: calculateInvestmentScore(profile.scoreDimensions),
    averageRisk,
    riskBand: getRiskBand(averageRisk),
    developerDeliveryScore: clampTen(profile.developerDeliveryScore),
    liquidityScore: clampTen(profile.liquidityScore),
    marketPosition: calculateMarketPosition(project, profile),
    dataStatus: profile.dataStatus,
    lastReviewedAt: profile.lastReviewedAt,
  };
}

export function getStatusLabel(status: ProjectIntelligenceProfile["dataStatus"] | "pending-verification" | "verified") {
  if (status === "verified") return "Verified";
  if (status === "pending-verification") return "Pending verification";
  return "Demo placeholder";
}

export function formatSignedPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Not modelled";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
