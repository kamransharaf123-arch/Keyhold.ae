"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPathname, localizedHref } from "@/lib/i18n/locale";

export function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const current = localeFromPathname(pathname);
  return (
    <div className="inline-flex items-center rounded-full border border-black/10 bg-[var(--color-soft-white)] p-1 text-xs" aria-label="Language">
      <Link
        href={localizedHref(pathname, "en")}
        hrefLang="en"
        aria-current={current === "en" ? "page" : undefined}
        className={`rounded-full px-3 py-2 ${current === "en" ? "bg-[var(--color-teal)] text-white" : "text-[var(--color-stone)] hover:text-[var(--color-graphite)]"}`}
      >
        EN
      </Link>
      <Link
        href={localizedHref(pathname, "fr")}
        hrefLang="fr"
        aria-current={current === "fr" ? "page" : undefined}
        className={`rounded-full px-3 py-2 ${current === "fr" ? "bg-[var(--color-teal)] text-white" : "text-[var(--color-stone)] hover:text-[var(--color-graphite)]"}`}
      >
        FR
      </Link>
    </div>
  );
}
