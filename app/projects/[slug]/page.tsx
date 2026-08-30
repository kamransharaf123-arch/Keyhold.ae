import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { InvestmentSimulator } from "@/components/investment/investment-simulator";
import { KeyHoldIntelligence } from "@/components/intelligence/keyhold-intelligence";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { ConstructionTimeline } from "@/components/real-estate/construction-timeline";
import { FloorPlans } from "@/components/real-estate/floor-plans";
import { PaymentPlan } from "@/components/real-estate/payment-plan";
import { ProjectDocuments } from "@/components/real-estate/project-documents";
import { ProjectFacts } from "@/components/real-estate/project-facts";
import { ProjectGallery } from "@/components/real-estate/project-gallery";
import { ProjectSection } from "@/components/real-estate/section-shell";
import { RegulatoryCard } from "@/components/real-estate/regulatory-card";
import { UnitSelector } from "@/components/real-estate/unit-selector";
import { projectCatalog, siteConfig } from "@/data/site";
import { formatDateTimeDubai, formatProjectPrice, formatSqftRange } from "@/lib/format";
import {
  getAreaBySlug,
  getConstructionUpdatesForProject,
  getDeveloperBySlug,
  getProjectBySlug,
  getRelatedProjects,
} from "@/lib/real-estate";

export function generateStaticParams() {
  return projectCatalog.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} | KeyHold`,
      description: project.shortDescription,
      url: `${siteConfig.url}/projects/${project.slug}`,
      images: [{ url: project.heroImage }],
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const investmentEligible = Boolean(project.investment) && project.priceFromAed !== null;

  const developer = getDeveloperBySlug(project.developerSlug);
  const area = getAreaBySlug(project.areaSlug);
  const updates = getConstructionUpdatesForProject(project.slug);
  const related = getRelatedProjects(project);
  const previewBySlug = new Map(projectCatalog.map((item) => [item.slug, item]));

  return (
    <>
      <section className="site-container py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              {area ? <Link href={`/areas/${area.slug}`} className="hover:text-[var(--color-graphite)]">{area.name}</Link> : <span>{project.location}</span>}
              {developer ? <><span aria-hidden="true">·</span><Link href={`/developers/${developer.slug}`} className="hover:text-[var(--color-graphite)]">{developer.name}</Link></> : null}
            </div>
            <h1 className="display-title mt-4 text-5xl sm:text-6xl lg:text-7xl">{project.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-stone)]">{project.shortDescription}</p>
          </div>
          <div className="lg:text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">Guide price / rate</p>
            <p className="font-display mt-2 text-3xl">{formatProjectPrice(project)}</p>
            <p className="mt-2 text-xs text-[var(--color-stone)]">Availability checked {formatDateTimeDubai(project.availabilityLastVerifiedAt)}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/contact?project=${encodeURIComponent(project.title)}`} className="button button-dark">Enquire about this project</Link>
          {investmentEligible ? <a href="#investment" className="button border border-black/10 hover:bg-[var(--color-bone)]">Simulate investment</a> : null}
          <a href="#units" className="button border border-black/10 hover:bg-[var(--color-bone)]">View unit selector*</a>
        </div>
      </section>

      <ProjectGallery images={project.images} />

      <section className="site-container pb-14 lg:pb-20">
        <ProjectFacts facts={project.keyFacts} />
      </section>

      <ProjectSection eyebrow="Overview" title="The project at a glance.">
        <div className="space-y-7">
          <p className="text-base leading-8 text-[var(--color-stone)]">{project.overview}</p>
          <dl className="grid gap-x-8 gap-y-5 border-t border-black/10 pt-6 sm:grid-cols-2">
            <div><dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">Property type</dt><dd className="mt-2 text-sm font-medium">{project.propertyTypes.join(" · ")}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">Bedrooms</dt><dd className="mt-2 text-sm font-medium">{project.bedroomsLabel}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">Size</dt><dd className="mt-2 text-sm font-medium">{formatSqftRange(project.sizeFromSqft, project.sizeToSqft)}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">Handover / status</dt><dd className="mt-2 text-sm font-medium">{project.handoverLabel}</dd></div>
          </dl>
        </div>
      </ProjectSection>

      <ProjectSection eyebrow="Amenities" title="What the project includes.">
        <div className="grid border-l border-t border-black/10 sm:grid-cols-2">
          {project.amenities.map((amenity) => <div key={amenity} className="border-b border-r border-black/10 p-4 text-sm">{amenity}</div>)}
        </div>
      </ProjectSection>

      <ProjectSection eyebrow="Payment plan" title="Understand when capital is due.">
        <PaymentPlan milestones={project.paymentPlan} />
      </ProjectSection>

      <ProjectSection eyebrow="Floor plans" title="Layouts supplied for this record.">
        <FloorPlans plans={project.floorPlans} />
      </ProjectSection>

      <ProjectSection id="units" eyebrow="Unit selector" title="Explore the displayed unit inventory.">
        <UnitSelector units={project.units} projectSlug={project.slug} />
      </ProjectSection>

      {investmentEligible && project.investment && project.priceFromAed !== null ? (
        <ProjectSection id="investment" eyebrow="Investment analysis" title="Model gross yield, net yield, true cost, cash flow and exit scenarios.">
          <Suspense fallback={<div className="text-sm text-[var(--color-stone)]">Loading investment simulator…</div>}>
            <InvestmentSimulator
              projectTitle={project.title}
              projectSlug={project.slug}
              profile={project.investment}
              defaultPurchasePriceAed={project.priceFromAed}
              defaultUnitSizeSqft={project.investment.defaultUnitSizeSqft ?? project.sizeFromSqft}
              units={project.units}
              paymentPlan={project.paymentPlan}
              projectCategory={project.category}
              compactHeading
            />
          </Suspense>
        </ProjectSection>
      ) : null}

      <ProjectSection id="intelligence" eyebrow="KeyHold Intelligence" title="Score the opportunity, surface the risks and show the evidence.">
        <KeyHoldIntelligence project={project} />
      </ProjectSection>

      <ProjectSection eyebrow="Documents" title="Project materials in one place.">
        <ProjectDocuments documents={project.documents} projectTitle={project.title} />
      </ProjectSection>

      <ProjectSection eyebrow="DLD / RERA" title="Regulatory information should be verifiable.">
        <RegulatoryCard regulatory={project.regulatory} />
      </ProjectSection>

      {updates.length > 0 ? (
        <ProjectSection eyebrow="Construction updates" title="Follow progress over time.">
          <ConstructionTimeline updates={updates} />
        </ProjectSection>
      ) : null}

      {related.length > 0 ? (
        <section className="site-container border-t border-black/10 py-14 lg:py-20">
          <p className="eyebrow">Related projects</p>
          <div className="mt-7 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => {
              const preview = previewBySlug.get(item.slug);
              return preview ? <ProjectCard key={item.slug} project={preview} /> : null;
            })}
          </div>
        </section>
      ) : null}

      <section className="site-container pb-20">
        <div className="bg-[var(--color-charcoal)] p-7 text-[var(--color-bone)] sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-champagne)]">Current availability</p>
            <h2 className="font-display mt-3 text-3xl">Confirm the latest unit and commercial terms.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">Displayed inventory can change. A KeyHold advisor should confirm current developer or seller availability before any reservation or payment.</p>
          </div>
          <Link href={`/contact?project=${encodeURIComponent(project.title)}`} className="button button-light mt-6 shrink-0 lg:mt-0">Speak to an Advisor</Link>
        </div>
      </section>
    </>
  );
}
