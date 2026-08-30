import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Intelligence Methodology",
  description: "How KeyHold project scores, risk indicators, market position and source statuses are calculated and communicated.",
};

const weights = [
  ["Rental potential", "20%"],
  ["Capital growth", "20%"],
  ["Developer", "15%"],
  ["Liquidity", "15%"],
  ["Payment structure", "15%"],
  ["Supply resilience", "15%"],
];

export default function IntelligenceMethodologyPage() {
  return (
    <div className="site-container py-12 lg:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow">Methodology</p>
        <h1 className="display-title mt-4 text-5xl sm:text-6xl">How KeyHold Intelligence is meant to work.</h1>
        <p className="mt-6 text-base leading-8 text-[var(--color-stone)]">The purpose of the intelligence layer is not to disguise opinions as certainty. It separates inputs, sources, calculations and analyst judgement so a client can see what is known, what is estimated and what still requires verification.</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="border border-black/10 p-6 sm:p-8">
          <p className="eyebrow">Investment Score</p>
          <h2 className="font-display mt-3 text-3xl">Weighted, visible and reproducible.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">Each dimension is scored from 0 to 10. The overall score is the weighted average below. A high score is not a guarantee of profit and should never replace transaction-specific due diligence.</p>
          <dl className="mt-6">{weights.map(([label, weight]) => <div key={label} className="flex items-center justify-between border-b border-black/10 py-3 text-sm"><dt>{label}</dt><dd className="font-medium">{weight}</dd></div>)}</dl>
        </section>

        <section className="border border-black/10 p-6 sm:p-8">
          <p className="eyebrow">Risk Radar</p>
          <h2 className="font-display mt-3 text-3xl">Higher means more modelled risk.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">Risk dimensions use a 0–10 scale where 0 represents lower modelled risk and 10 represents higher modelled risk. The overall band uses the simple average: Low ≤3, Moderate ≤5, Elevated ≤7, High &gt;7.</p>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">Risk dimensions cover developer, construction, future supply, rental and liquidity exposure. They are analytical indicators, not probabilities of loss.</p>
        </section>

        <section className="border border-black/10 p-6 sm:p-8">
          <p className="eyebrow">Market Position</p>
          <h2 className="font-display mt-3 text-3xl">Comparator positioning, not a valuation.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">The subject price per sqft is compared with the median price per sqft of the displayed comparator set. Bands are: below median at ≤−8%, slightly below between −8% and −3%, near median between −3% and +3%, slightly above between +3% and +8%, and above median at ≥+8%.</p>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">The result must not be labelled an appraisal or definitive “overpriced / underpriced” judgement.</p>
        </section>

        <section className="border border-black/10 p-6 sm:p-8">
          <p className="eyebrow">Source Status</p>
          <h2 className="font-display mt-3 text-3xl">Every important figure carries provenance.</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-stone)]">
            <p><strong className="text-[var(--color-graphite)]">Demo placeholder:</strong> built only to exercise the product and must not be presented as current market evidence.</p>
            <p><strong className="text-[var(--color-graphite)]">Pending verification:</strong> a source exists or has been entered but has not completed the required review.</p>
            <p><strong className="text-[var(--color-graphite)]">Verified:</strong> may only be used when the production workflow records the actual source, reviewer, timestamp and verification requirements.</p>
          </div>
        </section>
      </div>

      <section className="mt-8 border border-black/10 bg-[var(--color-bone)] p-6 sm:p-8">
        <p className="eyebrow">Publication rule</p>
        <h2 className="font-display mt-3 text-3xl">No source, no claim.</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--color-stone)]">Module 5 intentionally ships with demo-placeholder intelligence. Production CMS workflows should prevent a score, comparable, developer-delivery claim, supply estimate, price-history point or “verified” badge from being published without the required provenance. KeyHold verdicts should identify both positive factors and material watch items.</p>
        <Link href="/intelligence" className="button button-dark mt-6">Back to KeyHold Intelligence</Link>
      </section>
    </div>
  );
}
