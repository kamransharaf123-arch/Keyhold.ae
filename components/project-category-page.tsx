import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { projectCatalog, type ProjectPreview } from "@/data/site";

export function ProjectCategoryPage({
  category,
  eyebrow,
  title,
  description,
}: {
  category: ProjectPreview["category"];
  eyebrow: string;
  title: string;
  description: string;
}) {
  const items = projectCatalog.filter((project) => project.category === category);

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <section className="site-container py-16 lg:py-24">
        <div className="mb-8 flex flex-col gap-3 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-[var(--color-stone)]">Availability and commercial terms can change. Confirm the latest position with a KeyHold advisor.</p>
          <Link href="/contact" className="text-link">Request current availability</Link>
        </div>
        {items.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {items.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
        ) : (
          <div className="border border-black/10 bg-[var(--color-bone)] p-8 text-sm leading-7 text-[var(--color-stone)]">
            No opportunities are currently displayed in this category. Contact KeyHold for the latest availability.
          </div>
        )}
      </section>
    </>
  );
}
