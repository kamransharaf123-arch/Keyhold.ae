import Link from "next/link";
import { intelligenceProfilesForLocale } from "@/data/localized-catalog";
import { PriceHistoryChart } from "@/components/intelligence/price-history-chart";
import { RiskRadar } from "@/components/intelligence/risk-radar";
import { StatusBadge } from "@/components/intelligence/status-badge";
import { formatAed, formatDateTimeDubai } from "@/lib/format";
import { localizedHref } from "@/lib/i18n/locale";
import {
  calculateAverageRisk,
  calculateInvestmentScore,
  calculateMarketPosition,
  formatSignedPercent,
  getIntelligenceProfile,
  getRiskBand,
} from "@/lib/intelligence";
import type { KeyHoldLocale } from "@/types/localization";
import type { Project } from "@/types/real-estate";

function ScoreBar({ label, score, rationale, weight }: { label: string; score: number; rationale: string; weight: number }) {
  const width = `${Math.max(0, Math.min(100, score * 10))}%`;
  return (
    <div className="border-b border-black/10 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">Weight {weight}%</p>
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
  const profile = locale === "en" ? getIntelligenceProfile(project.slug) : intelligenceProfilesForLocale(locale).find((item) => item.projectSlug === project.slug) ?? null;
  if (!profile) {
    return (
      <div className="border border-black/10 bg-[var(--color-bone)] p-6">
        <p className="text-sm font-medium">KeyHold Intelligence is not modelled for this record yet.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">No score is shown rather than inventing evidence. The record can be activated once the required source data and analyst inputs are available.</p>
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
          <StatusBadge status={profile.dataStatus} />
          <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">Last reviewed {formatDateTimeDubai(profile.lastReviewedAt)}</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">Module 5 currently uses explicit demo-placeholder evidence to test the scoring, risk and market-intelligence interfaces. Nothing in this panel is a guaranteed return, valuation, DLD verification, developer endorsement or prediction. Production publication requires traceable sources and analyst review.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-[var(--color-teal)]/20 bg-[var(--color-teal-soft)] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">KeyHold Investment Score</p>
          <p className="font-display mt-4 text-5xl">{investmentScore.toFixed(1)}<span className="text-xl text-[var(--color-stone)]">/10</span></p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">Weighted analytical score. Methodology and inputs are visible below.</p>
        </div>
        <div className="border border-[var(--color-terracotta)]/25 bg-[var(--color-terracotta-soft)] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-terracotta-deep)]">Risk Radar</p>
          <p className="font-display mt-4 text-4xl">{riskBand}</p>
          <p className="mt-2 text-sm">{averageRisk.toFixed(1)} / 10 average risk</p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">Higher values mean higher modelled risk.</p>
        </div>
        <div className="border border-[var(--color-champagne)]/25 bg-[var(--color-champagne-soft)] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-champagne-ink)]">Developer Delivery</p>
          <p className="font-display mt-4 text-4xl">{profile.developerDeliveryScore.toFixed(1)}<span className="text-lg text-[var(--color-stone)]">/10</span></p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">{profile.developerDeliveryRationale}</p>
        </div>
        <div className="border border-[var(--color-sage)]/25 bg-[var(--color-sage-soft)] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-sage-deep)]">Liquidity Score</p>
          <p className="font-display mt-4 text-4xl">{profile.liquidityScore.toFixed(1)}<span className="text-lg text-[var(--color-stone)]">/10</span></p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">{profile.liquidityRationale}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="border border-black/10 p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-5">
            <div>
              <p className="eyebrow">Score breakdown</p>
              <h3 className="font-display mt-2 text-3xl">Why the score is what it is.</h3>
            </div>
            <Link href={localizedHref("/intelligence-methodology", locale)} className="text-link">Methodology</Link>
          </div>
          <div className="pt-5">
            {profile.scoreDimensions.map((item) => <ScoreBar key={item.key} label={item.label} score={item.score} rationale={item.rationale} weight={item.weight} />)}
          </div>
        </div>

        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">Risk radar</p>
          <h3 className="font-display mt-2 text-3xl">Where the model sees exposure.</h3>
          <div className="mt-5"><RiskRadar dimensions={profile.riskDimensions} /></div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">Market position</p>
          <h3 className="font-display mt-2 text-3xl">Price versus the comparator set.</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div><p className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">Subject</p><p className="font-display mt-2 text-2xl">{marketPosition.subjectPricePerSqftAed ? `${formatAed(marketPosition.subjectPricePerSqftAed)} / sqft` : "Not modelled"}</p></div>
            <div><p className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">Comparator median</p><p className="font-display mt-2 text-2xl">{marketPosition.comparatorMedianPricePerSqftAed ? `${formatAed(marketPosition.comparatorMedianPricePerSqftAed)} / sqft` : "Not modelled"}</p></div>
            <div><p className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">Difference</p><p className="font-display mt-2 text-2xl">{formatSignedPercent(marketPosition.deltaPct)}</p></div>
          </div>
          <div className="mt-5 border-t border-black/10 pt-5">
            <p className="text-sm font-medium">{marketPosition.band}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">This is a comparator-position indicator, not an appraisal and not a statement that a property is objectively underpriced or overpriced.</p>
          </div>
        </div>

        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">Price history</p>
          <h3 className="font-display mt-2 text-3xl">How the reference price has moved.</h3>
          <div className="mt-5"><PriceHistoryChart points={profile.priceHistory} /></div>
        </div>
      </div>

      <div className="border border-black/10 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Comparable evidence</p><h3 className="font-display mt-2 text-3xl">Reference transactions and market evidence.</h3></div>
          <StatusBadge status={profile.dataStatus} />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead><tr className="border-y border-black/10 text-[0.64rem] uppercase tracking-[0.12em] text-[var(--color-stone)]"><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Area</th><th className="py-3 pr-4">Type</th><th className="py-3 pr-4">Size</th><th className="py-3 pr-4">Price</th><th className="py-3 pr-4">AED / sqft</th><th className="py-3">Source</th></tr></thead>
            <tbody>{profile.comparables.map((item) => <tr key={item.id} className="border-b border-black/10"><td className="py-4 pr-4">{formatDateTimeDubai(`${item.date}T00:00:00+04:00`)}</td><td className="py-4 pr-4">{item.areaLabel}</td><td className="py-4 pr-4">{item.bedrooms ? `${item.bedrooms} BR ` : ""}{item.propertyType}</td><td className="py-4 pr-4">{item.sizeSqft.toLocaleString("en-US")} sqft</td><td className="py-4 pr-4">{formatAed(item.priceAed)}</td><td className="py-4 pr-4">{formatAed(item.pricePerSqftAed)}</td><td className="py-4"><span className="block">{item.sourceLabel}</span><span className="mt-1 block text-[0.68rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">{item.sourceStatus.replace("-", " ")}</span></td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">Area supply pipeline</p>
          <h3 className="font-display mt-2 text-3xl">Illustrative future delivery exposure.</h3>
          <div className="mt-6 space-y-5">
            {profile.supplyPipeline.map((item) => <div key={item.period}><div className="flex items-center justify-between gap-4 text-sm"><span>{item.period}</span><span>{item.estimatedUnits.toLocaleString("en-US")} units* · {item.sourceStatus.replace("-", " ")}</span></div><div className="mt-2 h-2 bg-[var(--color-warm-grey)]"><div className="h-full bg-[var(--color-teal)]" style={{ width: `${(item.estimatedUnits / maxSupply) * 100}%` }} /></div>{item.note ? <p className="mt-1 text-xs text-[var(--color-stone)]">{item.note}</p> : null}</div>)}
          </div>
          <p className="mt-5 text-[0.7rem] leading-5 text-[var(--color-stone)]">*Demo pipeline values. Production figures need a defined geography, source, snapshot date and delivery-status methodology.</p>
        </div>

        <div className="border border-black/10 p-5 sm:p-7">
          <p className="eyebrow">View intelligence</p>
          <h3 className="font-display mt-2 text-3xl">Views should be checked, not assumed.</h3>
          <div className="mt-6 space-y-4">{profile.viewIntelligence.map((item) => <div key={item.view} className="border-b border-black/10 pb-4 last:border-b-0"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium">{item.view}</p><span className="text-xs text-[var(--color-stone)]">Permanence risk: {item.permanenceRisk} · {item.sourceStatus.replace("-", " ")}</span></div><p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">{item.note}</p></div>)}</div>
        </div>
      </div>

      <div className="border border-black/10 bg-[var(--color-charcoal)] p-6 text-[var(--color-bone)] sm:p-8">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#dbc79f]">KeyHold Verdict</p>
        <h3 className="font-display mt-3 max-w-3xl text-3xl sm:text-4xl">{profile.verdict.headline}</h3>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">{profile.verdict.summary}</p>
        <div className="mt-8 grid gap-7 md:grid-cols-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Why we like it</p><ul className="mt-4 space-y-2 text-sm leading-6">{profile.verdict.whyWeLikeIt.map((item) => <li key={item}>• {item}</li>)}</ul></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">What we would watch</p><ul className="mt-4 space-y-2 text-sm leading-6">{profile.verdict.whatWeWouldWatch.map((item) => <li key={item}>• {item}</li>)}</ul></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Best for</p><ul className="mt-4 space-y-2 text-sm leading-6">{profile.verdict.bestFor.map((item) => <li key={item}>• {item}</li>)}</ul></div>
        </div>
      </div>

      <div className="border border-black/10 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Source ledger</p><h3 className="font-display mt-2 text-3xl">What supports this analysis.</h3></div><Link href={localizedHref("/intelligence-methodology", locale)} className="text-link">Read full methodology</Link></div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{profile.sources.map((source) => <div key={source.id} className="border border-black/10 p-4"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={source.status} /><span className="text-[0.65rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">{source.category}</span></div><p className="mt-3 text-sm font-medium">{source.label}</p><p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">Checked {formatDateTimeDubai(source.lastCheckedAt)}. {source.note}</p>{source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="text-link mt-4 inline-block">Open source</a> : null}</div>)}</div>
      </div>
    </div>
  );
}
