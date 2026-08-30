"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { DiscoveryFilters } from "@/lib/discovery";
import type { AreaProfile, InvestmentGoal, LifestyleTag, ProjectCategory } from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

type SmartFinderProps = {
  areas: AreaProfile[];
  onApply: (patch: Partial<DiscoveryFilters>) => void;
  locale?: KeyHoldLocale;
};

const GOAL_LABELS: Record<KeyHoldLocale, Record<InvestmentGoal, string>> = {
  en: { "Capital growth": "Capital growth", "Rental income": "Rental income", "Low initial cash": "Low initial cash", "Ready income": "Ready income", "Family living": "Family home", "Waterfront": "Waterfront", "Holiday home": "Holiday home", "Golden Visa planning": "Golden Visa planning" },
  fr: { "Capital growth": "Croissance du capital", "Rental income": "Revenu locatif", "Low initial cash": "Faible apport initial", "Ready income": "Revenu immédiat", "Family living": "Résidence familiale", "Waterfront": "Bord de mer", "Holiday home": "Résidence de vacances", "Golden Visa planning": "Planification Golden Visa" },
};

const goalValues: InvestmentGoal[] = ["Capital growth", "Rental income", "Low initial cash", "Ready income", "Family living", "Waterfront", "Holiday home", "Golden Visa planning"];
const lifestyleOptions: LifestyleTag[] = ["Waterfront", "Beach", "Marina", "City centre", "Family", "Golf", "Walkable", "Quiet"];
const categoryOptions: ProjectCategory[] = ["Off-Plan", "Ready", "Short-Term", "Long-Term"];

const COPY = {
  en: {
    eyebrow: "30-second property finder", title: "Tell KeyHold what matters first.",
    intro: "This guided finder translates your priorities into the same transparent filters used by the main discovery engine.",
    primaryGoal: "Primary goal", anyGoal: "Any goal",
    propertyRoute: "Property route", anyRoute: "Any route",
    lifestyle: "Lifestyle", anyLifestyle: "Any lifestyle",
    preferredArea: "Preferred area", anywhere: "Anywhere in Dubai",
    maxPrice: "Maximum listing price / rent", noMax: "No maximum",
    cashToday: "Cash available today", notSpecified: "Not specified",
    showMatches: "Show my matches",
    footer: "Results are discovery matches, not investment advice or guaranteed availability. Residency and visa eligibility always require current independent confirmation.",
  },
  fr: {
    eyebrow: "Recherche de bien en 30 secondes", title: "Dites à KeyHold ce qui compte le plus.",
    intro: "Cet assistant guidé traduit vos priorités dans les mêmes filtres transparents que le moteur de recherche principal.",
    primaryGoal: "Objectif principal", anyGoal: "Tout objectif",
    propertyRoute: "Catégorie de bien", anyRoute: "Toute catégorie",
    lifestyle: "Style de vie", anyLifestyle: "Tout style de vie",
    preferredArea: "Quartier préféré", anywhere: "N’importe où à Dubaï",
    maxPrice: "Prix / loyer maximum affiché", noMax: "Aucun maximum",
    cashToday: "Liquidités disponibles aujourd’hui", notSpecified: "Non précisé",
    showMatches: "Afficher mes résultats",
    footer: "Les résultats sont des correspondances de découverte, non un conseil en investissement ni une disponibilité garantie. L’éligibilité à la résidence et au visa nécessite toujours une confirmation indépendante actuelle.",
  },
} as const;

export function SmartFinder({ areas, onApply, locale = "en" }: SmartFinderProps) {
  const copy = COPY[locale];
  const goalLabels = GOAL_LABELS[locale];
  const [goal, setGoal] = useState<InvestmentGoal | "">("");
  const [category, setCategory] = useState<ProjectCategory | "">("");
  const [lifestyle, setLifestyle] = useState<LifestyleTag | "">("");
  const [areaSlug, setAreaSlug] = useState("");
  const [budget, setBudget] = useState("");
  const [cashToday, setCashToday] = useState("");

  const canApply = useMemo(
    () => Boolean(goal || category || lifestyle || areaSlug || budget || cashToday),
    [goal, category, lifestyle, areaSlug, budget, cashToday],
  );

  function applyFinder() {
    const maxPriceAed = budget ? Number(budget) : null;
    const maxInitialCashAed = cashToday ? Number(cashToday) : null;
    onApply({
      investmentGoals: goal ? [goal] : [],
      categories: category ? [category] : [],
      lifestyleTags: lifestyle ? [lifestyle] : [],
      areaSlugs: areaSlug ? [areaSlug] : [],
      maxPriceAed: maxPriceAed !== null && Number.isFinite(maxPriceAed) ? maxPriceAed : null,
      maxInitialCashAed: maxInitialCashAed !== null && Number.isFinite(maxInitialCashAed) ? maxInitialCashAed : null,
      sort: cashToday ? "initial-cash" : "relevance",
    });
  }

  return (
    <div className="border border-[var(--color-teal)]/20 bg-[var(--color-teal-soft)] p-5 sm:p-7">
      <div className="max-w-2xl">
        <p className="text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-teal-deep)]">{copy.eyebrow}</p>
        <h3 className="font-display mt-3 text-3xl tracking-[-0.035em]">{copy.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-stone)]">{copy.intro}</p>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.primaryGoal}</span>
          <select value={goal} onChange={(event: ChangeEvent<HTMLSelectElement>) => setGoal(event.target.value as InvestmentGoal | "")} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">{copy.anyGoal}</option>
            {goalValues.map((value) => <option key={value} value={value}>{goalLabels[value]}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.propertyRoute}</span>
          <select value={category} onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategory(event.target.value as ProjectCategory | "")} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">{copy.anyRoute}</option>
            {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.lifestyle}</span>
          <select value={lifestyle} onChange={(event: ChangeEvent<HTMLSelectElement>) => setLifestyle(event.target.value as LifestyleTag | "")} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">{copy.anyLifestyle}</option>
            {lifestyleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.preferredArea}</span>
          <select value={areaSlug} onChange={(event: ChangeEvent<HTMLSelectElement>) => setAreaSlug(event.target.value)} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">{copy.anywhere}</option>
            {areas.map((area) => <option key={area.slug} value={area.slug}>{area.name}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.maxPrice}</span>
          <select value={budget} onChange={(event: ChangeEvent<HTMLSelectElement>) => setBudget(event.target.value)} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">{copy.noMax}</option>
            <option value="1000000">AED 1M</option>
            <option value="2000000">AED 2M</option>
            <option value="3000000">AED 3M</option>
            <option value="5000000">AED 5M</option>
            <option value="10000000">AED 10M</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.cashToday}</span>
          <select value={cashToday} onChange={(event: ChangeEvent<HTMLSelectElement>) => setCashToday(event.target.value)} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">{copy.notSpecified}</option>
            <option value="250000">AED 250K</option>
            <option value="500000">AED 500K</option>
            <option value="750000">AED 750K</option>
            <option value="1000000">AED 1M</option>
            <option value="2000000">AED 2M</option>
          </select>
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={applyFinder} disabled={!canApply} className="button button-dark disabled:cursor-not-allowed disabled:opacity-40">{copy.showMatches}</button>
        <p className="text-xs leading-5 text-[var(--color-stone)]">{copy.footer}</p>
      </div>
    </div>
  );
}
