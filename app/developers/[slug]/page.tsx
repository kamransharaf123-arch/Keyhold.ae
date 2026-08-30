import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { developers } from "@/data/catalog";
import { developersForLocale } from "@/data/localized-catalog";
import { getProjectsByDeveloper } from "@/lib/real-estate";
import { localizedProjectCatalog } from "@/lib/i18n/localized-site";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { developer: "Developer", inventory: "Inventory", heading: "Projects linked to this developer.", displayed: "displayed", demoNotice: "Demo profile. Replace all corporate statements with verified developer information before production." },
  fr: { developer: "Promoteur", inventory: "Inventaire", heading: "Projets liés à ce promoteur.", displayed: "affiché(s)", demoNotice: "Profil de démonstration. Remplacez toutes les déclarations d’entreprise par des informations vérifiées avant la production." },
} as const;

export function generateStaticParams() {
  return developers.map((developer) => ({ slug: developer.slug }));
}

function getDeveloperByLocale(slug: string, locale: KeyHoldLocale) {
  return developersForLocale(locale).find((developer) => developer.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const developer = getDeveloperByLocale(slug, "en");
  const fallback: Metadata = developer ? { title: developer.name, description: developer.summary } : { title: "Developer Not Found" };
  return websitePageMetadata(`developer:${slug}`, `/developers/${slug}`, fallback, "en");
}

export function DeveloperDetailContent({ slug, locale = "en" }: { slug: string; locale?: KeyHoldLocale }) {
  const developer = getDeveloperByLocale(slug, locale);
  if (!developer) notFound();
  const projects = getProjectsByDeveloper(slug);
  const copy = COPY[locale];
  const previews = new Map(localizedProjectCatalog(locale).map((project) => [project.slug, project]));

  return (
    <>
      <PageHero eyebrow={copy.developer} title={developer.name} description={developer.summary} />
      <section className="site-container py-16 lg:py-24">
        {!developer.verifiedFactsOnly ? (
          <div className="mb-10 border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
            {copy.demoNotice}
          </div>
        ) : null}
        <div className="mb-8 flex items-end justify-between gap-6 border-b border-black/10 pb-5">
          <div><p className="eyebrow">{copy.inventory}</p><h2 className="font-display mt-2 text-3xl">{copy.heading}</h2></div>
          <span className="text-sm text-[var(--color-stone)]">{projects.length} {copy.displayed}</span>
        </div>
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const preview = previews.get(project.slug);
            return preview ? <ProjectCard key={project.slug} project={preview} /> : null;
          })}
        </div>
      </section>
    </>
  );
}

export default async function DeveloperDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DeveloperDetailContent slug={slug} locale="en" />;
}
