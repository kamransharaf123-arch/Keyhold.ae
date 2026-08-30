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
import { projects as enProjects } from "@/data/catalog";
import { projectsForLocale, areasForLocale, developersForLocale, constructionUpdatesForLocale } from "@/data/localized-catalog";
import { formatDateTimeDubai, formatProjectPrice, formatSqftRange } from "@/lib/format";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedProjectCatalog } from "@/lib/i18n/localized-site";
import type { KeyHoldLocale } from "@/types/localization";
import { getRelatedProjects } from "@/lib/real-estate";

const COPY = {
  en: {
    guidePrice: "Guide price / rate", checked: "Availability checked", enquire: "Enquire about this project", simulate: "Simulate investment", viewUnits: "View unit selector*",
    overviewEyebrow: "Overview", overviewTitle: "The project at a glance.", propertyType: "Property type", bedrooms: "Bedrooms", size: "Size", handover: "Handover / status",
    amenitiesEyebrow: "Amenities", amenitiesTitle: "What the project includes.",
    paymentEyebrow: "Payment plan", paymentTitle: "Understand when capital is due.",
    floorPlansEyebrow: "Floor plans", floorPlansTitle: "Layouts supplied for this record.",
    unitsEyebrow: "Unit selector", unitsTitle: "Explore the displayed unit inventory.",
    investmentEyebrow: "Investment analysis", investmentTitle: "Model gross yield, net yield, true cost, cash flow and exit scenarios.",
    intelligenceEyebrow: "KeyHold Intelligence", intelligenceTitle: "Score the opportunity, surface the risks and show the evidence.",
    documentsEyebrow: "Documents", documentsTitle: "Project materials in one place.",
    regulatoryEyebrow: "DLD / RERA", regulatoryTitle: "Regulatory information should be verifiable.",
    updatesEyebrow: "Construction updates", updatesTitle: "Follow progress over time.",
    related: "Related projects",
    availabilityEyebrow: "Current availability", availabilityTitle: "Confirm the latest unit and commercial terms.", availabilityBody: "Displayed inventory can change. A KeyHold advisor should confirm current developer or seller availability before any reservation or payment.", speakToAdvisor: "Speak to an Advisor",
  },
  fr: {
    guidePrice: "Prix / tarif indicatif", checked: "Disponibilité vérifiée le", enquire: "Se renseigner sur ce projet", simulate: "Simuler l’investissement", viewUnits: "Voir le sélecteur d’unités*",
    overviewEyebrow: "Présentation", overviewTitle: "Le projet en un coup d’œil.", propertyType: "Type de bien", bedrooms: "Chambres", size: "Surface", handover: "Livraison / statut",
    amenitiesEyebrow: "Équipements", amenitiesTitle: "Ce que comprend le projet.",
    paymentEyebrow: "Plan de paiement", paymentTitle: "Comprenez quand le capital est dû.",
    floorPlansEyebrow: "Plans", floorPlansTitle: "Agencements fournis pour ce dossier.",
    unitsEyebrow: "Sélecteur d’unités", unitsTitle: "Explorez l’inventaire d’unités affiché.",
    investmentEyebrow: "Analyse d’investissement", investmentTitle: "Modélisez le rendement brut, net, le coût réel, les flux de trésorerie et les scénarios de sortie.",
    intelligenceEyebrow: "KeyHold Intelligence", intelligenceTitle: "Notez l’opportunité, mettez en évidence les risques et montrez les preuves.",
    documentsEyebrow: "Documents", documentsTitle: "Les documents du projet réunis en un seul endroit.",
    regulatoryEyebrow: "DLD / RERA", regulatoryTitle: "Les informations réglementaires doivent être vérifiables.",
    updatesEyebrow: "Avancement de construction", updatesTitle: "Suivez l’avancement dans le temps.",
    related: "Projets similaires",
    availabilityEyebrow: "Disponibilité actuelle", availabilityTitle: "Confirmez les dernières conditions d’unité et commerciales.", availabilityBody: "L’inventaire affiché peut changer. Un conseiller KeyHold doit confirmer la disponibilité actuelle auprès du promoteur ou du vendeur avant toute réservation ou paiement.", speakToAdvisor: "Parler à un conseiller",
  },
} as const;

export function generateStaticParams() {
  return enProjects.map((project) => ({ slug: project.slug }));
}

