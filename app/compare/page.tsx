import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectComparison } from "@/components/discovery/project-comparison";
import { areasForLocale, developersForLocale, projectsForLocale } from "@/data/localized-catalog";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = { en: "Loading comparison…", fr: "Chargement de la comparaison…" } as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("compare", "/compare", { title: "Compare Projects", description: "Compare selected KeyHold Dubai property projects side by side." }, "en");
}

export function CompareContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  return (
    <Suspense fallback={<div className="site-container py-16 text-sm text-[var(--color-stone)]">{COPY[locale]}</div>}>
      <ProjectComparison projects={projectsForLocale(locale)} developers={developersForLocale(locale)} areas={areasForLocale(locale)} />
    </Suspense>
  );
}

export default function ComparePage() {
  return <CompareContent locale="en" />;
}
