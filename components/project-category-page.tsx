import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import type { ProjectPreview } from "@/data/site";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedProjectCatalog } from "@/lib/i18n/localized-site";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { availability: "Availability and commercial terms can change. Confirm the latest position with a KeyHold advisor.", request: "Request current availability", empty: "No opportunities are currently displayed in this category. Contact KeyHold for the latest availability." },
  fr: { availability: "La disponibilité et les conditions commerciales peuvent changer. Confirmez la situation actuelle avec un conseiller KeyHold.", request: "Demander la disponibilité actuelle", empty: "Aucune opportunité n’est actuellement affichée dans cette catégorie. Contactez KeyHold pour la disponibilité la plus récente." },
} as const;

export function ProjectCategoryPage({
  category,
  eyebrow,
  title,
  description,
  locale = "en",
}: {
  category: ProjectPreview["category"];
  eyebrow: string;
  title: string;
  description: string;
  locale?: KeyHoldLocale;
}) {
  const items = localizedProjectCatalog(locale).filter((project) => project.category === category);
  const copy = COPY[locale];

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <section className="site-container py-16 lg:py-24">
        <div className="mb-8 flex flex-col gap-3 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-[var(--color-stone)]">{copy.availability}</p>
          <Link href={localizedHref("/contact", locale)} className="text-link">{copy.request}</Link>
        </div>
        {items.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {items.map((project) => <ProjectCard key={project.slug} project={project} locale={locale} />)}
          </div>
        ) : (
          <div className="border border-black/10 bg-[var(--color-bone)] p-8 text-sm leading-7 text-[var(--color-stone)]">
            {copy.empty}
          </div>
        )}
      </section>
    </>
  );
}