function getProjectByLocale(slug: string, locale: KeyHoldLocale) {
  return projectsForLocale(locale).find((project) => project.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectByLocale(slug, "en");
  const fallback: Metadata = project
    ? { title: project.title, description: project.shortDescription, openGraph: { title: `${project.title} | KeyHold`, description: project.shortDescription, images: [{ url: project.heroImage }] } }
    : { title: "Project Not Found" };
  return websitePageMetadata(`project:${slug}`, `/projects/${slug}`, fallback, "en");
}

export function ProjectDetailContent({ slug, locale = "en" }: { slug: string; locale?: KeyHoldLocale }) {
  const project = getProjectByLocale(slug, locale);
  if (!project) notFound();
  const copy = COPY[locale];

  const investmentEligible = Boolean(project.investment) && project.priceFromAed !== null;

  const developer = developersForLocale(locale).find((item) => item.slug === project.developerSlug);
  const area = areasForLocale(locale).find((item) => item.slug === project.areaSlug);
  const updates = constructionUpdatesForLocale(locale).filter((item) => item.projectSlug === project.slug).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const related = getRelatedProjects(project);
  const previewBySlug = new Map(localizedProjectCatalog(locale).map((item) => [item.slug, item]));

  return (
    <>
      <section className="site-container py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              {area ? <Link href={localizedHref(`/areas/${area.slug}`, locale)} className="hover:text-[var(--color-graphite)]">{area.name}</Link> : <span>{project.location}</span>}
              {developer ? <><span aria-hidden="true">·</span><Link href={localizedHref(`/developers/${developer.slug}`, locale)} className="hover:text-[var(--color-graphite)]">{developer.name}</Link></> : null}
            </div>
            <h1 className="display-title mt-4 text-5xl sm:text-6xl lg:text-7xl">{project.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-stone)]">{project.shortDescription}</p>
          </div>
          <div className="lg:text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.guidePrice}</p>
            <p className="font-display mt-2 text-3xl">{formatProjectPrice(project)}</p>
            <p className="mt-2 text-xs text-[var(--color-stone)]">{copy.checked} {formatDateTimeDubai(project.availabilityLastVerifiedAt)}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`${localizedHref("/contact", locale)}?project=${encodeURIComponent(project.title)}`} className="button button-dark">{copy.enquire}</Link>
          {investmentEligible ? <a href="#investment" className="button border border-black/10 hover:bg-[var(--color-bone)]">{copy.simulate}</a> : null}
          <a href="#units" className="button border border-black/10 hover:bg-[var(--color-bone)]">{copy.viewUnits}</a>
        </div>
      </section>

      <ProjectGallery images={project.images} />

      <section className="site-container pb-14 lg:pb-20">
        <ProjectFacts facts={project.keyFacts} />
      </section>

      <ProjectSection eyebrow={copy.overviewEyebrow} title={copy.overviewTitle}>
        <div className="space-y-7">
          <p className="text-base leading-8 text-[var(--color-stone)]">{project.overview}</p>
          <dl className="grid gap-x-8 gap-y-5 border-t border-black/10 pt-6 sm:grid-cols-2">
            <div><dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.propertyType}</dt><dd className="mt-2 text-sm font-medium">{project.propertyTypes.join(" · ")}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.bedrooms}</dt><dd className="mt-2 text-sm font-medium">{project.bedroomsLabel}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.size}</dt><dd className="mt-2 text-sm font-medium">{formatSqftRange(project.sizeFromSqft, project.sizeToSqft)}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.handover}</dt><dd className="mt-2 text-sm font-medium">{project.handoverLabel}</dd></div>
          </dl>
        </div>
      </ProjectSection>

      <ProjectSection eyebrow={copy.amenitiesEyebrow} title={copy.amenitiesTitle}>
        <div className="grid border-l border-t border-black/10 sm:grid-cols-2">
          {project.amenities.map((amenity) => <div key={amenity} className="border-b border-r border-black/10 p-4 text-sm">{amenity}</div>)}
        </div>
      </ProjectSection>

      <ProjectSection eyebrow={copy.paymentEyebrow} title={copy.paymentTitle}>
        <PaymentPlan milestones={project.paymentPlan} />
      </ProjectSection>

      <ProjectSection eyebrow={copy.floorPlansEyebrow} title={copy.floorPlansTitle}>
        <FloorPlans plans={project.floorPlans} />
      </ProjectSection>

      <ProjectSection id="units" eyebrow={copy.unitsEyebrow} title={copy.unitsTitle}>
        <UnitSelector units={project.units} projectSlug={project.slug} locale={locale} />
      </ProjectSection>

      {investmentEligible && project.investment && project.priceFromAed !== null ? (
        <ProjectSection id="investment" eyebrow={copy.investmentEyebrow} title={copy.investmentTitle}>
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

      <ProjectSection id="intelligence" eyebrow={copy.intelligenceEyebrow} title={copy.intelligenceTitle}>
        <KeyHoldIntelligence project={project} locale={locale} />
      </ProjectSection>

      <ProjectSection eyebrow={copy.documentsEyebrow} title={copy.documentsTitle}>
        <ProjectDocuments documents={project.documents} projectTitle={project.title} />
      </ProjectSection>

      <ProjectSection eyebrow={copy.regulatoryEyebrow} title={copy.regulatoryTitle}>
        <RegulatoryCard regulatory={project.regulatory} />
      </ProjectSection>

      {updates.length > 0 ? (
        <ProjectSection eyebrow={copy.updatesEyebrow} title={copy.updatesTitle}>
          <ConstructionTimeline updates={updates} />
        </ProjectSection>
      ) : null}

      {related.length > 0 ? (
        <section className="site-container border-t border-black/10 py-14 lg:py-20">
          <p className="eyebrow">{copy.related}</p>
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
            <p className="text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-champagne)]">{copy.availabilityEyebrow}</p>
            <h2 className="font-display mt-3 text-3xl">{copy.availabilityTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">{copy.availabilityBody}</p>
          </div>
          <Link href={`${localizedHref("/contact", locale)}?project=${encodeURIComponent(project.title)}`} className="button button-light mt-6 shrink-0 lg:mt-0">{copy.speakToAdvisor}</Link>
        </div>
      </section>
    </>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectDetailContent slug={slug} locale="en" />;
}
