export const KEYHOLD_LOCALES = ["en", "fr"] as const;
export type KeyHoldLocale = (typeof KEYHOLD_LOCALES)[number];

export type LocaleSetting = {
  locale: KeyHoldLocale | string;
  label: string;
  nativeLabel: string;
  enabled: boolean;
  isDefault: boolean;
  routePrefix: string;
  hreflang: string;
  direction: "ltr" | "rtl";
  fallbackLocale: string | null;
  sortOrder: number;
};

export type TranslationEntityType =
  | "website-settings"
  | "website-page"
  | "website-section"
  | "navigation-item"
  | "person"
  | "testimonial"
  | "faq"
  | "form"
  | "project"
  | "developer"
  | "area"
  | "unit"
  | "payment-milestone"
  | "floor-plan"
  | "document"
  | "construction-update"
  | "intelligence-profile"
  | "intelligence-source"
  | "insight"
  | "service";

export type CmsTranslation = {
  id: string;
  entityType: TranslationEntityType;
  entityKey: string;
  locale: string;
  status: "draft" | "published";
  data: Record<string, unknown>;
  updatedAt: string;
};
