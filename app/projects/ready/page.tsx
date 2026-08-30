import type { Metadata } from "next";
import { ProjectCategoryPage } from "@/components/project-category-page";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Projects · Ready", title: "Completed property, ready for the next move.", description: "A refined catalogue for completed Dubai homes, designed around availability, comparables, ownership costs and informed decision-making." },
  fr: { eyebrow: "Projets · Prêt", title: "Biens achevés, prêts pour la prochaine étape.", description: "Un catalogue soigné de biens achevés à Dubaï, pensé autour de la disponibilité, des comparables, des coûts de possession et d’une décision éclairée." },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("ready", "/projects/ready", { title: "Ready Properties" }, "en");
}

export function ReadyContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("ready", locale);
  const copy = COPY[locale];
  return <ProjectCategoryPage category="Ready" locale={locale} eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />;
}

export default function ReadyPage() {
  return <ReadyContent locale="en" />;
}
