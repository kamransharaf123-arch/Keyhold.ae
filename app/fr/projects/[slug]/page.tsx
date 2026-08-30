import type { Metadata } from "next";
import { projects as enProjects } from "@/data/catalog";
import { projectsForLocale } from "@/data/localized-catalog";
import { ProjectDetailContent } from "@/app/(en)/projects/[slug]/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export function generateStaticParams() {
  return enProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsForLocale("fr").find((item) => item.slug === slug);
  const fallback: Metadata = project
    ? { title: project.title, description: project.shortDescription, openGraph: { title: `${project.title} | KeyHold`, description: project.shortDescription, images: [{ url: project.heroImage }] } }
    : { title: "Project Not Found" };
  return websitePageMetadata(`project:${slug}`, `/projects/${slug}`, fallback, "fr");
}

export default async function ProjectDetailPageFr({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectDetailContent slug={slug} locale="fr" />;
}
