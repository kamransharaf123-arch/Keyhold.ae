import { areas, constructionUpdates, developers, projects } from "@/data/real-estate";
import type { Project, ProjectCategory } from "@/types/real-estate";

export function getAllProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((project) => project.category === category);
}

export function getDeveloperBySlug(slug: string) {
  return developers.find((developer) => developer.slug === slug);
}

export function getProjectsByDeveloper(slug: string): Project[] {
  return projects.filter((project) => project.developerSlug === slug);
}

export function getAreaBySlug(slug: string) {
  return areas.find((area) => area.slug === slug);
}

export function getProjectsByArea(slug: string): Project[] {
  return projects.filter((project) => project.areaSlug === slug);
}

export function getConstructionUpdateBySlug(slug: string) {
  return constructionUpdates.find((update) => update.slug === slug);
}

export function getConstructionUpdatesForProject(projectSlug: string) {
  return constructionUpdates
    .filter((update) => update.projectSlug === projectSlug)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getRelatedProjects(project: Project, limit = 3): Project[] {
  const sameArea = projects.filter(
    (candidate) => candidate.slug !== project.slug && candidate.areaSlug === project.areaSlug,
  );
  const sameCategory = projects.filter(
    (candidate) =>
      candidate.slug !== project.slug &&
      candidate.category === project.category &&
      !sameArea.some((item) => item.slug === candidate.slug),
  );
  const fallback = projects.filter(
    (candidate) =>
      candidate.slug !== project.slug &&
      !sameArea.some((item) => item.slug === candidate.slug) &&
      !sameCategory.some((item) => item.slug === candidate.slug),
  );

  return [...sameArea, ...sameCategory, ...fallback].slice(0, limit);
}
