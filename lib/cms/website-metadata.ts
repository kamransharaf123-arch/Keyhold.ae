import type { Metadata } from "next";
import { websiteContent, websitePageByKey, websiteSettings } from "@/data/website-content";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

export function websitePageMetadata(pageKey: string, route: string, fallback: Metadata, locale: KeyHoldLocale = "en"): Metadata {
  const page = websitePageByKey(pageKey, locale);
  const settings = websiteSettings(locale);
  const title = page?.seoTitle || page?.heroTitle || fallback.title;
  const description = page?.seoDescription || page?.heroSubtitle || fallback.description;
  const image = page?.ogImageUrl || settings?.defaultOgImageUrl || "";
  return {
    ...fallback,
    title,
    description,
    alternates: {
      ...(fallback.alternates ?? {}),
      canonical: localizedHref(route, locale),
      languages: {
        en: localizedHref(route, "en"),
        fr: localizedHref(route, "fr"),
        "x-default": localizedHref(route, "en"),
      },
    },
    openGraph: {
      ...(fallback.openGraph ?? {}),
      locale: locale === "fr" ? "fr_FR" : "en_AE",
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export function enabledWebsiteLocales() {
  return websiteContent.locales.filter((locale) => locale.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
}
