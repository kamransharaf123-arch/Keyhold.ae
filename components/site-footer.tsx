"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/data/site";
import { localizedFeaturedProjects, localizedInsights, localizedServices } from "@/lib/i18n/localized-site";
import { localeFromPathname, localizedHref } from "@/lib/i18n/locale";
import { websiteCmsEnabled, websiteNavigation, websiteSettings } from "@/data/website-content";

const FR_COMPANY_LINKS: Record<string, string> = {
  "Who We Are": "Qui sommes-nous",
  Developers: "Promoteurs",
  Areas: "Quartiers",
  Contact: "Contact",
};
const FR_LEGAL: Record<string, string> = { Privacy: "Confidentialité", Terms: "Conditions", Cookies: "Cookies" };
const FR_HEADINGS = {
  projects: "Projets & Biens",
  guides: "Guides & Analyses",
  company: "Qui sommes-nous",
};

const companyLinksBase = [
  { label: "Who We Are", href: "/who-we-are" },
  { label: "Developers", href: "/developers" },
  { label: "Areas", href: "/areas" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const isFr = locale === "fr";
  const settings = websiteSettings(locale);
  const featuredProjects = localizedFeaturedProjects(locale);
  const insights = localizedInsights(locale);
  const services = localizedServices(locale);
  const companyLinks = websiteCmsEnabled && websiteNavigation("footer-company", locale).length
    ? websiteNavigation("footer-company", locale)
    : companyLinksBase.map((item) => ({ label: isFr ? FR_COMPANY_LINKS[item.label] ?? item.label : item.label, href: item.href }));
  const legalLinks = websiteCmsEnabled && websiteNavigation("legal", locale).length
    ? websiteNavigation("legal", locale)
    : [
        { label: isFr ? FR_LEGAL.Privacy : "Privacy", href: "/privacy" },
        { label: isFr ? FR_LEGAL.Terms : "Terms", href: "/terms" },
        { label: isFr ? FR_LEGAL.Cookies : "Cookies", href: "/cookies" },
      ];

  const hasGoogleReviews = siteConfig.googleReviews.rating !== null && Boolean(siteConfig.googleReviews.href);
  const tagline = settings?.footerTagline || (isFr
    ? "Conseil immobilier à Dubaï, présenté avec clarté, contexte et accompagnement réfléchi."
    : "Dubai real estate advisory for off-plan, ready properties and rental opportunities, presented with clarity and considered guidance.");
  const disclaimer = settings?.footerDisclaimer || (isFr
    ? "Les informations sur les biens, les prix, la disponibilité, les plans de paiement et les dates d’achèvement sont sous réserve de confirmation par le promoteur, le propriétaire ou le vendeur autorisé concerné. Les chiffres d’investissement affichés sur KeyHold sont des estimations et ne constituent pas des rendements garantis."
    : "Property information, pricing, availability, payment plans and completion dates are subject to confirmation by the relevant developer, owner or authorised seller. Any investment figures shown on KeyHold are estimates and do not constitute guaranteed returns.");
  const copyrightText = settings?.copyrightText || (isFr ? "KeyHold. Tous droits réservés." : "KeyHold. All rights reserved.");
  const locationsLabel = settings?.locationsLabel || (isFr ? "Dubaï · EAU" : "Dubai · UAE");

  return (
    <footer className="border-t border-black/[0.08] bg-[var(--color-soft-white)]">
      <div className="site-container py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <FooterHeading>{isFr ? FR_HEADINGS.projects : "Projects & Properties"}</FooterHeading>
            <FooterList>
              {["off-plan", "ready", "short-term-rentals", "long-term-rentals"].map((slug) => (
                <FooterLink key={slug} href={localizedHref(`/projects/${slug}`, locale)}>
                  {isFr
                    ? { "off-plan": "Sur plan", ready: "Prêt", "short-term-rentals": "Location courte durée", "long-term-rentals": "Location longue durée" }[slug]
                    : { "off-plan": "Off-Plan", ready: "Ready", "short-term-rentals": "Short-Term Rentals", "long-term-rentals": "Long-Term Rentals" }[slug]}
                </FooterLink>
              ))}
              {featuredProjects.slice(0, 3).map((project) => (
                <FooterLink key={project.slug} href={localizedHref(`/projects/${project.slug}`, locale)}>{project.title}</FooterLink>
              ))}
              <FooterLink href={localizedHref("/discover", locale)}>{isFr ? "Recherche intelligente" : "Smart Property Discovery"}</FooterLink>
              <FooterLink href={localizedHref("/projects", locale)}>{isFr ? "Voir tous les projets" : "View All Projects"}</FooterLink>
            </FooterList>
          </div>
          <div>
            <FooterHeading>{isFr ? FR_HEADINGS.guides : "Guides & Insights"}</FooterHeading>
            <FooterList>
              {insights.map((item) => (
                <FooterLink key={item.slug} href={localizedHref("/insights", locale)}>{item.category}</FooterLink>
              ))}
              <FooterLink href={localizedHref("/updates", locale)}>{isFr ? "Avancement de construction" : "Construction Updates"}</FooterLink>
              <FooterLink href={localizedHref("/investment-calculator", locale)}>{isFr ? "Simulateur d’investissement" : "Investment Calculator"}</FooterLink>
              <FooterLink href={localizedHref("/areas", locale)}>{isFr ? "Quartiers de Dubaï" : "Dubai Areas"}</FooterLink>
            </FooterList>
          </div>
          <div>
            <FooterHeading>Services</FooterHeading>
            <FooterList>
              {services.slice(0, 6).map((service) => (
                <FooterLink key={service.title} href={localizedHref("/services", locale)}>{service.title}</FooterLink>
              ))}
            </FooterList>
          </div>
          <div>
            <FooterHeading>{isFr ? FR_HEADINGS.company : "Who We Are"}</FooterHeading>
            <FooterList>
              {companyLinks.map((item) => (
                <FooterLink key={item.href} href={localizedHref(item.href, locale)}>{item.label}</FooterLink>
              ))}
              {legalLinks.slice(0, 2).map((item) => (
                <FooterLink key={item.href} href={localizedHref(item.href, locale)}>{item.label}</FooterLink>
              ))}
            </FooterList>
          </div>
        </div>

        <div className="mt-16 border-t border-black/10 pt-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr]">
            <div>
              <Logo locale={locale} logoText={settings?.logoText || "KEYHOLD"} />
              <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--color-stone)]">{tagline}</p>
              {siteConfig.socials.length > 0 || hasGoogleReviews ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {siteConfig.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center border border-black/10 px-3 text-xs text-[var(--color-stone)] transition-colors hover:border-black/20 hover:text-[var(--color-graphite)]"
                    >
                      {social.label}
                    </a>
                  ))}
                  {hasGoogleReviews ? (
                    <a
                      href={siteConfig.googleReviews.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center border border-black/10 px-3 text-xs text-[var(--color-stone)] transition-colors hover:border-black/20 hover:text-[var(--color-graphite)]"
                    >
                      Google {siteConfig.googleReviews.rating?.toFixed(1)}
                      {siteConfig.googleReviews.reviewCount ? ` · ${siteConfig.googleReviews.reviewCount} reviews` : ""}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div>
              <FooterHeading>{isFr ? "Société" : "Company"}</FooterHeading>
              <div className="space-y-2 text-sm leading-6 text-[var(--color-stone)]">
                <p>{siteConfig.company.legalName}</p>
                {siteConfig.addressLine ? <p>{siteConfig.addressLine}</p> : null}
                <p>{siteConfig.location}</p>
                {siteConfig.company.orn ? <p>RERA ORN {siteConfig.company.orn}</p> : null}
                {siteConfig.company.tradeLicense ? <p>Trade License {siteConfig.company.tradeLicense}</p> : null}
              </div>
            </div>
            <div>
              <FooterHeading>Contact</FooterHeading>
              <div className="space-y-2 text-sm leading-6 text-[var(--color-stone)]">
                <a className="block transition-colors hover:text-[var(--color-graphite)]" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                {siteConfig.phone ? <a className="block transition-colors hover:text-[var(--color-graphite)]" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>{siteConfig.phone}</a> : null}
                <p>{siteConfig.languages.join(" · ")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 border-t border-black/10 pt-6 text-xs text-[var(--color-stone)] sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <p>© {new Date().getFullYear()} {copyrightText}</p>
          <p className="uppercase tracking-[0.16em] sm:text-center">{locationsLabel}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-self-end">
            {legalLinks.map((item) => (
              <Link key={item.href} href={localizedHref(item.href, locale)} className="hover:text-[var(--color-graphite)]">{item.label}</Link>
            ))}
          </div>
        </div>

        <div className="mt-8 max-w-5xl text-[0.7rem] leading-6 text-[var(--color-stone)]">
          {disclaimer}
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-graphite)]">{children}</h2>;
}

function FooterList({ children }: { children: ReactNode }) {
  return <ul className="space-y-3">{children}</ul>;
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-[var(--color-stone)] transition-colors hover:text-[var(--color-graphite)]">
        {children}
      </Link>
    </li>
  );
}
