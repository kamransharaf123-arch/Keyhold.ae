import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { projectCatalog, projectNav } from "@/data/site";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore KeyHold project categories across off-plan, ready, short-term and long-term property in Dubai.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Dubai property, organised around how you want to move."
        description="Browse off-plan opportunities, ready homes and rental categories through a clean, intentionally simple structure."
      />
      <section className="site-container py-14 lg:py-20">
        <div className="flex flex-wrap gap-2 border-b border-black/10 pb-8">
          {projectNav.map((item) => (
            <Link key={item.href} href={item.href} className="border border-black/10 px-4 py-3 text-sm transition-colors hover:bg-[var(--color-bone)]">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="grid gap-x-6 gap-y-12 py-12 md:grid-cols-2 xl:grid-cols-3">
          {projectCatalog.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </section>
    </>
  );
}
