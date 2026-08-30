import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    eyebrow: "Legal", title: "Cookie Policy", description: "How KeyHold approaches optional analytics, marketing and essential website technologies.",
    h1: "Current website setup",
    p1: "The current public website does not require marketing or analytics cookies to provide its core browsing experience. If analytics, CRM, advertising or personalisation services are enabled, this policy and the site’s consent controls should reflect the technologies actually in use.",
    h2: "Consent controls",
    p2: "Where required, KeyHold should provide clear controls for optional analytics, advertising and personalisation technologies while preserving strictly necessary functionality.",
  },
  fr: {
    eyebrow: "Mentions légales", title: "Politique relative aux cookies", description: "L’approche de KeyHold concernant les cookies analytiques, marketing et essentiels au fonctionnement du site.",
    h1: "Configuration actuelle du site",
    p1: "Le site public actuel ne nécessite pas de cookies marketing ou analytiques pour offrir son expérience de navigation principale. Si des services d’analyse, de CRM, de publicité ou de personnalisation sont activés, cette politique et les contrôles de consentement du site devront refléter les technologies réellement utilisées.",
    h2: "Contrôles de consentement",
    p2: "Le cas échéant, KeyHold doit fournir des contrôles clairs pour les technologies optionnelles d’analyse, de publicité et de personnalisation, tout en préservant les fonctionnalités strictement nécessaires.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("cookies", "/cookies", { title: "Cookie Policy" }, "en");
}

export function CookiesContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("cookies", locale);
  const copy = COPY[locale];
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <article className="site-container max-w-4xl py-16 text-sm leading-8 text-[var(--color-stone)] lg:py-24">
        <h2 className="mb-3 text-base font-medium text-[var(--color-graphite)]">{copy.h1}</h2>
        <p>{copy.p1}</p>
        <h2 className="mb-3 mt-9 text-base font-medium text-[var(--color-graphite)]">{copy.h2}</h2>
        <p>{copy.p2}</p>
      </article>
    </>
  );
}

export default function CookiesPage() {
  return <CookiesContent locale="en" />;
}
