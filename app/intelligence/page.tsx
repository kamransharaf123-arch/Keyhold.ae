import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/intelligence/status-badge";
import { intelligenceProfiles } from "@/data/intelligence";
import { projects } from "@/data/real-estate";
import { formatDateTimeDubai, formatProjectPrice } from "@/lib/format";
import { getIntelligenceSummary } from "@/lib/intelligence";

export const metadata: Metadata = {
  title: "KeyHold Intelligence",
  description: "Transparent project scoring, risk analysis, market positioning and source methodology for KeyHold property records.",
};

export default function IntelligencePage() {
  const cards = intelligenceProfiles.map((profile) => {
    const project = projects.find((item) => item.slug === profile.projectSlug);
    if (!project) return null;
    return { project, profile, summary: getIntelligenceSummary(project) };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item?.summary));

  return (
    <div className="site-container py-12 lg:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow">KeyHold Intelligence</p>
        <h1 className="display-title mt-4 text-5xl sm:text-6xl lg:text-7xl">More evidence. Fewer glossy claims.</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-stone)]">A transparent analytical layer for project scoring, risk, liquidity, market position, comparable evidence and KeyHold verdicts. Module 5 data is still demo-placeholder until verified production sources are connected.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href="/intelligence-methodology" className="button button-dark">Read methodology</Link><Link href="/discover" className="button border border-black/10">Discover projects</Link></div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {cards.map(({ project, profile, summary }) => summary ? (
          <article key={project.slug} className="border border-black/10 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge status={profile.dataStatus} /><span className="text-xs text-[var(--color-stone)]">Reviewed {formatDateTimeDubai(profile.lastReviewedAt)}</span></div>
            <p className="mt-5 text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">{project.location} · {formatProjectPrice(project)}</p>
            <h2 className="font-display mt-2 text-3xl">{project.title}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-black/10 py-5 sm:grid-cols-4">
              <div><p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">Score</p><p className="font-display mt-1 text-2xl">{summary.investmentScore.toFixed(1)}</p></div>
              <div><p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">Risk</p><p className="font-display mt-1 text-2xl">{summary.riskBand}</p></div>
              <div><p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">Liquidity</p><p className="font-display mt-1 text-2xl">{summary.liquidityScore.toFixed(1)}</p></div>
              <div><p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">Market</p><p className="mt-1 text-sm leading-5">{summary.marketPosition.band}</p></div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--color-stone)]">{profile.verdict.headline}</p>
            <Link href={`/projects/${project.slug}#intelligence`} className="text-link mt-5 inline-block">Open intelligence view</Link>
          </article>
        ) : null)}
      </div>
    </div>
  );
}
