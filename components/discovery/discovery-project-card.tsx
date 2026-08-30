"use client";

import Image from "next/image";
import Link from "next/link";
import { formatAed, formatDateTimeDubai, formatProjectPrice, formatSqftRange } from "@/lib/format";
import { getInitialCashRequirement, getPaymentPlanSignature, hasAvailableUnit } from "@/lib/discovery";
import { localizedHref } from "@/lib/i18n/locale";
import type { Project } from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    bedrooms: "Bedrooms", handover: "Handover", payment: "Payment", initialCash: "Initial cash*",
    notApplicable: "Not applicable", from: "From",
    availableShown: "Available units shown", availabilityConfirm: "Availability to confirm",
    verified: "Verified", modelInvestment: "Model investment", addedToCompare: "Added to compare", compare: "Compare", viewProject: "View project",
    footnote: "*Initial cash is a discovery estimate based on the displayed starting price and first payment milestone. Full financial modelling belongs to the Investment Engine.",
  },
  fr: {
    bedrooms: "Chambres", handover: "Livraison", payment: "Paiement", initialCash: "Trésorerie initiale*",
    notApplicable: "Non applicable", from: "À partir de",
    availableShown: "Unités disponibles affichées", availabilityConfirm: "Disponibilité à confirmer",
    verified: "Vérifié le", modelInvestment: "Simuler l’investissement", addedToCompare: "Ajouté à la comparaison", compare: "Comparer", viewProject: "Voir le projet",
    footnote: "*La trésorerie initiale est une estimation de découverte basée sur le prix de départ affiché et le premier versement. La modélisation financière complète relève du moteur d’investissement.",
  },
} as const;

type DiscoveryProjectCardProps = {
  project: Project;
  developerName: string;
  compareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: (slug: string) => void;
  locale?: KeyHoldLocale;
};

export function DiscoveryProjectCard({
  project,
  developerName,
  compareSelected,
  compareDisabled,
  onToggleCompare,
  locale = "en",
}: DiscoveryProjectCardProps) {
  const copy = COPY[locale];
  const initialCash = getInitialCashRequirement(project);
  const paymentPlan = getPaymentPlanSignature(project);
  const available = hasAvailableUnit(project);
  const projectHref = localizedHref(`/projects/${project.slug}`, locale);

  return (
    <article className="kh-motion-card grid overflow-hidden border border-black/10 bg-[var(--color-soft-white)] sm:grid-cols-[15rem_1fr] lg:grid-cols-[17rem_1fr]">
      <Link href={projectHref} className="kh-motion-image relative min-h-64 overflow-hidden bg-[var(--color-warm-grey)] sm:min-h-full" aria-label={`Open ${project.title}`}>
        <Image src={project.heroImage} alt="" fill sizes="(max-width: 640px) 100vw, 280px" className="object-cover" />
        <span className="absolute left-4 top-4 bg-[color:rgba(228,239,237,0.94)] px-3 py-2 text-[0.63rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-teal-deep)] backdrop-blur">
          {project.category}
        </span>
      </Link>
      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-stone)]">{project.location} · {developerName}</p>
            <Link href={projectHref} className="font-display mt-2 block text-3xl tracking-[-0.035em] hover:underline hover:decoration-[var(--color-champagne)] hover:underline-offset-4">
              {project.title}
            </Link>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-stone)]">{project.shortDescription}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatProjectPrice(project, locale)}</p>
            <p className="mt-1 text-xs text-[var(--color-stone)]">{formatSqftRange(project.sizeFromSqft, project.sizeToSqft, locale)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-y border-black/[0.08] py-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.bedrooms}</p>
            <p className="mt-1 font-medium">{project.bedroomsLabel}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.handover}</p>
            <p className="mt-1 font-medium">{project.handoverLabel}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.payment}</p>
            <p className="mt-1 font-medium">{paymentPlan ?? copy.notApplicable}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.initialCash}</p>
            <p className="mt-1 font-medium">{initialCash === null ? copy.notApplicable : `${copy.from} ${formatAed(initialCash, { compact: true })}`}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-3 py-1.5 ${available ? "bg-[var(--color-sage-soft)] text-[var(--color-sage-deep)]" : "bg-[var(--color-warm-grey)] text-[var(--color-stone)]"}`}>
              {available ? copy.availableShown : copy.availabilityConfirm}
            </span>
            <span className="text-[var(--color-stone)]">{copy.verified} {formatDateTimeDubai(project.availabilityLastVerifiedAt, locale)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.investment && project.priceFromAed !== null ? <Link href={`${projectHref}#investment`} className="button min-h-11 border border-black/10 px-4 text-xs">{copy.modelInvestment}</Link> : null}
            <button
              type="button"
              onClick={() => onToggleCompare(project.slug)}
              disabled={!compareSelected && compareDisabled}
              aria-pressed={compareSelected}
              className={`min-h-11 border px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                compareSelected
                  ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white"
                  : "border-black/10 hover:border-[var(--color-teal)] hover:bg-[var(--color-teal-soft)]"
              }`}
            >
              {compareSelected ? copy.addedToCompare : copy.compare}
            </button>
            <Link href={projectHref} className="button button-dark min-h-11 px-4 text-xs">{copy.viewProject}</Link>
          </div>
        </div>
        <p className="mt-4 text-[0.68rem] leading-5 text-[var(--color-stone)]">{copy.footnote}</p>
      </div>
    </article>
  );
}
