import type { KeyHoldLocale } from "@/types/localization";

export const DEFAULT_LOCALE: KeyHoldLocale = "en";
export const FRENCH_LOCALE: KeyHoldLocale = "fr";

export function normalizeLocale(value: string | null | undefined): KeyHoldLocale {
  return value?.toLowerCase() === FRENCH_LOCALE ? FRENCH_LOCALE : DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/fr") return "/";
  if (pathname.startsWith("/fr/")) return pathname.slice(3) || "/";
  return pathname || "/";
}

export function localizedHref(href: string, locale: KeyHoldLocale): string {
  if (!href.startsWith("/")) return href;
  const base = stripLocalePrefix(href);
  if (locale === DEFAULT_LOCALE) return base;
  return base === "/" ? "/fr" : `/fr${base}`;
}

export function localeFromPathname(pathname: string): KeyHoldLocale {
  return pathname === "/fr" || pathname.startsWith("/fr/") ? FRENCH_LOCALE : DEFAULT_LOCALE;
}
