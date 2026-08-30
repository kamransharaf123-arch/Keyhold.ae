import snapshotJson from "@/data/cms-snapshot.json";
import { mergeTranslation } from "@/lib/i18n/translations";
import type { TranslationEntityType } from "@/types/localization";
import type {
  WebsiteCmsContent,
  WebsiteFaq,
  WebsiteFormCopy,
  WebsiteNavigationItem,
  WebsitePage,
  WebsitePerson,
  WebsiteSection,
  WebsiteSettings,
  WebsiteTestimonial,
} from "@/types/website-cms";

type SnapshotWithWebsite = {
  websiteEnabled?: boolean;
  website?: WebsiteCmsContent | null;
};

const snapshot = snapshotJson as SnapshotWithWebsite;
const empty: WebsiteCmsContent = {
  enabled: false,
  settings: null,
  pages: [],
  sections: [],
  navigation: [],
  media: [],
  people: [],
  testimonials: [],
  faqs: [],
  forms: [],
  locales: [
    { locale: "en", label: "English", nativeLabel: "English", enabled: true, isDefault: true, routePrefix: "", hreflang: "en", direction: "ltr", fallbackLocale: null, sortOrder: 10 },
    { locale: "fr", label: "French", nativeLabel: "Français", enabled: true, isDefault: false, routePrefix: "/fr", hreflang: "fr", direction: "ltr", fallbackLocale: "en", sortOrder: 20 },
  ],
  translations: [],
};

export const websiteContent: WebsiteCmsContent =
  snapshot.websiteEnabled === true && snapshot.website?.enabled === true ? snapshot.website : empty;

export const websiteCmsEnabled = websiteContent.enabled;

function localize<T extends Record<string, unknown>>(item: T, entityType: TranslationEntityType, entityKey: string, locale: string): T {
  if (locale === "en") return item;
  return entityKey ? mergeTranslation(item, websiteContent.translations, entityType, entityKey, locale) : item;
}

export function websiteSettings(locale = "en"): WebsiteSettings | null {
  return websiteContent.settings ? localize(websiteContent.settings, "website-settings", "global", locale) : null;
}

export function websitePageByKey(pageKey: string, locale = "en"): WebsitePage | null {
  const page = websiteContent.pages.find((item) => item.pageKey === pageKey) ?? null;
  return page ? localize(page, "website-page", page.pageKey, locale) : null;
}

export function websitePageByRoute(route: string, locale = "en"): WebsitePage | null {
  const page = websiteContent.pages.find((item) => item.route === route) ?? null;
  return page ? localize(page, "website-page", page.pageKey, locale) : null;
}

export function websiteSections(pageKey: string, locale = "en"): WebsiteSection[] {
  return websiteContent.sections
    .filter((section) => section.pageKey === pageKey && section.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((section) => localize(section, "website-section", `${section.pageKey}:${section.sectionKey}`, locale));
}

export function websiteSection(pageKey: string, sectionKey: string, locale = "en"): WebsiteSection | null {
  const section = websiteContent.sections.find(
    (item) => item.pageKey === pageKey && item.sectionKey === sectionKey && item.enabled,
  ) ?? null;
  return section ? localize(section, "website-section", `${section.pageKey}:${section.sectionKey}`, locale) : null;
}

export function websiteNavigation(group: WebsiteNavigationItem["navGroup"], locale = "en"): WebsiteNavigationItem[] {
  return websiteContent.navigation
    .filter((item) => item.navGroup === group && item.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => localize(item, "navigation-item", `${item.navGroup}:${item.href}`, locale));
}

export function websitePeople(locale = "en"): WebsitePerson[] {
  return websiteContent.people.map((item) => localize(item, "person", item.slug, locale));
}

export function websiteTestimonials(locale = "en"): WebsiteTestimonial[] {
  return websiteContent.testimonials.map((item) => localize(item, "testimonial", item.id, locale));
}

export function websiteFaqs(scope: string, locale = "en"): WebsiteFaq[] {
  return websiteContent.faqs
    .filter((item) => item.scope === scope || item.scope === "global")
    .map((item) => localize(item, "faq", item.id, locale));
}

export function websiteForm(formKey: string, locale = "en"): WebsiteFormCopy | null {
  const form = websiteContent.forms.find((item) => item.formKey === formKey) ?? null;
  return form ? localize(form, "form", form.formKey, locale) : null;
}
