import type { Metadata } from "next";
import { Suspense } from "react";
import { InvestmentProjectPicker } from "@/components/investment/investment-project-picker";
import { projectsForLocale } from "@/data/localized-catalog";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Investment tools", title: "Understand the whole investment, not just the headline price.", description: "Explore acquisition costs, gross and net rental yield, financing, annual cash flow, payment-plan exposure and modelled exit outcomes. All demo assumptions remain editable and must be verified before use in a live transaction.", loading: "Loading investment calculator…" },
  fr: { eyebrow: "Outils d’investissement", title: "Comprenez l’investissement dans son ensemble, pas seulement le prix affiché.", description: "Explorez les coûts d’acquisition, le rendement locatif brut et net, le financement, les flux de trésorerie annuels, l’exposition au plan de paiement et les scénarios de sortie modélisés. Toutes les hypothèses de démonstration restent modifiables et doivent être vérifiées avant toute transaction réelle.", loading: "Chargement du simulateur d’investissement…" },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("investment-calculator", "/investment-calculator", { title: "Investment Calculator", description: "Model acquisition costs, rental economics, financing, payment plans and exit scenarios with the KeyHold investment calculator.", alternates: { canonical: "/investment-calculator" } }, "en");
}

export function InvestmentCalculatorContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("investment-calculator", locale);
  const copy = COPY[locale];
  const eligibleProjects = projectsForLocale(locale).filter((project) => project.investment && project.priceFromAed !== null);

  return (
    <>
      <section className="site-container py-14 lg:py-20">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="display-title mt-4 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">{page?.heroTitle || copy.title}</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-stone)]">
          {page?.heroSubtitle || copy.description}
        </p>
      </section>

      <section className="site-container pb-20">
        <Suspense fallback={<div className="text-sm text-[var(--color-stone)]">{copy.loading}</div>}>
          <InvestmentProjectPicker projects={eligibleProjects} locale={locale} />
        </Suspense>
      </section>
    </>
  );
}

export default function InvestmentCalculatorPage() {
  return <InvestmentCalculatorContent locale="en" />;
}
