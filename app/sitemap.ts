import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
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

  return paths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path.startsWith("/projects") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/projects") ? 0.9 : 0.7,
  }));
}
