import Image from "next/image";
import type { FloorPlan } from "@/types/real-estate";
import { formatSqftRange } from "@/lib/format";

export function FloorPlans({ plans }: { plans: FloorPlan[] }) {
  if (plans.length === 0) {
    return <p className="text-sm text-[var(--color-stone)]">Floor plans are available on request where supplied by the developer or owner.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <article key={plan.id} className="border border-black/10 bg-[var(--color-soft-white)]">
          <div className="relative aspect-[4/3] bg-[var(--color-bone)]">
            <Image src={plan.image} alt={`Schematic demo floor plan for ${plan.label}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-8" />
          </div>
          <div className="border-t border-black/10 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{plan.propertyType}</p>
            <h3 className="mt-2 text-lg font-medium">{plan.label}</h3>
            <p className="mt-2 text-sm text-[var(--color-stone)]">{formatSqftRange(plan.sizeFromSqft, plan.sizeToSqft ?? null)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
