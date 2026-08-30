import Link from "next/link";
import { intelligenceProfilesForLocale } from "@/data/localized-catalog";
import { ChartReveal, CountUp } from "@/components/motion";
import { PriceHistoryChart } from "@/components/intelligence/price-history-chart";
import { RiskRadar } from "@/components/intelligence/risk-radar";
import { StatusBadge } from "@/components/intelligence/status-badge";
import { formatAed, formatDateTimeDubai } from "@/lib/format";
import { localizedHref } from "@/lib/i18n/locale";
import { translateMarketPositionBand, translateRiskBand, translateStatusLabel } from "@/lib/i18n/intelligence-labels";
import {
  calculateAverageRisk,
  calculateInvestmentScore,
  calculateMarketPosition,
  getIntelligenceProfile,
  getRiskBand,
} from "@/lib/intelligence";
import type { KeyHoldLocale } from "@/types/localization";
import type { Project } from "@/types/real-estate";

const COPY = {
  en: {
    notModelledHeading: "KeyHold Intelligence is not modelled for this record yet.",
    notModelledBody: "No score is shown rather than inventing evidence. The record can be activated once the required source data and analyst inputs are available.",
    lastReviewed: "Last reviewed",
    disclaimer: "Module 5 currently uses explicit demo-placeholder evidence to test the scoring, risk and market-intelligence interfaces. Nothing in this panel is a guaranteed return, valuation, DLD verification, developer endorsement or prediction. Production publication requires traceable sources and analyst review.",
    investmentScore: "KeyHold Investment Score", investmentScoreNote: "Weighted analytical score. Methodology and inputs are visible below.",
    riskRadar: "Risk Radar", averageRiskSuffix: "average risk", riskRadarNote: "Higher values mean higher modelled risk.",
    developerDelivery: "Developer Delivery", liquidityScore: "Liquidity Score",
    scoreBreakdown: "Score breakdown", whyScore: "Why the score is what it is.", methodology: "Methodology",
    weight: "Weight", riskRadarLabel: "Risk radar", whereExposure: "Where the model sees exposure.",
    marketPosition: "Market position", priceVsComparator: "Price versus the comparator set.",
    subject: "Subject", comparatorMedian: "Comparator median", difference: "Difference", notModelled: "Not modelled",
    marketPositionNote: "This is a comparator-position indicator, not an appraisal and not a statement that a property is objectively underpriced or overpriced.",
    priceHistory: "Price history", howPriceMoved: "How the reference price has moved.",
    comparableEvidence: "Comparable evidence", referenceTransactions: "Reference transactions and market evidence.",
    date: "Date", area: "Area", type: "Type", size: "Size", price: "Price", aedPerSqft: "AED / sqft", source: "Source",
    supplyPipeline: "Area supply pipeline", illustrativeSupply: "Illustrative future delivery exposure.",
    units: "units", supplyFootnote: "*Demo pipeline values. Production figures need a defined geography, source, snapshot date and delivery-status methodology.",
    viewIntelligence: "View intelligence", viewsChecked: "Views should be checked, not assumed.", permanenceRisk: "Permanence risk",
    verdict: "KeyHold Verdict", whyWeLikeIt: "Why we like it", whatWeWouldWatch: "What we would watch", bestFor: "Best for",
    sourceLedger: "Source ledger", whatSupports: "What supports this analysis.", readFullMethodology: "Read full methodology",
    checked: "Checked", openSource: "Open source", br: "BR", sqft: "sqft",
  },
  fr: {
    notModelledHeading: "KeyHold Intelligence n'est pas encore modélisé pour cette fiche.",
    notModelledBody: "Aucun score n'est affiché plutôt que d'inventer des preuves. La fiche pourra être activée une fois les données sources et les analyses requises disponibles.",
    lastReviewed: "Dernière revue",
    disclaimer: "Le Module 5 utilise actuellement des preuves de démonstration explicites pour tester les interfaces de notation, de risque et d'intelligence de marché. Rien dans ce panneau n'est un rendement garanti, une évaluation, une vérification DLD, un aval du promoteur ou une prédiction. La publication en production nécessite des sources traçables et une revue par un analyste.",
    investmentScore: "Score d'investissement KeyHold", investmentScoreNote: "Score analytique pondéré. La méthodologie et les données sont visibles ci-dessous.",
    riskRadar: "Radar de risque", averageRiskSuffix: "risque moyen", riskRadarNote: "Des valeurs plus élevées signifient un risque modélisé plus élevé.",
    developerDelivery: "Fiabilité du promoteur", liquidityScore: "Score de liquidité",
    scoreBreakdown: "Détail du score", whyScore: "Pourquoi ce score.", methodology: "Méthodologie",
    weight: "Pondération", riskRadarLabel: "Radar de risque", whereExposure: "Où le modèle voit une exposition.",
    marketPosition: "Position de marché", priceVsComparator: "Prix par rapport à l'ensemble comparatif.",
    subject: "Sujet", comparatorMedian: "Médiane comparable", difference: "Différence", notModelled: "Non modélisé",
    marketPositionNote: "Il s'agit d'un indicateur de position comparative, pas d'une expertise, ni d'une affirmation qu'un bien est objectivement sous-évalué ou surévalué.",
    priceHistory: "Historique des prix", howPriceMoved: "Comment le prix de référence a évolué.",
    comparableEvidence: "Preuves comparables", referenceTransactions: "Transactions de référence et preuves de marché.",
    date: "Date", area: "Quartier", type: "Type", size: "Surface", price: "Prix", aedPerSqft: "AED / pi²", source: "Source",
    supplyPipeline: "Pipeline d'offre du quartier", illustrativeSupply: "Exposition future illustrative de la livraison.",
    units: "unités", supplyFootnote: "*Valeurs de pipeline de démonstration. Les chiffres de production nécessitent une géographie, une source, une date de référence et une méthodologie de statut de livraison définies.",
    viewIntelligence: "Intelligence de vue", viewsChecked: "Les vues doivent être vérifiées, pas supposées.", permanenceRisk: "Risque de permanence",
    verdict: "Verdict KeyHold", whyWeLikeIt: "Pourquoi nous l'aimons", whatWeWouldWatch: "Ce que nous surveillerions", bestFor: "Idéal pour",
    sourceLedger: "Registre des sources", whatSupports: "Ce qui appuie cette analyse.", readFullMethodology: "Lire la méthodologie complète",
    checked: "Vérifié le", openSource: "Ouvrir la source", br: "ch.", sqft: "pi²",
  },
} as const;

