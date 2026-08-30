import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { DiscoveryExplorer } from "@/components/discovery/discovery-explorer";
import { areasForLocale, developersForLocale, projectsForLocale } from "@/data/localized-catalog";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Search & discovery", title: "Find property around the way you actually invest and live.", description: "Search by project, area, developer, property route, payment structure, cash available today, lifestyle and current unit availability.", loading: "Loading discovery tools…" },
  fr: { eyebrow: "Recherche & découverte", title: "Trouvez un bien selon votre façon réelle d’investir et de vivre.", description: "Recherchez par projet, quartier, promoteur, type de bien, structure de paiement, liquidités disponibles, style de vie et disponibilité actuelle des unités.", loading: "Chargement des outils de recherche…" },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("discover", "/discover", { title: "Discover Dubai Property", description: "Search and filter KeyHold Dubai property by area, developer, payment plan, handover, lifestyle, available cash and more." }, "en");
}

export function DiscoverContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  return (
    <>
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <Suspense fallback={<div className="site-container py-16 text-sm text-[var(--color-stone)]">{copy.loading}</div>}>
        <DiscoveryExplorer projects={projectsForLocale(locale)} developers={developersForLocale(locale)} areas={areasForLocale(locale)} locale={locale} />
      </Suspense>
    </>
  );
}

export default function DiscoverPage() {
  return <DiscoverContent locale="en" />;
}
