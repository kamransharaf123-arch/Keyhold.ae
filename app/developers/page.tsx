import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { developers } from "@/data/real-estate";
import { getProjectsByDeveloper } from "@/lib/real-estate";

export const metadata: Metadata = { title: "Developers" };

export default function DevelopersPage() {
  return (
    <>
      <PageHero eyebrow="Developers" title="Explore Dubai by developer." description="Browse opportunities by developer and understand the projects, locations and property types connected to each profile." />
      <section className="site-container py-16 lg:py-24">
        <div className="mb-8 border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
          Module 2 uses demo developer profiles. Replace all corporate facts with verified information before public launch.
        </div>
        <div className="grid border-l border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer, index) => (
            <Link key={developer.slug} href={`/developers/${developer.slug}`} className="group min-h-52 border-b border-r border-black/10 p-7 transition-colors hover:bg-[var(--color-bone)]">
              <div className="flex items-start justify-between gap-4"><span className="text-xs text-[var(--color-stone)]">{String(index + 1).padStart(2, "0")}</span><span className="text-xs text-[var(--color-stone)]">{getProjectsByDeveloper(developer.slug).length} projects</span></div>
              <h2 className="font-display mt-10 text-3xl">{developer.name}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">{developer.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
