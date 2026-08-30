"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { DiscoveryFilters } from "@/lib/discovery";
import type { AreaProfile, InvestmentGoal, LifestyleTag, ProjectCategory } from "@/types/real-estate";

type SmartFinderProps = {
  areas: AreaProfile[];
  onApply: (patch: Partial<DiscoveryFilters>) => void;
};

const goalOptions: Array<{ label: string; value: InvestmentGoal }> = [
  { label: "Capital growth", value: "Capital growth" },
  { label: "Rental income", value: "Rental income" },
  { label: "Low initial cash", value: "Low initial cash" },
  { label: "Ready income", value: "Ready income" },
  { label: "Family home", value: "Family living" },
  { label: "Holiday home", value: "Holiday home" },
  { label: "Golden Visa planning", value: "Golden Visa planning" },
];

const lifestyleOptions: LifestyleTag[] = ["Waterfront", "Beach", "Marina", "City centre", "Family", "Golf", "Walkable", "Quiet"];
const categoryOptions: ProjectCategory[] = ["Off-Plan", "Ready", "Short-Term", "Long-Term"];

export function SmartFinder({ areas, onApply }: SmartFinderProps) {
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
        <p className="text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-teal-deep)]">30-second property finder</p>
        <h3 className="font-display mt-3 text-3xl tracking-[-0.035em]">Tell KeyHold what matters first.</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-stone)]">This guided finder translates your priorities into the same transparent filters used by the main discovery engine.</p>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">Primary goal</span>
          <select value={goal} onChange={(event: ChangeEvent<HTMLSelectElement>) => setGoal(event.target.value as InvestmentGoal | "")} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">Any goal</option>
            {goalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">Property route</span>
          <select value={category} onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategory(event.target.value as ProjectCategory | "")} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">Any route</option>
            {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">Lifestyle</span>
          <select value={lifestyle} onChange={(event: ChangeEvent<HTMLSelectElement>) => setLifestyle(event.target.value as LifestyleTag | "")} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">Any lifestyle</option>
            {lifestyleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">Preferred area</span>
          <select value={areaSlug} onChange={(event: ChangeEvent<HTMLSelectElement>) => setAreaSlug(event.target.value)} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">Anywhere in Dubai</option>
            {areas.map((area) => <option key={area.slug} value={area.slug}>{area.name}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">Maximum listing price / rent</span>
          <select value={budget} onChange={(event: ChangeEvent<HTMLSelectElement>) => setBudget(event.target.value)} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">No maximum</option>
            <option value="1000000">AED 1M</option>
            <option value="2000000">AED 2M</option>
            <option value="3000000">AED 3M</option>
            <option value="5000000">AED 5M</option>
            <option value="10000000">AED 10M</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">Cash available today</span>
          <select value={cashToday} onChange={(event: ChangeEvent<HTMLSelectElement>) => setCashToday(event.target.value)} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">Not specified</option>
            <option value="250000">AED 250K</option>
            <option value="500000">AED 500K</option>
            <option value="750000">AED 750K</option>
            <option value="1000000">AED 1M</option>
            <option value="2000000">AED 2M</option>
          </select>
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={applyFinder} disabled={!canApply} className="button button-dark disabled:cursor-not-allowed disabled:opacity-40">Show my matches</button>
        <p className="text-xs leading-5 text-[var(--color-stone)]">Results are discovery matches, not investment advice or guaranteed availability. Residency and visa eligibility always require current independent confirmation.</p>
      </div>
    </div>
  );
}
