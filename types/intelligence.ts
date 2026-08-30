export type IntelligenceDataStatus = "demo-placeholder" | "pending-verification" | "verified";
export type SourceStatus = "demo-placeholder" | "pending-verification" | "verified";
export type RiskBand = "Low" | "Moderate" | "Elevated" | "High";
export type MarketPositionBand =
  | "Below comparator median"
  | "Slightly below comparator median"
  | "Near comparator median"
  | "Slightly above comparator median"
  | "Above comparator median";

export type ScoreDimensionKey =
  | "rental-potential"
  | "capital-growth"
  | "developer"
  | "liquidity"
  | "payment-structure"
  | "supply-resilience";

export type RiskDimensionKey =
  | "developer-risk"
  | "construction-risk"
  | "supply-risk"
  | "rental-risk"
  | "liquidity-risk";

export interface IntelligenceScoreDimension {
  key: ScoreDimensionKey;
  label: string;
  score: number;
  weight: number;
  rationale: string;
}

export interface IntelligenceRiskDimension {
  key: RiskDimensionKey;
  label: string;
  risk: number;
  rationale: string;
}

export interface PriceHistoryPoint {
  date: string;
  pricePerSqftAed: number;
  note?: string;
  sourceStatus: SourceStatus;
}

export interface ComparableTransaction {
  id: string;
  date: string;
  areaLabel: string;
  propertyType: string;
  bedrooms: number | null;
  sizeSqft: number;
  priceAed: number;
  pricePerSqftAed: number;
  sourceLabel: string;
  sourceStatus: SourceStatus;
}

export interface SupplyPipelinePoint {
  period: string;
  estimatedUnits: number;
  note?: string;
  sourceStatus: SourceStatus;
}

export interface ViewIntelligenceItem {
  view: string;
  permanenceRisk: "Low" | "Medium" | "High" | "Unknown";
  note: string;
  sourceStatus: SourceStatus;
}

export interface IntelligenceSource {
  id: string;
  label: string;
  category: "Developer material" | "Public record" | "Market evidence" | "KeyHold analysis" | "User supplied";
  status: SourceStatus;
  lastCheckedAt: string;
  url?: string;
  note?: string;
}

export interface KeyHoldVerdict {
  headline: string;
  summary: string;
  whyWeLikeIt: string[];
  whatWeWouldWatch: string[];
  bestFor: string[];
}

export interface ProjectIntelligenceProfile {
  projectSlug: string;
  dataStatus: IntelligenceDataStatus;
  lastReviewedAt: string;
  scoreDimensions: IntelligenceScoreDimension[];
  riskDimensions: IntelligenceRiskDimension[];
  developerDeliveryScore: number;
  developerDeliveryRationale: string;
  liquidityScore: number;
  liquidityRationale: string;
  priceHistory: PriceHistoryPoint[];
  comparables: ComparableTransaction[];
  supplyPipeline: SupplyPipelinePoint[];
  viewIntelligence: ViewIntelligenceItem[];
  verdict: KeyHoldVerdict;
  sources: IntelligenceSource[];
}

export interface MarketPositionResult {
  subjectPricePerSqftAed: number | null;
  comparatorMedianPricePerSqftAed: number | null;
  deltaPct: number | null;
  band: MarketPositionBand | "Not modelled";
}

export interface IntelligenceSummary {
  investmentScore: number;
  averageRisk: number;
  riskBand: RiskBand;
  developerDeliveryScore: number;
  liquidityScore: number;
  marketPosition: MarketPositionResult;
  dataStatus: IntelligenceDataStatus;
  lastReviewedAt: string;
}
