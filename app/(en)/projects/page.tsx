import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { projectNav } from "@/data/site";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedProjectCatalog } from "@/lib/i18n/localized-site";
import type { KeyHoldLocale } from "@/types/localization";

const FR_NAV: Record<string, string> = {
  "Off-Plan": "Sur plan",
  Ready: "Prêt",
  "Short-Term Rentals": "Location courte durée",
  "Long-Term Rentals": "Location longue durée",
};

const COPY = {
  en: { eyebrow: "Projects", title: "Dubai property, organised around how you want to move.", description: "Browse off-plan opportunities, ready homes and rental categories through a clean, intentionally simple structure.", discoveryEyebrow: "Smart discovery", discoveryTitle: "Search by budget, cash today, area, developer and lifestyle.", discoveryCta: "Open property finder" },
  fr: { eyebrow: "Projets", title: "L’immobilier à Dubaï, organisé selon votre façon d’avancer.", description: "Parcourez les opportunités sur plan, les biens prêts et les catégories de location via une structure claire et volontairement simple.", discoveryEyebrow: "Recherche intelligente", discoveryTitle: "Recherchez par budget, liquidités disponibles, quartier, promoteur et style de vie.", discoveryCta: "Ouvrir le moteur de recherche" },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("projects", "/projects", { title: "Projects", description: "Explore KeyHold project categories across off-plan, ready, short-term and long-term property in Dubai." }, "en");
}

export function ProjectsContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("projects", locale);
  const copy = COPY[locale];
  const projectCatalog = localizedProjectCatalog(locale);
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <section className="site-container py-14 lg:py-20">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-5 border border-black/10 bg-[var(--color-bone)] p-5 sm:p-7">
          <div>
            <p className="eyebrow">{copy.discoveryEyebrow}</p>
            <h2 className="font-display mt-2 text-3xl tracking-[-0.03em]">{copy.discoveryTitle}</h2>
          </div>
          <Link href={localizedHref("/discover", locale)} className="button button-dark">{copy.discoveryCta}</Link>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-black/10 pb-8">
          {projectNav.map((item) => (
            <Link key={item.href} href={localizedHref(item.href, locale)} className="border border-black/10 px-4 py-3 text-sm transition-colors hover:bg-[var(--color-bone)]">
              {locale === "fr" ? FR_NAV[item.label] ?? item.label : item.label}
            </Link>
          ))}
        </div>
        <div className="grid gap-x-6 gap-y-12 py-12 md:grid-cols-2 xl:grid-cols-3">
          {projectCatalog.map((project) => <ProjectCard key={project.slug} project={project} locale={locale} />)}
        </div>
      </section>
    </>
  );
}

export default function ProjectsPage() {
  return <ProjectsContent locale="en" />;
}
