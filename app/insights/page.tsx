import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { insights } from "@/data/site";

export const metadata: Metadata = {
  title: "Insights",
  description: "Dubai real estate guides, market thinking and investment insights from KeyHold.",
};

export default function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Understand the property before you buy it."
        description="Guides and market thinking around off-plan, ready property, rental strategy and the mechanics behind a Dubai investment."
      />
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
                <Link href="/insights" aria-label={`Read ${item.title}`} className="grid size-9 place-items-center rounded-full border border-black/10 transition-colors group-hover:bg-[var(--color-bone)]">
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
