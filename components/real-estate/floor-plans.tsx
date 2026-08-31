import Image from "next/image";
import type { FloorPlan } from "@/types/real-estate";
import { formatSqftRange } from "@/lib/format";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { empty: "Floor plans are available on request where supplied by the developer or owner.", alt: (label: string) => `Schematic demo floor plan for ${label}` },
  fr: { empty: "Les plans sont disponibles sur demande lorsqu’ils sont fournis par le promoteur ou le propriétaire.", alt: (label: string) => `Plan schématique de démonstration pour ${label}` },
} as const;

export function FloorPlans({ plans, locale = "en" }: { plans: FloorPlan[]; locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  if (plans.length === 0) {
    return <p className="text-sm text-[var(--color-stone)]">{copy.empty}</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <article key={plan.id} className="border border-black/10 bg-[var(--color-soft-white)]">
          <div className="relative aspect-[4/3] bg-[var(--color-bone)]">
            <Image src={plan.image} alt={copy.alt(plan.label)} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-contain p-8" />
          </div>
          <div className="border-t border-black/10 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{plan.propertyType}</p>
            <h3 className="mt-2 text-lg font-medium">{plan.label}</h3>
            <p className="mt-2 text-sm text-[var(--color-stone)]">{formatSqftRange(plan.sizeFromSqft, plan.sizeToSqft ?? null, locale)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
