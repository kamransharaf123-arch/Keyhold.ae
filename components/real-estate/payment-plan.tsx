import type { PaymentMilestone } from "@/types/real-estate";

export function PaymentPlan({ milestones }: { milestones: PaymentMilestone[] }) {
  if (milestones.length === 0) {
    return (
      <div className="border border-black/10 bg-[var(--color-bone)] p-6 text-sm leading-7 text-[var(--color-stone)]">
        No payment-plan schedule is displayed for this listing. Commercial terms must be confirmed with the relevant developer, owner or authorised seller.
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-2 overflow-hidden bg-[var(--color-warm-grey)]" aria-hidden="true">
        {milestones.map((milestone, index) => (
          <div
            key={`${milestone.label}-${index}`}
            className="h-full border-r border-[var(--color-soft-white)] bg-[var(--color-charcoal)] last:border-r-0"
            style={{ width: `${milestone.percentage}%`, opacity: Math.max(0.36, 1 - index * 0.16) }}
          />
        ))}
      </div>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {milestones.map((milestone, index) => (
          <li key={`${milestone.label}-${index}`} className="border-t border-black/10 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-graphite)]">{milestone.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-stone)]">{milestone.timing}</p>
              </div>
              <span className="font-display text-3xl text-[var(--color-graphite)]">{milestone.percentage}%</span>
            </div>
            {milestone.note ? <p className="mt-3 text-xs leading-5 text-[var(--color-stone)]">{milestone.note}</p> : null}
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs leading-5 text-[var(--color-stone)]">
        Payment plans shown on KeyHold are indicative until confirmed against current developer or seller documentation.
      </p>
    </div>
  );
}
