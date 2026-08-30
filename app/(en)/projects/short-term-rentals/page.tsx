import type { Metadata } from "next";
import { ProjectCategoryPage } from "@/components/project-category-page";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Projects · Short-Term Rentals", title: "Flexible Dubai stays, curated properly.", description: "Short-term rental opportunities presented with the same considered visual language as the wider KeyHold platform." },
  fr: { eyebrow: "Projets · Location courte durée", title: "Des séjours flexibles à Dubaï, soigneusement sélectionnés.", description: "Des opportunités de location courte durée présentées avec le même langage visuel réfléchi que l’ensemble de la plateforme KeyHold." },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("short-term-rentals", "/projects/short-term-rentals", { title: "Short-Term Rentals" }, "en");
}

export function ShortTermRentalsContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("short-term-rentals", locale);
  const copy = COPY[locale];
  return <ProjectCategoryPage category="Short-Term" locale={locale} eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />;
}

export default function ShortTermRentalsPage() {
  return <ShortTermRentalsContent locale="en" />;
}
