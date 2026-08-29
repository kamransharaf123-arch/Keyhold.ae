import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Who We Are",
  description: "Discover the KeyHold approach to Dubai real estate advisory.",
};

const principles = [
  ["Clarity", "Property information should be understandable, sourced and useful enough to support a real decision."],
  ["Selectivity", "More inventory is not automatically better. KeyHold is designed around considered curation."],
  ["Context", "Price alone says very little. Payment timing, fees, supply, liquidity and exit strategy matter too."],
  ["Continuity", "The relationship should continue through construction, handover, rental, management and eventual resale."],
];

export default function WhoWeArePage() {
  return (
    <>
      <PageHero
        eyebrow="Who We Are"
        title="A more considered way to navigate Dubai property."
        description="KeyHold is being built as a premium real estate advisory platform that combines strong presentation with better context, transparency and long-term client tools."
      />
      <section className="site-container py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="eyebrow">Our point of view</p>
            <h2 className="font-display mt-4 text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">Real estate should feel informed, not rushed.</h2>
          </div>
          <div className="max-w-3xl space-y-6 text-base leading-8 text-[var(--color-stone)]">
            <p>Dubai moves quickly. KeyHold is designed to create a calmer layer between the volume of the market and the decisions a buyer, investor, owner or tenant actually needs to make.</p>
            <p>KeyHold is designed to combine project discovery with deeper investment analysis, construction visibility, private client tools and long-term owner support within one coherent experience.</p>
          </div>
        </div>
      </section>
      <section className="bg-[var(--color-bone)]">
        <div className="site-container py-20 lg:py-28">
          <p className="eyebrow">Principles</p>
          <div className="mt-8 grid border-l border-t border-black/10 md:grid-cols-2">
            {principles.map(([title, text], index) => (
              <div key={title} className="min-h-64 border-b border-r border-black/10 p-7 sm:p-9">
                <span className="text-xs text-[var(--color-stone)]">0{index + 1}</span>
                <h3 className="font-display mt-14 text-3xl tracking-[-0.03em]">{title}</h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--color-stone)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
