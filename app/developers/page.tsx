import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { developers } from "@/data/site";

export const metadata: Metadata = { title: "Developers" };

export default function DevelopersPage() {
  return (
    <>
      <PageHero eyebrow="Developers" title="Explore Dubai by developer." description="Browse Dubai opportunities by developer and understand the projects, locations and property types associated with each name." />
      <section className="site-container py-16 lg:py-24">
        <div className="grid border-l border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer, index) => (
            <div key={developer} className="min-h-44 border-b border-r border-black/10 p-7">
              <span className="text-xs text-[var(--color-stone)]">0{index + 1}</span>
              <h2 className="font-display mt-10 text-3xl">{developer}</h2>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
