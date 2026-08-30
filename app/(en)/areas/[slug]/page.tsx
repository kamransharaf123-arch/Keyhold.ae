import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { areas } from "@/data/catalog";
import { areasForLocale } from "@/data/localized-catalog";
import { getProjectsByArea } from "@/lib/real-estate";
import { localizedProjectCatalog } from "@/lib/i18n/localized-site";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { area: "Dubai Area", profile: "Area profile", glance: "At a glance.", available: "Available projects", heading: "Inventory linked to", displayed: "displayed", empty: "No demo inventory is currently linked to this area." },
  fr: { area: "Quartier de Dubaï", profile: "Profil du quartier", glance: "En un coup d’œil.", available: "Projets disponibles", heading: "Inventaire lié à", displayed: "affiché(s)", empty: "Aucun inventaire de démonstration n’est actuellement lié à ce quartier." },
} as const;

export function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

function getAreaByLocale(slug: string, locale: KeyHoldLocale) {
  return areasForLocale(locale).find((area) => area.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaByLocale(slug, "en");
  const fallback: Metadata = area ? { title: area.name, description: area.summary } : { title: "Area Not Found" };
  return websitePageMetadata(`area:${slug}`, `/areas/${slug}`, fallback, "en");
}

export function AreaDetailContent({ slug, locale = "en" }: { slug: string; locale?: KeyHoldLocale }) {
  const area = getAreaByLocale(slug, locale);
  if (!area) notFound();
  const projects = getProjectsByArea(slug);
  const copy = COPY[locale];
  const previews = new Map(localizedProjectCatalog(locale).map((project) => [project.slug, project]));

  return (
    <>
      <PageHero eyebrow={copy.area} title={area.name} description={area.summary} />
      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="eyebrow">{copy.profile}</p>
            <h2 className="font-display mt-3 text-3xl">{copy.glance}</h2>
          </div>
          <div className="grid border-l border-t border-black/10 sm:grid-cols-3">
            {area.highlights.map((highlight) => <div key={highlight} className="border-b border-r border-black/10 p-5 text-sm">{highlight}</div>)}
          </div>
        </div>

        <div className="mt-16 border-t border-black/10 pt-10">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div><p className="eyebrow">{copy.available}</p><h2 className="font-display mt-2 text-3xl">{copy.heading} {area.name}.</h2></div>
            <span className="text-sm text-[var(--color-stone)]">{projects.length} {copy.displayed}</span>
          </div>
          {projects.length > 0 ? (
            <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const preview = previews.get(project.slug);
                return preview ? <ProjectCard key={project.slug} project={preview} locale={locale} /> : null;
              })}
            </div>
          ) : <p className="text-sm text-[var(--color-stone)]">{copy.empty}</p>}
        </div>
      </section>
    </>
  );
}

export default async function AreaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AreaDetailContent slug={slug} locale="en" />;
}
