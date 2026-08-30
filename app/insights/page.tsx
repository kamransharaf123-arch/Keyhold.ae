import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedInsights } from "@/lib/i18n/localized-site";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Insights", title: "Understand the property before you buy it.", description: "Guides and market thinking around off-plan, ready property, rental strategy and the mechanics behind a Dubai investment.", readLabel: "Read" },
  fr: { eyebrow: "Analyses", title: "Comprenez le bien avant de l’acheter.", description: "Guides et réflexions de marché sur le sur-plan, les biens prêts, la stratégie locative et les mécanismes d’un investissement à Dubaï.", readLabel: "Lire" },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("insights", "/insights", { title: "Insights", description: "Dubai real estate guides, market thinking and investment insights from KeyHold." }, "en");
}

export function InsightsContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("insights", locale);
  const copy = COPY[locale];
  const insights = localizedInsights(locale);
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((item, index) => (
            <article key={item.slug} className="group border-t border-black/[0.12] pt-6">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-champagne-ink)]">{item.category}</p>
                <span className="text-xs text-[var(--color-stone)]">0{index + 1}</span>
              </div>
              <h2 className="font-display mt-8 text-3xl leading-tight tracking-[-0.03em]">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{item.excerpt}</p>
              <div className="mt-8 flex items-center justify-between border-t border-black/[0.08] pt-4 text-xs text-[var(--color-stone)]">
                <span>{item.date}</span>
                <Link href={localizedHref("/insights", locale)} aria-label={`${copy.readLabel} ${item.title}`} className="grid size-9 place-items-center rounded-full border border-black/10 transition-colors group-hover:bg-[var(--color-bone)]">
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default function InsightsPage() {
  return <InsightsContent locale="en" />;
}
