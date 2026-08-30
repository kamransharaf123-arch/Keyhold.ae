import Image from "next/image";
import Link from "next/link";
import { AnimatedProgress } from "@/components/motion";
import type { UpdatePreview } from "@/data/site";
import { clampPercentage } from "@/lib/format";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = { en: "Construction", fr: "Construction" } as const;

export function UpdateCard({ update, locale = "en" }: { update: UpdatePreview; locale?: KeyHoldLocale }) {
  const progress = clampPercentage(update.progress);

  return (
    <article className="kh-motion-card border-t border-black/10 py-6 first:border-t-0">
      <Link href={localizedHref(`/updates/${update.slug}`, locale)} className="grid gap-5 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
        <div className="kh-motion-image relative aspect-[4/3] overflow-hidden bg-[var(--color-warm-grey)]">
          <Image src={update.image} alt="" fill sizes="144px" className="object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{update.location}</p>
          <h3 className="mt-2 text-xl font-medium text-[var(--color-graphite)]">{update.project}</h3>
          <p className="mt-2 text-sm text-[var(--color-stone)]">{update.status} · {update.updatedAt}</p>
          <div className="mt-4">
            <AnimatedProgress value={progress} label={`${update.project} ${COPY[locale]}`} />
          </div>
        </div>
        <div className="sm:text-right">
          <div className="font-display text-3xl text-[var(--color-teal-deep)]">{progress}%</div>
          <div className="mt-1 text-[0.67rem] uppercase tracking-[0.16em] text-[var(--color-stone)]">{COPY[locale]}</div>
        </div>
      </Link>
    </article>
  );
}