function ScoreBar({ label, score, rationale, weight, weightLabel }: { label: string; score: number; rationale: string; weight: number; weightLabel: string }) {
  const width = `${Math.max(0, Math.min(100, score * 10))}%`;
  return (
    <div className="border-b border-black/10 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">{weightLabel} {weight}%</p>
        </div>
        <p className="font-display text-2xl">{score.toFixed(1)} / 10</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden bg-[var(--color-warm-grey)]" aria-hidden="true">
        <div className="h-full bg-[var(--color-teal)]" style={{ width }} />
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">{rationale}</p>
    </div>
  );
}

export function KeyHoldIntelligence({ project, locale = "en" }: { project: Project; locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  const profile = locale === "en" ? getIntelligenceProfile(project.slug) : intelligenceProfilesForLocale(locale).find((item) => item.projectSlug === project.slug) ?? null;
  if (!profile) {
    return (
      <div className="border border-black/10 bg-[var(--color-bone)] p-6">
        <p className="text-sm font-medium">{copy.notModelledHeading}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">{copy.notModelledBody}</p>
      </div>
    );
  }

  const investmentScore = calculateInvestmentScore(profile.scoreDimensions);
  const averageRisk = calculateAverageRisk(profile.riskDimensions);
  const riskBand = getRiskBand(averageRisk);
  const marketPosition = calculateMarketPosition(project, profile);
  const maxSupply = Math.max(1, ...profile.supplyPipeline.map((item) => item.estimatedUnits));

  return (
    <div className="space-y-10">
      <div className="border border-[var(--color-champagne)]/40 bg-[var(--color-champagne-soft)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={profile.dataStatus} locale={locale} />
          <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.lastReviewed} {formatDateTimeDubai(profile.lastReviewedAt, locale)}</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{copy.disclaimer}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-[var(--color-teal)]/20 bg-[var(--color-teal-soft)] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.investmentScore}</p>
          <p className="font-display mt-4 text-5xl"><CountUp value={investmentScore} decimals={1} /><span className="text-xl text-[var(--color-stone)]">/10</span></p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">{copy.investmentScoreNote}</p>
        </div>
        <div className="border border-[var(--color-terracotta)]/25 bg-[var(--color-terracotta-soft)] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-terracotta-deep)]">{copy.riskRadar}</p>
          <p className="font-display mt-4 text-4xl">{translateRiskBand(riskBand, locale)}</p>
          <p className="mt-2 text-sm">{averageRisk.toFixed(1)} / 10 {copy.averageRiskSuffix}</p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">{copy.riskRadarNote}</p>
        </div>
        <div className="border border-[var(--color-champagne)]/25 bg-[var(--color-champagne-soft)] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-champagne-ink)]">{copy.developerDelivery}</p>
          <p className="font-display mt-4 text-4xl">{profile.developerDeliveryScore.toFixed(1)}<span className="text-lg text-[var(--color-stone)]">/10</span></p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">{profile.developerDeliveryRationale}</p>
        </div>
        <div className="border border-[var(--color-sage)]/25 bg-[var(--color-sage-soft)] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-sage-deep)]">{copy.liquidityScore}</p>
          <p className="font-display mt-4 text-4xl">{profile.liquidityScore.toFixed(1)}<span className="text-lg text-[var(--color-stone)]">/10</span></p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">{profile.liquidityRationale}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="border border-black/10 p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-5">
            <div>
              <p className="eyebrow">{copy.scoreBreakdown}</p>
              <h3 className="font-display mt-2 text-3xl">{copy.whyScore}</h3>
            </div>
            <Link href={localizedHref("/intelligence-methodology", locale)} className="text-link">{copy.methodology}</Link>
          </div>
          <div className="pt-5">
            {profile.scoreDimensions.map((item) => <ScoreBar key={item.key} label={item.label} score={item.score} rationale={item.rationale} weight={item.weight} weightLabel={copy.weight} />)}
          </div>
        </div>

        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">{copy.riskRadarLabel}</p>
          <h3 className="font-display mt-2 text-3xl">{copy.whereExposure}</h3>
          <ChartReveal className="mt-5"><RiskRadar dimensions={profile.riskDimensions} locale={locale} /></ChartReveal>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">{copy.marketPosition}</p>
          <h3 className="font-display mt-2 text-3xl">{copy.priceVsComparator}</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div><p className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.subject}</p><p className="font-display mt-2 text-2xl">{marketPosition.subjectPricePerSqftAed ? `${formatAed(marketPosition.subjectPricePerSqftAed)} / ${copy.sqft}` : copy.notModelled}</p></div>
            <div><p className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.comparatorMedian}</p><p className="font-display mt-2 text-2xl">{marketPosition.comparatorMedianPricePerSqftAed ? `${formatAed(marketPosition.comparatorMedianPricePerSqftAed)} / ${copy.sqft}` : copy.notModelled}</p></div>
            <div><p className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.difference}</p><p className="font-display mt-2 text-2xl">{marketPosition.deltaPct !== null && Number.isFinite(marketPosition.deltaPct) ? `${marketPosition.deltaPct > 0 ? "+" : ""}${marketPosition.deltaPct.toFixed(1)}%` : copy.notModelled}</p></div>
          </div>
          <div className="mt-5 border-t border-black/10 pt-5">
            <p className="text-sm font-medium">{translateMarketPositionBand(marketPosition.band, locale)}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">{copy.marketPositionNote}</p>
          </div>
        </div>

        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">{copy.priceHistory}</p>
          <h3 className="font-display mt-2 text-3xl">{copy.howPriceMoved}</h3>
          <ChartReveal className="mt-5"><PriceHistoryChart points={profile.priceHistory} locale={locale} /></ChartReveal>
        </div>
      </div>

      <div className="border border-black/10 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">{copy.comparableEvidence}</p><h3 className="font-display mt-2 text-3xl">{copy.referenceTransactions}</h3></div>
          <StatusBadge status={profile.dataStatus} locale={locale} />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead><tr className="border-y border-black/10 text-[0.64rem] uppercase tracking-[0.12em] text-[var(--color-stone)]"><th className="py-3 pr-4">{copy.date}</th><th className="py-3 pr-4">{copy.area}</th><th className="py-3 pr-4">{copy.type}</th><th className="py-3 pr-4">{copy.size}</th><th className="py-3 pr-4">{copy.price}</th><th className="py-3 pr-4">{copy.aedPerSqft}</th><th className="py-3">{copy.source}</th></tr></thead>
            <tbody>{profile.comparables.map((item) => <tr key={item.id} className="border-b border-black/10"><td className="py-4 pr-4">{formatDateTimeDubai(`${item.date}T00:00:00+04:00`, locale)}</td><td className="py-4 pr-4">{item.areaLabel}</td><td className="py-4 pr-4">{item.bedrooms ? `${item.bedrooms} ${copy.br} ` : ""}{item.propertyType}</td><td className="py-4 pr-4">{item.sizeSqft.toLocaleString("en-US")} {copy.sqft}</td><td className="py-4 pr-4">{formatAed(item.priceAed)}</td><td className="py-4 pr-4">{formatAed(item.pricePerSqftAed)}</td><td className="py-4"><span className="block">{item.sourceLabel}</span><span className="mt-1 block text-[0.68rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">{translateStatusLabel(item.sourceStatus, locale)}</span></td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">{copy.supplyPipeline}</p>
          <h3 className="font-display mt-2 text-3xl">{copy.illustrativeSupply}</h3>
          <div className="mt-6 space-y-5">
            {profile.supplyPipeline.map((item) => <div key={item.period}><div className="flex items-center justify-between gap-4 text-sm"><span>{item.period}</span><span>{item.estimatedUnits.toLocaleString("en-US")} {copy.units}* · {translateStatusLabel(item.sourceStatus, locale)}</span></div><div className="mt-2 h-2 bg-[var(--color-warm-grey)]"><div className="h-full bg-[var(--color-teal)]" style={{ width: `${(item.estimatedUnits / maxSupply) * 100}%` }} /></div>{item.note ? <p className="mt-1 text-xs text-[var(--color-stone)]">{item.note}</p> : null}</div>)}
          </div>
          <p className="mt-5 text-[0.7rem] leading-5 text-[var(--color-stone)]">{copy.supplyFootnote}</p>
        </div>

        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">{copy.viewIntelligence}</p>
          <h3 className="font-display mt-2 text-3xl">{copy.viewsChecked}</h3>
          <div className="mt-6 space-y-4">{profile.viewIntelligence.map((item) => <div key={item.view} className="border-b border-black/10 pb-4 last:border-b-0"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium">{item.view}</p><span className="text-xs text-[var(--color-stone)]">{copy.permanenceRisk}: {item.permanenceRisk} · {translateStatusLabel(item.sourceStatus, locale)}</span></div><p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">{item.note}</p></div>)}</div>
        </div>
      </div>

      <div className="border border-black/10 bg-[var(--color-charcoal)] p-6 text-[var(--color-bone)] sm:p-8">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#dbc79f]">{copy.verdict}</p>
        <h3 className="font-display mt-3 max-w-3xl text-3xl sm:text-4xl">{profile.verdict.headline}</h3>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">{profile.verdict.summary}</p>
        <div className="mt-8 grid gap-7 md:grid-cols-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">{copy.whyWeLikeIt}</p><ul className="mt-4 space-y-2 text-sm leading-6">{profile.verdict.whyWeLikeIt.map((item) => <li key={item}>• {item}</li>)}</ul></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">{copy.whatWeWouldWatch}</p><ul className="mt-4 space-y-2 text-sm leading-6">{profile.verdict.whatWeWouldWatch.map((item) => <li key={item}>• {item}</li>)}</ul></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">{copy.bestFor}</p><ul className="mt-4 space-y-2 text-sm leading-6">{profile.verdict.bestFor.map((item) => <li key={item}>• {item}</li>)}</ul></div>
        </div>
      </div>

      <div className="border border-black/10 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{copy.sourceLedger}</p><h3 className="font-display mt-2 text-3xl">{copy.whatSupports}</h3></div><Link href={localizedHref("/intelligence-methodology", locale)} className="text-link">{copy.readFullMethodology}</Link></div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{profile.sources.map((source) => <div key={source.id} className="border border-black/10 p-4"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={source.status} locale={locale} /><span className="text-[0.65rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">{source.category}</span></div><p className="mt-3 text-sm font-medium">{source.label}</p><p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">{copy.checked} {formatDateTimeDubai(source.lastCheckedAt, locale)}. {source.note}</p>{source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="text-link mt-4 inline-block">{copy.openSource}</a> : null}</div>)}</div>
      </div>
    </div>
  );
}
