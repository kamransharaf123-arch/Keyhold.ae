import type { Metadata } from "next";
import { ProjectCategoryPage } from "@/components/project-category-page";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Projects · Off-Plan", title: "New projects, before handover.", description: "A curated view of Dubai projects under development, designed to later connect with payment plans, construction updates and investment analysis." },
  fr: { eyebrow: "Projets · Sur plan", title: "Nouveaux projets, avant livraison.", description: "Une sélection de projets à Dubaï en cours de construction, conçue pour se connecter aux plans de paiement, mises à jour de construction et analyses d’investissement." },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("off-plan", "/projects/off-plan", { title: "Off-Plan Projects" }, "en");
}

export function OffPlanContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("off-plan", locale);
  const copy = COPY[locale];
  return <ProjectCategoryPage category="Off-Plan" locale={locale} eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />;
}

export default function OffPlanPage() {
  return <OffPlanContent locale="en" />;
}
