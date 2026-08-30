"use client";

import { useMemo, useState } from "react";
import { InvestmentSimulator } from "@/components/investment/investment-simulator";
import type { Project } from "@/types/real-estate";

export function InvestmentProjectPicker({ projects }: { projects: Project[] }) {
  const eligible = useMemo(
    () => projects.filter((project) => project.investment && project.priceFromAed !== null),
    [projects],
  );
  const [slug, setSlug] = useState(eligible[0]?.slug ?? "");
  const project = eligible.find((item) => item.slug === slug) ?? eligible[0];

  if (!project || !project.investment || project.priceFromAed === null) {
    return (
      <div className="border border-black/10 bg-[var(--color-bone)] p-6 text-sm leading-7 text-[var(--color-stone)]">
        No acquisition project currently has investment assumptions configured.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <label className="block max-w-xl">
        <span className="mb-2 block text-xs font-medium text-[var(--color-stone)]">Choose a demo project model</span>
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
      />
    </div>
  );
}
