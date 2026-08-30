import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { constructionUpdates } from "@/data/catalog";
import { clampPercentage } from "@/lib/format";
import { getConstructionUpdateBySlug } from "@/lib/real-estate";

export function generateStaticParams() {
  return constructionUpdates.map((update) => ({ slug: update.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const update = getConstructionUpdateBySlug(slug);
  return update ? { title: `${update.project} · ${update.updatedAt}`, description: update.summary } : { title: "Update Not Found" };
}

export default async function ConstructionUpdateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const update = getConstructionUpdateBySlug(slug);
  if (!update) notFound();
  const progress = clampPercentage(update.progress);

  return (
    <>
      <section className="site-container py-12 lg:py-16">
        <Link href={`/projects/${update.projectSlug}`} className="text-link">← Back to project</Link>
        <p className="eyebrow mt-10">Construction Update · {update.updatedAt}</p>
        <h1 className="display-title mt-4 max-w-4xl text-5xl sm:text-6xl">{update.project}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-stone)]">{update.summary}</p>
      </section>
      <section className="site-container pb-14 lg:pb-20">
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-warm-grey)]">
          <Image src={update.image} alt={`Demo construction update for ${update.project}`} fill priority sizes="100vw" className="object-cover" />
        </div>
      </section>
      <section className="site-container border-t border-black/10 py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="eyebrow">Progress</p>
            <div className="font-display mt-3 text-6xl">{progress}%</div>
            <p className="mt-2 text-sm text-[var(--color-stone)]">{update.status}</p>
          </div>
          <div>
            <div className="h-2 overflow-hidden bg-[var(--color-warm-grey)]"><div className="h-full bg-[var(--color-teal)]" style={{ width: `${progress}%` }} /></div>
            <h2 className="font-display mt-8 text-3xl">Update milestones</h2>
            <ul className="mt-5 border-t border-black/10">
              {update.milestones.map((milestone) => <li key={milestone} className="border-b border-black/10 py-4 text-sm text-[var(--color-stone)]">{milestone}</li>)}
            </ul>
            <div className="mt-8 border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
              Demo update only. Production construction information must include a reliable date and verified source. Progress percentages should never be presented as current unless recently confirmed.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
