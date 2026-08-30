import { areas, cmsInsights, cmsServices, constructionUpdates, developers, projects } from "@/data/catalog";
import { intelligenceProfiles } from "@/data/intelligence-catalog";
import { websiteContent } from "@/data/website-content";
import { mergeTranslation } from "@/lib/i18n/translations";

export function projectsForLocale(locale = "en") {
  return projects.map((item) => mergeTranslation(item as Record<string, unknown>, websiteContent.translations, "project", String((item as { slug?: string }).slug || ""), locale)) as typeof projects;
}

export function developersForLocale(locale = "en") {
  return developers.map((item) => mergeTranslation(item as Record<string, unknown>, websiteContent.translations, "developer", String((item as { slug?: string }).slug || ""), locale)) as typeof developers;
}

export function areasForLocale(locale = "en") {
  return areas.map((item) => mergeTranslation(item as Record<string, unknown>, websiteContent.translations, "area", String((item as { slug?: string }).slug || ""), locale)) as typeof areas;
}

export function constructionUpdatesForLocale(locale = "en") {
  return constructionUpdates.map((item) => mergeTranslation(item as Record<string, unknown>, websiteContent.translations, "construction-update", String((item as { slug?: string }).slug || ""), locale)) as typeof constructionUpdates;
}

export function intelligenceProfilesForLocale(locale = "en") {
  return intelligenceProfiles.map((item) => mergeTranslation(item as unknown as Record<string, unknown>, websiteContent.translations, "intelligence-profile", item.projectSlug, locale)) as unknown as typeof intelligenceProfiles;
}

export function insightsForLocale(locale = "en") {
  return cmsInsights.map((item) => mergeTranslation(item as Record<string, unknown>, websiteContent.translations, "insight", String((item as { slug?: string }).slug || ""), locale)) as typeof cmsInsights;
}

export function servicesForLocale(locale = "en") {
  return cmsServices.map((item) => mergeTranslation(item as Record<string, unknown>, websiteContent.translations, "service", String((item as { slug?: string; title?: string }).slug || (item as { title?: string }).title || ""), locale)) as typeof cmsServices;
}
