import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { developersForLocale } from "@/data/localized-catalog";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import { getProjectsByDeveloper } from "@/lib/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Developers", title: "Explore Dubai by developer.", description: "Browse opportunities by developer and understand the projects, locations and property types connected to each profile.", note: "Module 2 uses demo developer profiles. Replace all corporate facts with verified information before public launch.", projects: "projects" },
  fr: { eyebrow: "Promoteurs", title: "Explorez Dubaï par promoteur.", description: "Parcourez les opportunités par promoteur et comprenez les projets, emplacements et types de biens liés à chaque profil.", note: "Le Module 2 utilise des profils promoteurs de démonstration. Remplacez toutes les informations d’entreprise par des données vérifiées avant le lancement public.", projects: "projets" },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("developers", "/developers", { title: "Developers" }, "en");
}

export function DevelopersContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("developers", locale);
  const copy = COPY[locale];
  const developers = developersForLocale(locale);
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <section className="site-container py-16 lg:py-24">
        <div className="mb-8 border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
          {copy.note}
        </div>
        <div className="grid border-l border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer, index) => (
            <Link key={developer.slug} href={localizedHref(`/developers/${developer.slug}`, locale)} className="group min-h-52 border-b border-r border-black/10 p-7 transition-colors hover:bg-[var(--color-bone)]">
              <div className="flex items-start justify-between gap-4"><span className="text-xs text-[var(--color-stone)]">{String(index + 1).padStart(2, "0")}</span><span className="text-xs text-[var(--color-stone)]">{getProjectsByDeveloper(developer.slug).length} {copy.projects}</span></div>
              <h2 className="font-display mt-10 text-3xl">{developer.name}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">{developer.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default function DevelopersPage() {
  return <DevelopersContent locale="en" />;
}
