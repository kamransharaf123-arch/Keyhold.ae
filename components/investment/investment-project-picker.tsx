"use client";

import { useMemo, useState } from "react";
import { InvestmentSimulator } from "@/components/investment/investment-simulator";
import type { Project } from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { empty: "No acquisition project currently has investment assumptions configured.", choose: "Choose a demo project model" },
  fr: { empty: "Aucun projet d’acquisition ne dispose actuellement d’hypothèses d’investissement configurées.", choose: "Choisir un modèle de projet de démonstration" },
} as const;

export function InvestmentProjectPicker({ projects, locale = "en" }: { projects: Project[]; locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  const eligible = useMemo(
    () => projects.filter((project) => project.investment && project.priceFromAed !== null),
    [projects],
  );
  const [slug, setSlug] = useState(eligible[0]?.slug ?? "");
  const project = eligible.find((item) => item.slug === slug) ?? eligible[0];

  if (!project || !project.investment || project.priceFromAed === null) {
    return (
      <div className="border border-black/10 bg-[var(--color-bone)] p-6 text-sm leading-7 text-[var(--color-stone)]">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <label className="block max-w-xl">
        <span className="mb-2 block text-xs font-medium text-[var(--color-stone)]">{copy.choose}</span>
        <select
          value={project.slug}
          onChange={(event) => setSlug(event.target.value)}
          className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-4 text-base outline-none focus:border-[var(--color-champagne)]"
        >
          {eligible.map((item) => (
            <option key={item.slug} value={item.slug}>{item.title} · {item.location}</option>
          ))}
        </select>
      </label>

      <InvestmentSimulator
        key={project.slug}
        projectTitle={project.title}
        projectSlug={`calculator-${project.slug}`}
        profile={project.investment}
        defaultPurchasePriceAed={project.priceFromAed}
        defaultUnitSizeSqft={project.investment.defaultUnitSizeSqft}
        paymentPlan={project.paymentPlan}
        projectCategory={project.category}
        locale={locale}
      />
    </div>
  );
}
