"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { countUnitsByAvailability, getInitialCashRequirement, getPaymentPlanSignature, getProjectViews } from "@/lib/discovery";
import { calculateInvestment, getScenarioInputs } from "@/lib/investment";
import { getIntelligenceSummary } from "@/lib/intelligence";
import { formatAed, formatDateTimeDubai, formatProjectPrice, formatSqftRange } from "@/lib/format";
import { localizedHref } from "@/lib/i18n/locale";
import { translateMarketPositionBand, translateRiskBand } from "@/lib/i18n/intelligence-labels";
import type { AreaProfile, DeveloperProfile, Project } from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    notAvailable: "Not available", notApplicable: "Not applicable", notModelled: "Not modelled", notProvided: "Not provided",
    from: "From",
    comparison: "Project comparison", nothingSelected: "Nothing selected yet.",
    nothingBody: "Choose up to four properties from the discovery engine. Acquisition projects with investment assumptions also show the Module 4 financial snapshot.",
    openDiscovery: "Open discovery",
    title: "Compare the facts side by side.",
    intro: "Compare catalogue facts plus a clearly labelled Module 4 expected-scenario snapshot for acquisition projects. Open any project to edit assumptions and run the full model.",
    addOrChange: "Add or change projects",
    remove: "Remove",
    footnote1: "*Initial cash is a discovery estimate based on the displayed starting price and first payment milestone. Financial rows marked * use the project’s Module 4 expected demo assumptions and a cash-purchase model at the displayed starting price. They are estimates, not guaranteed returns or live quotations.",
    footnote2: "Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice. **KeyHold Intelligence rows use Module 5 demo-placeholder evidence until verified production sources are connected; scores are analytical indicators, not guarantees or valuations.",
    years: "years",
    rows: {
      category: "Category", area: "Area", developer: "Developer", price: "Price / rent", propertyType: "Property type",
      bedrooms: "Bedrooms", size: "Size", handover: "Handover", paymentPlan: "Payment plan", initialCash: "Estimated initial cash*",
      availableUnits: "Available units shown", views: "Views in current inventory", investmentGoals: "Investment goals", lifestyle: "Lifestyle",
      score: "KeyHold Score**", riskBand: "Risk band**", liquidity: "Liquidity score**", marketPosition: "Market position**",
      grossYield: "Gross yield · expected*", netYield: "Net yield · expected*", allInCash: "All-in acquisition · cash*",
      modelHorizon: "Model horizon*", totalRoi: "Total ROI · expected*", futureValue: "Future value · expected*",
      availabilityVerified: "Availability verified",
    },
  },
  fr: {
    notAvailable: "Non disponible", notApplicable: "Non applicable", notModelled: "Non modélisé", notProvided: "Non fourni",
    from: "À partir de",
    comparison: "Comparaison de projets", nothingSelected: "Rien n’est encore sélectionné.",
    nothingBody: "Choisissez jusqu’à quatre biens depuis le moteur de recherche. Les projets d’acquisition avec hypothèses d’investissement affichent aussi l’aperçu financier du Module 4.",
    openDiscovery: "Ouvrir la recherche",
    title: "Comparez les faits côte à côte.",
    intro: "Comparez les données du catalogue ainsi qu’un aperçu du scénario attendu du Module 4, clairement identifié, pour les projets d’acquisition. Ouvrez un projet pour modifier les hypothèses et lancer le modèle complet.",
    addOrChange: "Ajouter ou modifier des projets",
    remove: "Retirer",
    footnote1: "*La trésorerie initiale est une estimation de découverte basée sur le prix de départ affiché et le premier versement. Les lignes financières marquées * utilisent les hypothèses de démonstration attendues du Module 4 du projet et un modèle d’achat comptant au prix de départ affiché. Ce sont des estimations, non des rendements garantis ni des cotations en direct.",
    footnote2: "La disponibilité des unités dépend de la disponibilité actuelle du promoteur/vendeur, doit être confirmée et peut changer sans préavis. **Les lignes KeyHold Intelligence utilisent des preuves de démonstration du Module 5 tant que des sources de production vérifiées ne sont pas connectées ; les scores sont des indicateurs analytiques, non des garanties ou évaluations.",
    years: "ans",
    rows: {
      category: "Catégorie", area: "Quartier", developer: "Promoteur", price: "Prix / loyer", propertyType: "Type de bien",
      bedrooms: "Chambres", size: "Surface", handover: "Livraison", paymentPlan: "Plan de paiement", initialCash: "Trésorerie initiale estimée*",
      availableUnits: "Unités disponibles affichées", views: "Vues dans l’inventaire actuel", investmentGoals: "Objectifs d’investissement", lifestyle: "Style de vie",
      score: "Score KeyHold**", riskBand: "Bande de risque**", liquidity: "Score de liquidité**", marketPosition: "Position de marché**",
      grossYield: "Rendement brut · attendu*", netYield: "Rendement net · attendu*", allInCash: "Acquisition tout compris · comptant*",
      modelHorizon: "Horizon du modèle*", totalRoi: "ROI total · attendu*", futureValue: "Valeur future · attendue*",
      availabilityVerified: "Disponibilité vérifiée",
    },
  },
} as const;

