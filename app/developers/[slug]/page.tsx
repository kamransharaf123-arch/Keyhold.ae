import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { developers } from "@/data/catalog";
import { projectCatalog } from "@/data/site";
import { getDeveloperBySlug, getProjectsByDeveloper } from "@/lib/real-estate";

export function generateStaticParams() {
  return developers.map((developer) => ({ slug: developer.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const developer = getDeveloperBySlug(slug);
  return developer ? { title: developer.name, description: developer.summary } : { title: "Developer Not Found" };
}

export default async function DeveloperDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const developer = getDeveloperBySlug(slug);
  if (!developer) notFound();
  const projects = getProjectsByDeveloper(slug);
  const previews = new Map(projectCatalog.map((project) => [project.slug, project]));

  return (
    <>
      <PageHero eyebrow="Developer" title={developer.name} description={developer.summary} />
      <section className="site-container py-16 lg:py-24">
        {!developer.verifiedFactsOnly ? (
          <div className="mb-10 border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
            Demo profile. Replace all corporate statements with verified developer information before production.
          </div>
        ) : null}
        <div className="mb-8 flex items-end justify-between gap-6 border-b border-black/10 pb-5">
          <div><p className="eyebrow">Inventory</p><h2 className="font-display mt-2 text-3xl">Projects linked to this developer.</h2></div>
          <span className="text-sm text-[var(--color-stone)]">{projects.length} displayed</span>
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
