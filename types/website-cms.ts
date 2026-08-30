import type { CmsTranslation, LocaleSetting } from "@/types/localization";

export type WebsiteStatus = "draft" | "published" | "archived";

export type WebsiteSettings = {
  id: string;
  brandName: string;
  logoText: string;
  logoUrl: string;
  logoMarkUrl: string;
  logoAlt: string;
  defaultOgImageUrl: string;
  projectsMenuLabel: string;
  headerCtaLabel: string;
  headerCtaHref: string;
  footerTagline: string;
  footerDisclaimer: string;
  copyrightText: string;
  locationsLabel: string;
  globalCta: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  announcement: { enabled: boolean; text: string; href: string };
  uiCopy: Record<string, unknown>;
  theme: Record<string, string | boolean>;
};

export type WebsitePage = {
  id: string;
  pageKey: string;
  route: string;
  status: WebsiteStatus;
  navTitle: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroVideoUrl: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  settings: Record<string, unknown>;
};

export type WebsiteSection = {
  id: string;
  pageId: string;
  pageKey: string;
  sectionKey: string;
  sectionType: string;
  enabled: boolean;
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  styleVariant: string;
  payload: Record<string, unknown>;
  sortOrder: number;
};

export type WebsiteNavGroup =
  | "header-primary"
  | "projects-dropdown"
  | "footer-projects"
  | "footer-guides"
  | "footer-services"
  | "footer-company"
  | "legal"
  | "mobile-extra";

export type WebsiteNavigationItem = {
  id: string;
  navGroup: WebsiteNavGroup;
  label: string;
  href: string;
  enabled: boolean;
  external: boolean;
  sortOrder: number;
};

export type WebsiteMedia = {
  id: string;
  label: string;
  kind: "image" | "video" | "logo" | "icon" | "document";
  bucket: "keyhold-media" | "keyhold-public-documents";
  storagePath: string;
  publicUrl: string;
  altText: string;
  tags: string[];
};

export type WebsitePerson = {
  id: string;
  slug: string;
  status: WebsiteStatus;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  sortOrder: number;
};

export type WebsiteTestimonial = {
  id: string;
  status: WebsiteStatus;
  name: string;
  descriptor: string;
  quote: string;
  imageUrl: string;
  sourceLabel: string;
  sourceUrl: string;
  sortOrder: number;
};

export type WebsiteFaq = {
  id: string;
  status: WebsiteStatus;
  scope: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type WebsiteFormCopy = {
  id: string;
  formKey: string;
  enabled: boolean;
  title: string;
  intro: string;
  submitLabel: string;
  successMessage: string;
  consentText: string;
  privacyLabel: string;
  fields: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export type WebsiteCmsContent = {
  enabled: boolean;
  settings: WebsiteSettings | null;
  pages: WebsitePage[];
  sections: WebsiteSection[];
  navigation: WebsiteNavigationItem[];
  media: WebsiteMedia[];
  people: WebsitePerson[];
  testimonials: WebsiteTestimonial[];
  faqs: WebsiteFaq[];
  forms: WebsiteFormCopy[];
  locales: LocaleSetting[];
  translations: CmsTranslation[];
};