function formatPercent(value: number, notAvailable: string) {
  return Number.isFinite(value) ? `${value.toFixed(1)}%` : notAvailable;
}

function getExpectedInvestmentResult(project: Project) {
  if (!project.investment || project.priceFromAed === null) return null;
  const inputs = getScenarioInputs(
    project.investment,
    "expected",
    project.priceFromAed,
    project.investment.defaultUnitSizeSqft,
  );
  return calculateInvestment({ ...inputs, useMortgage: false });
}

type ProjectComparisonProps = {
  projects: Project[];
  developers: DeveloperProfile[];
  areas: AreaProfile[];
  locale?: KeyHoldLocale;
};

export function ProjectComparison({ projects, developers, areas, locale = "en" }: ProjectComparisonProps) {
  const copy = COPY[locale];
  const comparePath = localizedHref("/compare", locale);
  const searchParams = useSearchParams();
  const requested = useMemo(() => (searchParams.get("projects") ?? "").split(",").map((value) => value.trim()).filter(Boolean).slice(0, 4), [searchParams]);
  const [slugs, setSlugs] = useState(requested);

  const selected = slugs.map((slug) => projects.find((project) => project.slug === slug)).filter((project): project is Project => Boolean(project));
  const developerNames = Object.fromEntries(developers.map((developer) => [developer.slug, developer.name]));
  const areaNames = Object.fromEntries(areas.map((area) => [area.slug, area.name]));

  function removeProject(slug: string) {
    const next = slugs.filter((item) => item !== slug);
    setSlugs(next);
    window.localStorage.setItem("keyhold_compare_v1", JSON.stringify(next));
    const params = new URLSearchParams(window.location.search);
    if (next.length > 0) params.set("projects", next.join(",")); else params.delete("projects");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${comparePath}?${query}` : comparePath);
  }

  if (selected.length === 0) {
    return (
      <div className="site-container py-16 lg:py-24">
        <div className="border border-black/10 bg-[var(--color-bone)] p-8 sm:p-12">
          <p className="eyebrow">{copy.comparison}</p>
          <h1 className="font-display mt-4 text-5xl tracking-[-0.04em]">{copy.nothingSelected}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">{copy.nothingBody}</p>
          <Link href={localizedHref("/discover", locale)} className="button button-dark mt-7">{copy.openDiscovery}</Link>
        </div>
      </div>
    );
  }

  const rows: Array<{ label: string; render: (project: Project) => ReactNode }> = [
    { label: copy.rows.category, render: (project) => project.category },
    { label: copy.rows.area, render: (project) => areaNames[project.areaSlug] ?? project.location },
    { label: copy.rows.developer, render: (project) => developerNames[project.developerSlug] ?? project.developerSlug },
    { label: copy.rows.price, render: (project) => formatProjectPrice(project, locale) },
    { label: copy.rows.propertyType, render: (project) => project.propertyTypes.join(" · ") },
    { label: copy.rows.bedrooms, render: (project) => project.bedroomsLabel },
    { label: copy.rows.size, render: (project) => formatSqftRange(project.sizeFromSqft, project.sizeToSqft, locale) },
    { label: copy.rows.handover, render: (project) => project.handoverLabel },
    { label: copy.rows.paymentPlan, render: (project) => getPaymentPlanSignature(project) ?? copy.notApplicable },
    { label: copy.rows.initialCash, render: (project) => { const value = getInitialCashRequirement(project); return value === null ? copy.notApplicable : `${copy.from} ${formatAed(value, { compact: true })}`; } },
    { label: copy.rows.availableUnits, render: (project) => String(countUnitsByAvailability(project).available) },
    { label: copy.rows.views, render: (project) => getProjectViews(project).join(" · ") || copy.notProvided },
    { label: copy.rows.investmentGoals, render: (project) => project.discovery.investmentGoals.join(" · ") },
    { label: copy.rows.lifestyle, render: (project) => project.discovery.lifestyleTags.join(" · ") },
    { label: copy.rows.score, render: (project) => { const summary = getIntelligenceSummary(project); return summary ? `${summary.investmentScore.toFixed(1)} / 10` : copy.notModelled; } },
    { label: copy.rows.riskBand, render: (project) => { const summary = getIntelligenceSummary(project); return summary ? `${translateRiskBand(summary.riskBand, locale)} (${summary.averageRisk.toFixed(1)} / 10)` : copy.notModelled; } },
    { label: copy.rows.liquidity, render: (project) => { const summary = getIntelligenceSummary(project); return summary ? `${summary.liquidityScore.toFixed(1)} / 10` : copy.notModelled; } },
    { label: copy.rows.marketPosition, render: (project) => { const summary = getIntelligenceSummary(project); return summary ? translateMarketPositionBand(summary.marketPosition.band, locale) : copy.notModelled; } },
    { label: copy.rows.grossYield, render: (project) => { const result = getExpectedInvestmentResult(project); return result ? formatPercent(result.grossYieldPct, copy.notAvailable) : copy.notModelled; } },
    { label: copy.rows.netYield, render: (project) => { const result = getExpectedInvestmentResult(project); return result ? formatPercent(result.netYieldPct, copy.notAvailable) : copy.notModelled; } },
    { label: copy.rows.allInCash, render: (project) => { const result = getExpectedInvestmentResult(project); return result ? formatAed(result.allInAcquisitionCostAed, { compact: true }) : copy.notModelled; } },
    { label: copy.rows.modelHorizon, render: (project) => project.investment ? `${project.investment.exit.defaultHoldYears} ${copy.years}` : copy.notModelled },
    { label: copy.rows.totalRoi, render: (project) => { const result = getExpectedInvestmentResult(project); return result ? formatPercent(result.totalRoiPct, copy.notAvailable) : copy.notModelled; } },
    { label: copy.rows.futureValue, render: (project) => { const result = getExpectedInvestmentResult(project); return result ? formatAed(result.futurePropertyValueAed, { compact: true }) : copy.notModelled; } },
    { label: copy.rows.availabilityVerified, render: (project) => formatDateTimeDubai(project.availabilityLastVerifiedAt, locale) },
  ];

  return (
    <div className="site-container py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-black/10 pb-7">
        <div>
          <p className="eyebrow">{copy.comparison}</p>
          <h1 className="font-display mt-3 text-5xl tracking-[-0.04em]">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">{copy.intro}</p>
        </div>
        <Link href={localizedHref("/discover", locale)} className="button border border-black/10">{copy.addOrChange}</Link>
      </div>

      <div className="mt-8 overflow-x-auto border border-black/10 bg-[var(--color-soft-white)]">
        <div className="grid min-w-[780px]" style={{ gridTemplateColumns: `12rem repeat(${selected.length}, minmax(13rem, 1fr))` }}>
          <div className="border-b border-r border-black/10 bg-[var(--color-bone)] p-4" />
          {selected.map((project) => (
            <div key={project.slug} className="border-b border-r border-black/10 p-4 last:border-r-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-warm-grey)]">
                <Image src={project.heroImage} alt="" fill sizes="260px" className="object-cover" />
              </div>
              <p className="mt-4 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">{project.location}</p>
              <Link href={localizedHref(`/projects/${project.slug}`, locale)} className="font-display mt-1 block text-2xl tracking-[-0.03em] hover:underline">{project.title}</Link>
              <button type="button" onClick={() => removeProject(project.slug)} className="mt-3 text-xs font-semibold text-[var(--color-stone)] underline underline-offset-4">{copy.remove}</button>
            </div>
          ))}
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <div className="border-b border-r border-black/10 bg-[var(--color-bone)] p-4 text-[0.67rem] font-semibold uppercase tracking-[0.13em] text-[var(--color-stone)]">{row.label}</div>
              {selected.map((project) => <div key={`${row.label}-${project.slug}`} className="border-b border-r border-black/10 p-4 text-sm leading-6 last:border-r-0">{row.render(project)}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-[0.7rem] leading-5 text-[var(--color-stone)] md:grid-cols-2">
        <p>{copy.footnote1}</p>
        <p>{copy.footnote2}</p>
      </div>
    </div>
  );
}
