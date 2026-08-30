import Image from "next/image";
import Link from "next/link";
import { AnimatedProgress } from "@/components/motion";
import type { ConstructionUpdate } from "@/types/real-estate";
import { clampPercentage } from "@/lib/format";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { viewUpdate: "View update", construction: "Construction", altPrefix: "Demo construction update for" },
  fr: { viewUpdate: "Voir la mise à jour", construction: "Construction", altPrefix: "Mise à jour de construction de démonstration pour" },
} as const;

export function ConstructionTimeline({ updates, locale = "en" }: { updates: ConstructionUpdate[]; locale?: KeyHoldLocale }) {
  if (updates.length === 0) return null;
  const copy = COPY[locale];

  return (
    <div className="space-y-0 border-t border-black/10">
      {updates.map((update) => (
        <article key={update.slug} className="grid gap-5 border-b border-black/10 py-6 md:grid-cols-[10rem_1fr_auto] md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-warm-grey)]">
            <Image src={update.image} alt={`${copy.altPrefix} ${update.project}`} fill sizes="160px" className="object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{update.updatedAt}</p>
            <h3 className="mt-2 text-lg font-medium">{update.status}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">{update.summary}</p>
            <Link href={localizedHref(`/updates/${update.slug}`, locale)} className="text-link mt-4 inline-block">{copy.viewUpdate}</Link>
          </div>
          <div className="md:text-right">
            <span className="font-display text-3xl">{clampPercentage(update.progress)}%</span>
            <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.construction}</span>
            <div className="mt-3 md:w-40">
              <AnimatedProgress value={clampPercentage(update.progress)} label={`${update.project} ${copy.construction}`} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
