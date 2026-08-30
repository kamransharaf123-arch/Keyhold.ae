import type { Metadata } from "next";
import { areas } from "@/data/catalog";
import { areasForLocale } from "@/data/localized-catalog";
import { AreaDetailContent } from "@/app/areas/[slug]/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = areasForLocale("fr").find((item) => item.slug === slug);
  const fallback: Metadata = area ? { title: area.name, description: area.summary } : { title: "Area Not Found" };
  return websitePageMetadata(`area:${slug}`, `/areas/${slug}`, fallback, "fr");
}

export default async function AreaDetailPageFr({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AreaDetailContent slug={slug} locale="fr" />;
}
