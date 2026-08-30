import type { CmsTranslation, TranslationEntityType } from "@/types/localization";

export function translationFor(
  translations: CmsTranslation[],
  entityType: TranslationEntityType,
  entityKey: string,
  locale: string,
): Record<string, unknown> | null {
  if (locale === "en") return null;
  return (
    translations.find(
      (row) => row.entityType === entityType && row.entityKey === entityKey && row.locale === locale && row.status === "published",
    )?.data ?? null
  );
}

export function mergeTranslation<T extends Record<string, unknown>>(
  base: T,
  translations: CmsTranslation[],
  entityType: TranslationEntityType,
  entityKey: string,
  locale: string,
): T {
  const translated = translationFor(translations, entityType, entityKey, locale);
  return translated ? ({ ...base, ...translated } as T) : base;
}

export function localizedString(
  base: string,
  data: Record<string, unknown> | null,
  key: string,
): string {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value : base;
}

export function localizedStringArray(
  base: string[],
  data: Record<string, unknown> | null,
  key: string,
): string[] {
  const value = data?.[key];
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : base;
}
