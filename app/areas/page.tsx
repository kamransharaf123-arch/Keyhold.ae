import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { areas } from "@/data/site";

export const metadata: Metadata = { title: "Dubai Areas" };

export default function AreasPage() {
  return (
    <>
      <PageHero eyebrow="Dubai Areas" title="Understand the city, area by area." description="Explore Dubai communities through the lenses that matter: property type, lifestyle, connectivity, supply, rental demand and available projects." />
      <section className="site-container py-16 lg:py-24">
        <div className="grid border-l border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, index) => (
            <div key={area} className="min-h-44 border-b border-r border-black/10 p-7">
              <span className="text-xs text-[var(--color-stone)]">0{index + 1}</span>
              <h2 className="font-display mt-10 text-3xl">{area}</h2>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
