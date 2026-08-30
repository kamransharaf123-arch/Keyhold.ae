import type { Metadata } from "next";
import { developers } from "@/data/catalog";
import { developersForLocale } from "@/data/localized-catalog";
import { DeveloperDetailContent } from "@/app/developers/[slug]/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export function generateStaticParams() {
  return developers.map((developer) => ({ slug: developer.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const developer = developersForLocale("fr").find((item) => item.slug === slug);
  const fallback: Metadata = developer ? { title: developer.name, description: developer.summary } : { title: "Developer Not Found" };
  return websitePageMetadata(`developer:${slug}`, `/developers/${slug}`, fallback, "fr");
}

export default async function DeveloperDetailPageFr({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DeveloperDetailContent slug={slug} locale="fr" />;
}
