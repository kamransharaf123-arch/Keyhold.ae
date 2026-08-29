import type { MetadataRoute } from "next";
import { areas, constructionUpdates, developers, projects } from "@/data/real-estate";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/projects",
    "/projects/off-plan",
    "/projects/ready",
    "/projects/short-term-rentals",
    "/projects/long-term-rentals",
    "/updates",
    "/insights",
    "/services",
    "/who-we-are",
    "/developers",
    "/areas",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  const dynamicPaths = [
    ...projects.map((project) => `/projects/${project.slug}`),
    ...developers.map((developer) => `/developers/${developer.slug}`),
    ...areas.map((area) => `/areas/${area.slug}`),
    ...constructionUpdates.map((update) => `/updates/${update.slug}`),
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path.startsWith("/projects") || path.startsWith("/updates") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/projects") ? 0.9 : 0.7,
  }));
}
