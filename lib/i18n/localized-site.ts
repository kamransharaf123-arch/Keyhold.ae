import {
  areas as enAreaNames,
  developers as enDeveloperNames,
  featuredProjects as enFeaturedProjects,
  insights as enInsights,
  projectCatalog as enProjectCatalog,
  services as enServices,
  updates as enUpdates,
  type InsightPreview,
  type ProjectPreview,
  type UpdatePreview,
} from "@/data/site";
import { areasForLocale, constructionUpdatesForLocale, developersForLocale, projectsForLocale } from "@/data/localized-catalog";
import { websiteContent } from "@/data/website-content";
import { mergeTranslation } from "@/lib/i18n/translations";
import { formatProjectPrice } from "@/lib/format";
import type { KeyHoldLocale, TranslationEntityType } from "@/types/localization";

function tr<T extends Record<string, unknown>>(item: T, entityType: TranslationEntityType, entityKey: string, locale: string): T {
  if (locale === "en" || !entityKey) return item;
  return mergeTranslation(item, websiteContent.translations, entityType, entityKey, locale);
}

function toProjectPreview(project: ReturnType<typeof projectsForLocale>[number]): ProjectPreview {
  return {
    slug: project.slug,
    title: project.title,
    location: project.location,
    category: project.category,
    price: formatProjectPrice(project),
    meta: `${project.bedroomsLabel} · ${project.propertyTypes.join(" / ")}`,
    image: project.heroImage,
  };
}

export function localizedProjectCatalog(locale: KeyHoldLocale): ProjectPreview[] {
  if (locale === "en") return enProjectCatalog;
  return projectsForLocale(locale).map(toProjectPreview);
}

export function localizedFeaturedProjects(locale: KeyHoldLocale): ProjectPreview[] {
  if (locale === "en") return enFeaturedProjects;
  return projectsForLocale(locale).filter((project) => project.featured).map(toProjectPreview);
}

export function localizedUpdates(locale: KeyHoldLocale): UpdatePreview[] {
  if (locale === "en") return enUpdates;
  return constructionUpdatesForLocale(locale).map((update) => ({
    slug: update.slug,
    project: update.project,
    location: update.location,
    progress: update.progress,
    status: update.status,
    updatedAt: update.updatedAt,
    image: update.image,
  }));
}

export function localizedInsights(locale: KeyHoldLocale): InsightPreview[] {
  if (locale === "en") return enInsights;
  return enInsights.map((item) => tr(item as unknown as Record<string, unknown>, "insight", item.slug, locale) as unknown as InsightPreview);
}

export function localizedServices(locale: KeyHoldLocale) {
  if (locale === "en") return enServices;
  return enServices.map((item) => tr(item as unknown as Record<string, unknown>, "service", item.title, locale) as unknown as (typeof enServices)[number]);
}

export function localizedAreaNames(locale: KeyHoldLocale): string[] {
  if (locale === "en") return enAreaNames;
  return areasForLocale(locale).map((area) => area.name);
}

export function localizedDeveloperNames(locale: KeyHoldLocale): string[] {
  if (locale === "en") return enDeveloperNames;
  return developersForLocale(locale).map((developer) => developer.name);
}
