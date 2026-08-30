import type { Metadata } from "next";
import { constructionUpdates } from "@/data/catalog";
import { constructionUpdatesForLocale } from "@/data/localized-catalog";
import { ConstructionUpdateDetailContent } from "@/app/(en)/updates/[slug]/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export function generateStaticParams() {
  return constructionUpdates.map((update) => ({ slug: update.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const update = constructionUpdatesForLocale("fr").find((item) => item.slug === slug);
  const fallback: Metadata = update ? { title: `${update.project} · ${update.updatedAt}`, description: update.summary } : { title: "Update Not Found" };
  return websitePageMetadata(`update:${slug}`, `/updates/${slug}`, fallback, "fr");
}

export default async function ConstructionUpdateDetailPageFr({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ConstructionUpdateDetailContent slug={slug} locale="fr" />;
}
