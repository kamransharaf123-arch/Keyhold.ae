"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ChevronDownIcon, MenuIcon } from "@/components/icons";
import { MotionHeader } from "@/components/motion";
import { LanguageSwitcher } from "@/components/website/language-switcher";
import { primaryNav, projectNav } from "@/data/site";
import { websiteCmsEnabled, websiteNavigation, websiteSettings } from "@/data/website-content";
import { localeFromPathname, localizedHref } from "@/lib/i18n/locale";

const FR_LABELS: Record<string, string> = {
  Projects: "Projets",
  Home: "Accueil",
  Updates: "Avancement",
  Insights: "Analyses",
  Services: "Services",
  "Who We Are": "Qui sommes-nous",
  "Off-Plan": "Sur plan",
  Ready: "Prêt",
  "Short-Term Rentals": "Location courte durée",
  "Long-Term Rentals": "Location longue durée",
};

function label(text: string, locale: "en" | "fr") {
  return locale === "fr" ? FR_LABELS[text] ?? text : text;
}

function useHeaderContent() {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const settings = websiteSettings(locale);
  const cmsPrimary = websiteCmsEnabled ? websiteNavigation("header-primary", locale) : [];
  const cmsDropdown = websiteCmsEnabled ? websiteNavigation("projects-dropdown", locale) : [];

  const home = cmsPrimary.length
    ? { label: cmsPrimary.find((item) => item.href === "/")?.label ?? label("Home", locale), href: "/" }
    : { label: label("Home", locale), href: "/" };
  const restPrimary = (
    cmsPrimary.length
      ? cmsPrimary.filter((item) => item.href !== "/")
      : primaryNav.slice(1).map((item) => ({ label: label(item.label, locale), href: item.href }))
  ).map((item) => ({ label: item.label, href: item.href }));
  const dropdown = cmsDropdown.length ? cmsDropdown : projectNav.map((item) => ({ label: label(item.label, locale), href: item.href }));

  return {
    locale,
    projectsMenuLabel: settings?.projectsMenuLabel || label("Projects", locale),
    headerCtaLabel: settings?.headerCtaLabel || (locale === "fr" ? "Parler à un conseiller" : "Speak to an Advisor"),
    headerCtaHref: settings?.headerCtaHref || "/contact",
    myKeyHoldLabel: locale === "fr" ? "Mon KeyHold" : "My KeyHold",
    brandName: settings?.logoText || "KEYHOLD",
    home,
    restPrimary,
    dropdown,
  };
}

function DesktopNav() {
  const { locale, projectsMenuLabel, dropdown, home, restPrimary } = useHeaderContent();
  return (
    <nav aria-label="Primary navigation" className="hidden lg:block">
      <ul className="flex items-center gap-7 xl:gap-9">
        <li>
          <Link className="nav-link" href={localizedHref(home.href, locale)}>
            {home.label}
          </Link>
        </li>
        <li>
          <details className="group relative">
            <summary className="nav-link flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
              {projectsMenuLabel}
              <ChevronDownIcon className="size-4 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="absolute left-1/2 top-[calc(100%+1.25rem)] z-50 w-72 -translate-x-1/2 border border-black/10 bg-[var(--color-soft-white)] p-2 shadow-[0_20px_60px_rgba(36,49,47,0.10)]">
              {dropdown.map((item) => (
                <Link
                  key={item.href}
                  href={localizedHref(item.href, locale)}
                  className="flex items-center justify-between px-4 py-3.5 text-sm text-[var(--color-graphite)] transition-colors hover:bg-[var(--color-teal-soft)] hover:text-[var(--color-teal-deep)]"
                >
                  {item.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </details>
        </li>
        {restPrimary.map((item) => (
          <li key={item.href}>
            <Link className="nav-link" href={localizedHref(item.href, locale)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MobileNav() {
  const { locale, projectsMenuLabel, dropdown, home, restPrimary, myKeyHoldLabel } = useHeaderContent();
  return (
    <details className="relative lg:hidden">
      <summary
        aria-label="Open navigation menu"
        className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-black/10 [&::-webkit-details-marker]:hidden"
      >
        <MenuIcon className="size-5" />
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.8rem)] z-50 w-[min(88vw,22rem)] border border-black/10 bg-[var(--color-soft-white)] p-3 shadow-[0_24px_70px_rgba(36,49,47,0.12)]">
        <Link className="mobile-nav-link" href={localizedHref(home.href, locale)}>
          {home.label}
        </Link>
        <div className="my-2 border-y border-black/[0.08] py-2">
          <div className="px-3 pb-2 pt-1 text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
            {projectsMenuLabel}
          </div>
          {dropdown.map((item) => (
            <Link key={item.href} className="mobile-nav-link" href={localizedHref(item.href, locale)}>
              {item.label}
            </Link>
          ))}
        </div>
        {restPrimary.map((item) => (
          <Link key={item.href} className="mobile-nav-link" href={localizedHref(item.href, locale)}>
            {item.label}
          </Link>
        ))}
        <div className="mt-2 border-t border-black/[0.08] pt-3">
          <Link className="mobile-nav-link" href={localizedHref("/account", locale)}>
            {myKeyHoldLabel}
          </Link>
        </div>
        <div className="mt-2 border-t border-black/[0.08] pt-3">
          <LanguageSwitcher />
        </div>
      </div>
    </details>
  );
}

export function SiteHeader() {
  const { locale, headerCtaLabel, headerCtaHref, myKeyHoldLabel, brandName } = useHeaderContent();
  return (
    <MotionHeader className="sticky top-0 z-40 border-b border-black/[0.08] bg-[color:rgba(247,244,238,0.94)] backdrop-blur-xl">
      <div className="site-container grid min-h-20 grid-cols-[1fr_auto] items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
        <div className="justify-self-start">
          <Logo locale={locale} logoText={brandName} />
        </div>
        <DesktopNav />
        <div className="hidden items-center justify-self-end gap-4 lg:flex">
          <Link href={localizedHref("/account", locale)} className="nav-link text-xs">
            {myKeyHoldLabel}
          </Link>
          <LanguageSwitcher />
          <Link href={localizedHref(headerCtaHref, locale)} className="button button-dark text-xs">
            {headerCtaLabel}
          </Link>
        </div>
        <div className="justify-self-end lg:hidden">
          <MobileNav />
        </div>
      </div>
    </MotionHeader>
  );
}
