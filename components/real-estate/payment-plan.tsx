import type { CSSProperties } from "react";
import { ChartReveal, Reveal } from "@/components/motion";
import type { PaymentMilestone } from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

type BarFillStyle = CSSProperties & { "--kh-bar-fill-width"?: string };

const COPY = {
  en: {
    empty: "No payment-plan schedule is displayed for this listing. Commercial terms must be confirmed with the relevant developer, owner or authorised seller.",
    disclaimer: "Payment plans shown on KeyHold are indicative until confirmed against current developer or seller documentation.",
  },
  fr: {
    empty: "Aucun échéancier de paiement n’est affiché pour cette annonce. Les conditions commerciales doivent être confirmées auprès du promoteur, du propriétaire ou du vendeur autorisé concerné.",
    disclaimer: "Les plans de paiement affichés sur KeyHold sont indicatifs jusqu’à confirmation auprès de la documentation actuelle du promoteur ou du vendeur.",
  },
} as const;

export function PaymentPlan({ milestones, locale = "en" }: { milestones: PaymentMilestone[]; locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  if (milestones.length === 0) {
    return (
      <div className="border border-black/10 bg-[var(--color-bone)] p-6 text-sm leading-7 text-[var(--color-stone)]">
        {copy.empty}
      </div>
    );
  }

  return (
    <Reveal>
      <div aria-hidden="true">
        <ChartReveal className="flex h-2 overflow-hidden bg-[var(--color-warm-grey)]">
          {milestones.map((milestone, index) => (
            <div
              key={`${milestone.label}-${index}`}
              className="kh-bar-fill h-full border-r border-[var(--color-soft-white)] bg-[var(--color-teal)] last:border-r-0"
              style={{ "--kh-bar-fill-width": `${milestone.percentage}%`, opacity: Math.max(0.36, 1 - index * 0.16) } as BarFillStyle}
            />
          ))}
        </ChartReveal>
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
        {copy.disclaimer}
      </p>
    </Reveal>
  );
}
