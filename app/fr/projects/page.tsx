import type { Metadata } from "next";
import { ProjectsContent } from "@/app/projects/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("projects", "/projects", { title: "Projects" }, "fr");
}

export default function ProjectsPageFr() {
  return <ProjectsContent locale="fr" />;
}
