import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { areas } from "@/data/real-estate";
import { getProjectsByArea } from "@/lib/real-estate";

export const metadata: Metadata = { title: "Dubai Areas" };

export default function AreasPage() {
  return (
    <>
      <PageHero eyebrow="Dubai Areas" title="Understand the city, area by area." description="Explore Dubai communities through property type, lifestyle and the projects currently linked to each location." />
      <section className="site-container py-16 lg:py-24">
        <div className="grid border-l border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, index) => (
            <Link key={area.slug} href={`/areas/${area.slug}`} className="group min-h-52 border-b border-r border-black/10 p-7 transition-colors hover:bg-[var(--color-bone)]">
              <div className="flex items-start justify-between gap-4"><span className="text-xs text-[var(--color-stone)]">{String(index + 1).padStart(2, "0")}</span><span className="text-xs text-[var(--color-stone)]">{getProjectsByArea(area.slug).length} projects</span></div>
              <h2 className="font-display mt-10 text-3xl">{area.name}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">{area.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
