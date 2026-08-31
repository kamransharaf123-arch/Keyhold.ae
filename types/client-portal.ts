export type ClientLocale = "en" | "fr";
export type ClientCurrency = "AED" | "USD" | "EUR" | "GBP" | "CHF";
export type ClientStatus = "active" | "blocked";

export type ClientUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  preferredLocale: ClientLocale;
  preferredCurrency: ClientCurrency;
  marketingOptIn: boolean;
  advisorUserId: string | null;
};

export type ClientDashboardSummary = {
  savedCount: number;
  portfolioCount: number;
  portfolioPurchaseValueAed: number;
  portfolioEstimatedValueAed: number;
  paidToDateAed: number;
  upcomingPaymentsAed: number;
  unreadNotifications: number;
  documentCount: number;
  analysisCount: number;
};

export type ClientSavedProject = {
  projectId: string;
  slug: string;
  title: string;
  location: string;
  category: string;
  heroImageUrl: string;
  priceFromAed: number | null;
  rentalPriceFromAed: number | null;
  bedroomsLabel: string;
  handoverLabel: string;
  savedAt: string;
};

export type ClientSavedComparison = {
  id: string;
  name: string;
  projectIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ClientPortfolioAsset = {
  id: string;
  projectId: string | null;
  unitId: string | null;
  customTitle: string | null;
  ownershipStatus: "reserved" | "contracted" | "under-construction" | "handed-over" | "rented" | "sold";
  purchasePriceAed: number;
  paidToDateAed: number;
  estimatedValueAed: number | null;
  valuationAsOf: string | null;
  acquisitionDate: string | null;
  notes: string | null;
  project?: {
    slug: string;
    title: string;
    location: string;
    heroImageUrl: string;
    constructionProgress: number | null;
  } | null;
  unit?: {
    unitNumber: string;
    floor: number;
    bedrooms: number;
    sizeSqft: number;
    viewLabel: string;
  } | null;
};

export type ClientPaymentItem = {
  id: string;
  assetId: string;
  label: string;
  dueDate: string;
  amountAed: number;
  status: "upcoming" | "due" | "paid" | "overdue" | "waived";
  paidAt: string | null;
  source: "developer-plan" | "admin" | "imported";
};

export type ClientDocument = {
  id: string;
  assetId: string | null;
  label: string;
  category: "Reservation" | "KYC" | "SPA" | "Receipt" | "DLD" | "Handover" | "Inspection" | "Other";
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

export type ClientAdvisorNote = {
  id: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
};

export type ClientWatchlistRule = {
  id: string;
  projectId: string | null;
  areaId: string | null;
  developerId: string | null;
  ruleType: "price-below" | "construction-reaches" | "new-unit" | "availability-change" | "new-launch";
  thresholdNumeric: number | null;
  isActive: boolean;
  channels: string[];
  lastTriggeredAt: string | null;
  createdAt: string;
};

export type ClientNotification = {
  id: string;
  kind: "update" | "payment" | "document" | "advisor" | "watchlist" | "system";
  title: string;
  body: string;
  href: string | null;
  severity: "info" | "positive" | "warning";
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type ClientInvestmentSnapshot = {
  id: string;
  projectId: string | null;
  unitId: string | null;
  name: string;
  locale: ClientLocale;
  scenarioKey: string | null;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  createdAt: string;
};

export type ClientReport = {
  id: string;
  title: string;
  status: "generating" | "ready" | "error";
  fileName: string | null;
  generatedAt: string | null;
  createdAt: string;
};
