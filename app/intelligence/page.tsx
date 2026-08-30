import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/intelligence/status-badge";
import { intelligenceProfilesForLocale, projectsForLocale } from "@/data/localized-catalog";
import { formatDateTimeDubai, formatProjectPrice } from "@/lib/format";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import { getIntelligenceSummary } from "@/lib/intelligence";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    eyebrow: "KeyHold Intelligence", title: "More evidence. Fewer glossy claims.",
    description: "A transparent analytical layer for project scoring, risk, liquidity, market position, comparable evidence and KeyHold verdicts. Module 5 data is still demo-placeholder until verified production sources are connected.",
    methodology: "Read methodology", discover: "Discover projects", reviewed: "Reviewed",
    score: "Score", risk: "Risk", liquidity: "Liquidity", market: "Market", open: "Open intelligence view",
  },
  fr: {
    eyebrow: "KeyHold Intelligence", title: "Plus de preuves. Moins de discours marketing.",
    description: "Une couche analytique transparente pour la notation des projets, le risque, la liquidité, la position de marché, les preuves comparables et les verdicts KeyHold. Les données du Module 5 restent des espaces réservés de démonstration tant que des sources de production vérifiées ne sont pas connectées.",
    methodology: "Lire la méthodologie", discover: "Découvrir les projets", reviewed: "Revu le",
    score: "Score", risk: "Risque", liquidity: "Liquidité", market: "Marché", open: "Ouvrir la vue intelligence",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("intelligence", "/intelligence", { title: "KeyHold Intelligence", description: "Transparent project scoring, risk analysis, market positioning and source methodology for KeyHold property records." }, "en");
}

export function IntelligenceContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  const intelligenceProfiles = intelligenceProfilesForLocale(locale);
  const projects = projectsForLocale(locale);
  const cards = intelligenceProfiles.map((profile) => {
    const project = projects.find((item) => item.slug === profile.projectSlug);
    if (!project) return null;
    return { project, profile, summary: getIntelligenceSummary(project) };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item?.summary));

  return (
    <div className="site-container py-12 lg:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="display-title mt-4 text-5xl sm:text-6xl lg:text-7xl">{copy.title}</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-stone)]">{copy.description}</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href={localizedHref("/intelligence-methodology", locale)} className="button button-dark">{copy.methodology}</Link><Link href={localizedHref("/discover", locale)} className="button border border-black/10">{copy.discover}</Link></div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {cards.map(({ project, profile, summary }) => summary ? (
          <article key={project.slug} className="border border-black/10 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge status={profile.dataStatus} /><span className="text-xs text-[var(--color-stone)]">{copy.reviewed} {formatDateTimeDubai(profile.lastReviewedAt)}</span></div>
            <p className="mt-5 text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">{project.location} · {formatProjectPrice(project)}</p>
            <h2 className="font-display mt-2 text-3xl">{project.title}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-black/10 py-5 sm:grid-cols-4">
              <div><p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">{copy.score}</p><p className="font-display mt-1 text-2xl">{summary.investmentScore.toFixed(1)}</p></div>
              <div><p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">{copy.risk}</p><p className="font-display mt-1 text-2xl">{summary.riskBand}</p></div>
              <div><p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">{copy.liquidity}</p><p className="font-display mt-1 text-2xl">{summary.liquidityScore.toFixed(1)}</p></div>
              <div><p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-stone)]">{copy.market}</p><p className="mt-1 text-sm leading-5">{summary.marketPosition.band}</p></div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--color-stone)]">{profile.verdict.headline}</p>
            <Link href={`${localizedHref(`/projects/${project.slug}`, locale)}#intelligence`} className="text-link mt-5 inline-block">{copy.open}</Link>
          </article>
        ) : null)}
      </div>
    </div>
  );
}

export default function IntelligencePage() {
  return <IntelligenceContent locale="en" />;
}
