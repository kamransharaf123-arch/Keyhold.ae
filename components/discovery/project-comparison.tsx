"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { countUnitsByAvailability, getInitialCashRequirement, getPaymentPlanSignature, getProjectViews } from "@/lib/discovery";
import { formatAed, formatDateTimeDubai, formatProjectPrice, formatSqftRange } from "@/lib/format";
import type { AreaProfile, DeveloperProfile, Project } from "@/types/real-estate";

type ProjectComparisonProps = {
  projects: Project[];
  developers: DeveloperProfile[];
  areas: AreaProfile[];
};

export function ProjectComparison({ projects, developers, areas }: ProjectComparisonProps) {
  const searchParams = useSearchParams();
  const requested = useMemo(() => (searchParams.get("projects") ?? "").split(",").map((value) => value.trim()).filter(Boolean).slice(0, 4), [searchParams]);
  const [slugs, setSlugs] = useState(requested);

  const selected = slugs.map((slug) => projects.find((project) => project.slug === slug)).filter((project): project is Project => Boolean(project));
  const developerNames = Object.fromEntries(developers.map((developer) => [developer.slug, developer.name]));
  const areaNames = Object.fromEntries(areas.map((area) => [area.slug, area.name]));

  function removeProject(slug: string) {
    const next = slugs.filter((item) => item !== slug);
    setSlugs(next);
    window.localStorage.setItem("keyhold_compare_v1", JSON.stringify(next));
    const params = new URLSearchParams(window.location.search);
    if (next.length > 0) params.set("projects", next.join(",")); else params.delete("projects");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/compare?${query}` : "/compare");
  }

  if (selected.length === 0) {
    return (
      <div className="site-container py-16 lg:py-24">
        <div className="border border-black/10 bg-[var(--color-bone)] p-8 sm:p-12">
          <p className="eyebrow">Project comparison</p>
          <h1 className="font-display mt-4 text-5xl tracking-[-0.04em]">Nothing selected yet.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">Choose up to four properties from the discovery engine. Module 3 compares verified catalogue facts; Module 4 will add the full financial comparison layer.</p>
          <Link href="/discover" className="button button-dark mt-7">Open discovery</Link>
        </div>
      </div>
    );
  }

  const rows: Array<{ label: string; render: (project: Project) => ReactNode }> = [
    { label: "Category", render: (project) => project.category },
    { label: "Area", render: (project) => areaNames[project.areaSlug] ?? project.location },
    { label: "Developer", render: (project) => developerNames[project.developerSlug] ?? project.developerSlug },
    { label: "Price / rent", render: (project) => formatProjectPrice(project) },
    { label: "Property type", render: (project) => project.propertyTypes.join(" · ") },
    { label: "Bedrooms", render: (project) => project.bedroomsLabel },
    { label: "Size", render: (project) => formatSqftRange(project.sizeFromSqft, project.sizeToSqft) },
    { label: "Handover", render: (project) => project.handoverLabel },
    { label: "Payment plan", render: (project) => getPaymentPlanSignature(project) ?? "Not applicable" },
    { label: "Estimated initial cash*", render: (project) => { const value = getInitialCashRequirement(project); return value === null ? "Not applicable" : `From ${formatAed(value, { compact: true })}`; } },
    { label: "Available units shown", render: (project) => String(countUnitsByAvailability(project).available) },
    { label: "Views in current inventory", render: (project) => getProjectViews(project).join(" · ") || "Not provided" },
    { label: "Investment goals", render: (project) => project.discovery.investmentGoals.join(" · ") },
    { label: "Lifestyle", render: (project) => project.discovery.lifestyleTags.join(" · ") },
    { label: "Availability verified", render: (project) => formatDateTimeDubai(project.availabilityLastVerifiedAt) },
  ];

  return (
    <div className="site-container py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-black/10 pb-7">
        <div>
          <p className="eyebrow">Project comparison</p>
          <h1 className="font-display mt-3 text-5xl tracking-[-0.04em]">Compare the facts side by side.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">This Module 3 comparison deliberately avoids ROI claims. Financial scenarios, net yield, true costs and exit analysis arrive in the Investment Engine.</p>
        </div>
        <Link href="/discover" className="button border border-black/10">Add or change projects</Link>
      </div>

      <div className="mt-8 overflow-x-auto border border-black/10 bg-[var(--color-soft-white)]">
        <div className="grid min-w-[780px]" style={{ gridTemplateColumns: `12rem repeat(${selected.length}, minmax(13rem, 1fr))` }}>
          <div className="border-b border-r border-black/10 bg-[var(--color-bone)] p-4" />
          {selected.map((project) => (
            <div key={project.slug} className="border-b border-r border-black/10 p-4 last:border-r-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-warm-grey)]">
                <Image src={project.heroImage} alt="" fill sizes="260px" className="object-cover" />
              </div>
              <p className="mt-4 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">{project.location}</p>
              <Link href={`/projects/${project.slug}`} className="font-display mt-1 block text-2xl tracking-[-0.03em] hover:underline">{project.title}</Link>
              <button type="button" onClick={() => removeProject(project.slug)} className="mt-3 text-xs font-semibold text-[var(--color-stone)] underline underline-offset-4">Remove</button>
            </div>
          ))}
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <div className="border-b border-r border-black/10 bg-[var(--color-bone)] p-4 text-[0.67rem] font-semibold uppercase tracking-[0.13em] text-[var(--color-stone)]">{row.label}</div>
              {selected.map((project) => <div key={`${row.label}-${project.slug}`} className="border-b border-r border-black/10 p-4 text-sm leading-6 last:border-r-0">{row.render(project)}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-[0.7rem] leading-5 text-[var(--color-stone)] md:grid-cols-2">
        <p>*Initial cash is a discovery estimate based on the displayed starting price and first payment milestone. It is not a full acquisition-cost calculation.</p>
        <p>Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice.</p>
      </div>
    </div>
  );
}
