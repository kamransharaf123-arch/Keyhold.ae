import Image from "next/image";
import Link from "next/link";
import type { UpdatePreview } from "@/data/site";
import { clampPercentage } from "@/lib/format";

export function UpdateCard({ update }: { update: UpdatePreview }) {
  const progress = clampPercentage(update.progress);

  return (
    <article className="border-t border-black/10 py-6 first:border-t-0">
      <Link href={`/updates/${update.slug}`} className="group grid gap-5 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-warm-grey)]">
          <Image src={update.image} alt="" fill sizes="144px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{update.location}</p>
          <h3 className="mt-2 text-xl font-medium text-[var(--color-graphite)]">{update.project}</h3>
          <p className="mt-2 text-sm text-[var(--color-stone)]">{update.status} · {update.updatedAt}</p>
          <div className="mt-4 h-px overflow-hidden bg-black/10">
            <div className="h-full bg-[var(--color-teal)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="sm:text-right">
          <div className="font-display text-3xl text-[var(--color-teal-deep)]">{progress}%</div>
          <div className="mt-1 text-[0.67rem] uppercase tracking-[0.16em] text-[var(--color-stone)]">Construction</div>
        </div>
      </Link>
    </article>
  );
}
