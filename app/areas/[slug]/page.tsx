import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { areas } from "@/data/real-estate";
import { projectCatalog } from "@/data/site";
import { getAreaBySlug, getProjectsByArea } from "@/lib/real-estate";

export function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  return area ? { title: area.name, description: area.summary } : { title: "Area Not Found" };
}

export default async function AreaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) notFound();
  const projects = getProjectsByArea(slug);
  const previews = new Map(projectCatalog.map((project) => [project.slug, project]));

  return (
    <>
      <PageHero eyebrow="Dubai Area" title={area.name} description={area.summary} />
      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="eyebrow">Area profile</p>
            <h2 className="font-display mt-3 text-3xl">At a glance.</h2>
          </div>
          <div className="grid border-l border-t border-black/10 sm:grid-cols-3">
            {area.highlights.map((highlight) => <div key={highlight} className="border-b border-r border-black/10 p-5 text-sm">{highlight}</div>)}
          </div>
        </div>

        <div className="mt-16 border-t border-black/10 pt-10">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div><p className="eyebrow">Available projects</p><h2 className="font-display mt-2 text-3xl">Inventory linked to {area.name}.</h2></div>
            <span className="text-sm text-[var(--color-stone)]">{projects.length} displayed</span>
          </div>
          {projects.length > 0 ? (
            <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const preview = previews.get(project.slug);
                return preview ? <ProjectCard key={project.slug} project={preview} /> : null;
              })}
            </div>
          ) : <p className="text-sm text-[var(--color-stone)]">No demo inventory is currently linked to this area.</p>}
        </div>
      </section>
    </>
  );
}
