import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { constructionUpdates } from "@/data/catalog";
import { constructionUpdatesForLocale } from "@/data/localized-catalog";
import { clampPercentage } from "@/lib/format";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { back: "Back to project", eyebrow: "Construction Update", progress: "Progress", milestones: "Update milestones", notice: "Demo update only. Production construction information must include a reliable date and verified source. Progress percentages should never be presented as current unless recently confirmed." },
  fr: { back: "Retour au projet", eyebrow: "Mise à jour de construction", progress: "Avancement", milestones: "Étapes de mise à jour", notice: "Mise à jour de démonstration uniquement. Les informations de construction en production doivent inclure une date fiable et une source vérifiée. Les pourcentages d’avancement ne doivent jamais être présentés comme actuels sans confirmation récente." },
} as const;

export function generateStaticParams() {
  return constructionUpdates.map((update) => ({ slug: update.slug }));
}

function getUpdateByLocale(slug: string, locale: KeyHoldLocale) {
  return constructionUpdatesForLocale(locale).find((update) => update.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const update = getUpdateByLocale(slug, "en");
  const fallback: Metadata = update ? { title: `${update.project} · ${update.updatedAt}`, description: update.summary } : { title: "Update Not Found" };
  return websitePageMetadata(`update:${slug}`, `/updates/${slug}`, fallback, "en");
}

export function ConstructionUpdateDetailContent({ slug, locale = "en" }: { slug: string; locale?: KeyHoldLocale }) {
  const update = getUpdateByLocale(slug, locale);
  if (!update) notFound();
  const progress = clampPercentage(update.progress);
  const copy = COPY[locale];

  return (
    <>
      <section className="site-container py-12 lg:py-16">
        <Link href={localizedHref(`/projects/${update.projectSlug}`, locale)} className="text-link">← {copy.back}</Link>
        <p className="eyebrow mt-10">{copy.eyebrow} · {update.updatedAt}</p>
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
            <p className="eyebrow">{copy.progress}</p>
            <div className="font-display mt-3 text-6xl">{progress}%</div>
            <p className="mt-2 text-sm text-[var(--color-stone)]">{update.status}</p>
          </div>
          <div>
            <div className="h-2 overflow-hidden bg-[var(--color-warm-grey)]"><div className="h-full bg-[var(--color-teal)]" style={{ width: `${progress}%` }} /></div>
            <h2 className="font-display mt-8 text-3xl">{copy.milestones}</h2>
            <ul className="mt-5 border-t border-black/10">
              {update.milestones.map((milestone) => <li key={milestone} className="border-b border-black/10 py-4 text-sm text-[var(--color-stone)]">{milestone}</li>)}
            </ul>
            <div className="mt-8 border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
              {copy.notice}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default async function ConstructionUpdateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ConstructionUpdateDetailContent slug={slug} locale="en" />;
}
