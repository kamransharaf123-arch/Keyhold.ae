export type ProjectCategory = "Off-Plan" | "Ready" | "Short-Term" | "Long-Term";

export type UnitAvailability = "available" | "reserved" | "sold" | "unknown";

export type DocumentAvailability = "available" | "request-only" | "coming-soon";

export type InvestmentGoal =
  | "Capital growth"
  | "Rental income"
  | "Low initial cash"
  | "Ready income"
  | "Family living"
  | "Waterfront"
  | "Holiday home"
  | "Golden Visa planning";

export type LifestyleTag =
  | "Waterfront"
  | "Beach"
  | "Marina"
  | "City centre"
  | "Family"
  | "Golf"
  | "Walkable"
  | "Quiet"
  | "Short-stay";

export type ProjectImage = {
  src: string;
  alt: string;
  category: "Exterior" | "Interior" | "Amenities" | "Master Plan" | "Construction";
};

export type PaymentMilestone = {
  label: string;
  percentage: number;
  timing: string;
  note?: string;
};

export type FloorPlan = {
  id: string;
  label: string;
  bedrooms: number;
  propertyType: string;
  sizeFromSqft: number;
  sizeToSqft?: number;
  image: string;
};

export type ProjectUnit = {
  id: string;
  unitNumber: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  sizeSqft: number;
  view: string;
  priceAed: number | null;
  availability: UnitAvailability;
  lastVerifiedAt: string;
};

export type ProjectDocument = {
  id: string;
  label: string;
  kind: "Brochure" | "Floor Plans" | "Payment Plan" | "Permit" | "Other";
  availability: DocumentAvailability;
  href?: string;
};

export type RegulatoryInfo = {
  permitNumber?: string;
  qrCodeImage?: string;
  verificationUrl?: string;
  registrationStatus: "verified" | "pending-verification" | "not-applicable";
  verifiedAt?: string;
};

export type ConstructionUpdate = {
  slug: string;
  projectSlug: string;
  project: string;
  location: string;
  progress: number;
  status: string;
  updatedAt: string;
  publishedAt: string;
  image: string;
  summary: string;
  milestones: string[];
};

export type DeveloperProfile = {
  slug: string;
  name: string;
  summary: string;
  location: string;
  verifiedFactsOnly: boolean;
};

export type AreaProfile = {
  slug: string;
  name: string;
  summary: string;
  emirate: "Dubai";
  highlights: string[];
  mapPosition: {
    x: number;
    y: number;
  };
};

export type ProjectDiscoveryProfile = {
  investmentGoals: InvestmentGoal[];
  lifestyleTags: LifestyleTag[];
  keywords: string[];
};

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  developerSlug: string;
  areaSlug: string;
  location: string;
  shortDescription: string;
  overview: string;
  heroImage: string;
  images: ProjectImage[];
  priceFromAed: number | null;
  rentalPriceFromAed?: number | null;
  rentalPeriod?: "night" | "year";
  bedroomsLabel: string;
  bedrooms: number[];
  bathroomsLabel?: string;
  propertyTypes: string[];
  sizeFromSqft: number | null;
  sizeToSqft: number | null;
  handoverLabel: string;
  handoverDate?: string;
  completionStatus: "pre-launch" | "under-construction" | "ready";
  amenities: string[];
  paymentPlan: PaymentMilestone[];
  floorPlans: FloorPlan[];
  units: ProjectUnit[];
  documents: ProjectDocument[];
  regulatory: RegulatoryInfo;
  availabilityLastVerifiedAt: string;
  publishedAt: string;
  featured: boolean;
  constructionProgress?: number;
  discovery: ProjectDiscoveryProfile;
  keyFacts: Array<{ label: string; value: string }>;
};
