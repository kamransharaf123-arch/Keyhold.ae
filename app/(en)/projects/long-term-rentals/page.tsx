import type { Metadata } from "next";
import { ProjectCategoryPage } from "@/components/project-category-page";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Projects · Long-Term Rentals", title: "Long-term homes across Dubai.", description: "Annual rental opportunities across Dubai, presented with a clean path from discovery to direct advisor contact." },
  fr: { eyebrow: "Projets · Location longue durée", title: "Des logements longue durée à Dubaï.", description: "Des opportunités de location annuelle à Dubaï, avec un chemin clair de la découverte au contact direct avec un conseiller." },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("long-term-rentals", "/projects/long-term-rentals", { title: "Long-Term Rentals" }, "en");
}

export function LongTermRentalsContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("long-term-rentals", locale);
  const copy = COPY[locale];
  return <ProjectCategoryPage category="Long-Term" locale={locale} eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />;
}

export default function LongTermRentalsPage() {
  return <LongTermRentalsContent locale="en" />;
}
