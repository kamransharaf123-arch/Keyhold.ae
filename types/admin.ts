export type AdminRole = "owner" | "admin" | "editor" | "viewer";
export type CmsStatus = "draft" | "published" | "archived";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
};

export type CmsProjectRow = {
  id: string;
  slug: string;
  title: string;
  status: CmsStatus;
  category: "Off-Plan" | "Ready" | "Short-Term" | "Long-Term";
  developer_id: string | null;
  area_id: string | null;
  location: string;
  short_description: string;
  overview: string;
  hero_image_url: string;
  price_from_aed: number | null;
  rental_price_from_aed: number | null;
  rental_period: "night" | "year" | null;
  bedrooms_label: string;
  bedrooms: number[];
  bathrooms_label: string | null;
  property_types: string[];
  size_from_sqft: number | null;
  size_to_sqft: number | null;
  handover_label: string;
  handover_date: string | null;
  completion_status: "pre-launch" | "under-construction" | "ready";
  amenities: string[];
  regulatory: Record<string, unknown>;
  availability_last_verified_at: string;
  published_at: string | null;
  featured: boolean;
  footer_featured: boolean;
  construction_progress: number | null;
  discovery: Record<string, unknown>;
  investment: Record<string, unknown> | null;
  key_facts: Array<{ label: string; value: string }>;
  seo: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CmsDeveloperRow = {
  id: string;
  slug: string;
  name: string;
  status: CmsStatus;
  summary: string;
  location: string;
  verified_facts_only: boolean;
  created_at: string;
  updated_at: string;
};

export type CmsAreaRow = {
  id: string;
  slug: string;
  name: string;
  status: CmsStatus;
  summary: string;
  emirate: string;
  highlights: string[];
  map_x: number;
  map_y: number;
  created_at: string;
  updated_at: string;
};

export type CmsUnitRow = {
  id: string;
  project_id: string;
  unit_number: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  size_sqft: number;
  view_label: string;
  price_aed: number | null;
  availability: "available" | "reserved" | "sold" | "unknown";
  last_verified_at: string;
  sort_order: number;
};

export type CmsPaymentMilestoneRow = {
  id: string;
  project_id: string;
  label: string;
  percentage: number;
  timing: string;
  note: string | null;
  sort_order: number;
};

export type CmsProjectImageRow = {
  id: string;
  project_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string;
  category: "Exterior" | "Interior" | "Amenities" | "Master Plan" | "Construction";
  sort_order: number;
};

export type CmsFloorPlanRow = {
  id: string;
  project_id: string;
  label: string;
  bedrooms: number;
  property_type: string;
  size_from_sqft: number;
  size_to_sqft: number | null;
  storage_path: string;
  image_url: string;
  sort_order: number;
};

export type CmsDocumentRow = {
  id: string;
  project_id: string;
  label: string;
  kind: "Brochure" | "Floor Plans" | "Payment Plan" | "Permit" | "Other";
  availability: "available" | "request-only" | "coming-soon";
  bucket: "keyhold-public-documents" | "keyhold-private-documents";
  storage_path: string | null;
  public_url: string | null;
  sort_order: number;
};

export type CmsConstructionUpdateRow = {
  id: string;
  slug: string;
  project_id: string;
  status: CmsStatus;
  progress: number;
  status_label: string;
  updated_at_label: string;
  published_at: string;
  image_url: string;
  summary: string;
  milestones: string[];
  created_at: string;
  updated_at: string;
};
