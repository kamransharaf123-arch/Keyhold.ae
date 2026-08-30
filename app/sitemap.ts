import type { MetadataRoute } from "next";
import { areas, constructionUpdates, developers, projects } from "@/data/catalog";
import { siteConfig } from "@/data/site";
import { localizedHref } from "@/lib/i18n/locale";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/projects",
    "/projects/off-plan",
    "/projects/ready",
    "/projects/short-term-rentals",
    "/projects/long-term-rentals",
    "/discover",
    "/compare",
    "/investment-calculator",
    "/intelligence",
    "/intelligence-methodology",
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

  const paths = [...staticPaths, ...dynamicPaths];

  return paths.flatMap((path) => {
    const entry = (locale: "en" | "fr") => ({
      url: `${siteConfig.url}${localizedHref(path || "/", locale)}`,
      lastModified: new Date(),
      changeFrequency: (path === "" || path.startsWith("/projects") || path.startsWith("/updates") ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "" ? 1 : path.startsWith("/projects") ? 0.9 : 0.7,
      alternates: {
        languages: {
          en: `${siteConfig.url}${localizedHref(path || "/", "en")}`,
          fr: `${siteConfig.url}${localizedHref(path || "/", "fr")}`,
        },
      },
    });
    return [entry("en"), entry("fr")];
  });
}
