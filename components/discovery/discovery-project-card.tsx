"use client";

import Image from "next/image";
import Link from "next/link";
import { formatAed, formatDateTimeDubai, formatProjectPrice, formatSqftRange } from "@/lib/format";
import { getInitialCashRequirement, getPaymentPlanSignature, hasAvailableUnit } from "@/lib/discovery";
import type { Project } from "@/types/real-estate";

type DiscoveryProjectCardProps = {
  project: Project;
  developerName: string;
  compareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: (slug: string) => void;
};

export function DiscoveryProjectCard({
  project,
  developerName,
  compareSelected,
  compareDisabled,
  onToggleCompare,
}: DiscoveryProjectCardProps) {
  const initialCash = getInitialCashRequirement(project);
  const paymentPlan = getPaymentPlanSignature(project);
  const available = hasAvailableUnit(project);

  return (
    <article className="grid overflow-hidden border border-black/10 bg-[var(--color-soft-white)] sm:grid-cols-[15rem_1fr] lg:grid-cols-[17rem_1fr]">
      <Link href={`/projects/${project.slug}`} className="relative min-h-64 overflow-hidden bg-[var(--color-warm-grey)] sm:min-h-full" aria-label={`Open ${project.title}`}>
        <Image src={project.heroImage} alt="" fill sizes="(max-width: 640px) 100vw, 280px" className="object-cover transition-transform duration-700 hover:scale-[1.025]" />
        <span className="absolute left-4 top-4 bg-[color:rgba(252,251,248,0.92)] px-3 py-2 text-[0.63rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-graphite)] backdrop-blur">
          {project.category}
        </span>
      </Link>
      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-stone)]">{project.location} · {developerName}</p>
            <Link href={`/projects/${project.slug}`} className="font-display mt-2 block text-3xl tracking-[-0.035em] hover:underline hover:decoration-[var(--color-champagne)] hover:underline-offset-4">
              {project.title}
            </Link>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-stone)]">{project.shortDescription}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatProjectPrice(project)}</p>
            <p className="mt-1 text-xs text-[var(--color-stone)]">{formatSqftRange(project.sizeFromSqft, project.sizeToSqft)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-y border-black/[0.08] py-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="uppercase tracking-[0.12em] text-[var(--color-stone)]">Bedrooms</p>
            <p className="mt-1 font-medium">{project.bedroomsLabel}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.12em] text-[var(--color-stone)]">Handover</p>
            <p className="mt-1 font-medium">{project.handoverLabel}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.12em] text-[var(--color-stone)]">Payment</p>
            <p className="mt-1 font-medium">{paymentPlan ?? "Not applicable"}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.12em] text-[var(--color-stone)]">Initial cash*</p>
            <p className="mt-1 font-medium">{initialCash === null ? "Not applicable" : `From ${formatAed(initialCash, { compact: true })}`}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-3 py-1.5 ${available ? "bg-[#edf3eb] text-[#335239]" : "bg-[var(--color-warm-grey)] text-[var(--color-stone)]"}`}>
              {available ? "Available units shown" : "Availability to confirm"}
            </span>
            <span className="text-[var(--color-stone)]">Verified {formatDateTimeDubai(project.availabilityLastVerifiedAt)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onToggleCompare(project.slug)}
              disabled={!compareSelected && compareDisabled}
              aria-pressed={compareSelected}
              className={`min-h-11 border px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                compareSelected
                  ? "border-[var(--color-graphite)] bg-[var(--color-graphite)] text-white"
                  : "border-black/10 hover:border-[var(--color-champagne)]"
              }`}
            >
              {compareSelected ? "Added to compare" : "Compare"}
            </button>
            <Link href={`/projects/${project.slug}`} className="button button-dark min-h-11 px-4 text-xs">View project</Link>
          </div>
        </div>
        <p className="mt-4 text-[0.68rem] leading-5 text-[var(--color-stone)]">*Initial cash is a discovery estimate based on the displayed starting price and first payment milestone. Full financial modelling belongs to the Investment Engine.</p>
      </div>
    </article>
  );
}
