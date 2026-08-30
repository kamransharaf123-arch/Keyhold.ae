import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { HomeSection } from "@/components/home/home-sections";
import { ProjectCard } from "@/components/project-card";
import { QuickDiscovery } from "@/components/discovery/quick-discovery";
import { SectionHeading } from "@/components/section-heading";
import { UpdateCard } from "@/components/update-card";
import { websitePageByKey, websiteSections } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedFeaturedProjects, localizedInsights, localizedServices, localizedUpdates } from "@/lib/i18n/localized-site";
import type { KeyHoldLocale } from "@/types/localization";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("home", "/", {}, "en");
}

const HERO_COPY = {
  en: {
    eyebrow: "Dubai real estate · Curated advisory",
    title: "Property decisions, considered properly.",
    subtitle: "Explore off-plan, ready and rental opportunities through a refined Dubai property experience built around clarity, context and long-term value.",
    primaryCta: "Explore Projects",
    secondaryCta: "Speak with an Advisor",
  },
  fr: {
    eyebrow: "Immobilier à Dubaï · Conseil sélectionné",
    title: "Découvrez votre place à Dubaï.",
    subtitle: "Des biens sélectionnés, une analyse intelligente et un accompagnement privé pour de meilleures décisions immobilières.",
    primaryCta: "Explorer les projets",
    secondaryCta: "Parler à un conseiller",
  },
};

const TRUST_STRIP = {
  en: [
    ["Dubai focused", "A focused platform for property across the UAE’s most active real estate market."],
    ["Investment minded", "Property presentation designed around decisions, not just listings."],
    ["End-to-end", "From discovery and acquisition to rentals, management and future client tools."],
  ],
  fr: [
    ["Focalisé sur Dubaï", "Une plateforme dédiée à l’immobilier sur le marché le plus actif des Émirats."],
    ["Orienté investissement", "Une présentation pensée pour la décision, pas seulement pour l’annonce."],
    ["De bout en bout", "De la découverte à l’acquisition, jusqu’à la location, la gestion et les futurs outils client."],
  ],
} as const;

const EXPLORE_HEADING = {
  en: { eyebrow: "Explore", title: "One destination, four ways to move.", description: "A simple public structure designed to remain clear even as the KeyHold platform grows in depth." },
  fr: { eyebrow: "Explorer", title: "Une destination, quatre façons d’avancer.", description: "Une structure publique simple, conçue pour rester claire à mesure que la plateforme KeyHold gagne en profondeur." },
};

const PROPERTY_TYPES = {
  en: [
    { title: "Off-Plan", href: "/projects/off-plan", text: "New launches and projects under development." },
    { title: "Ready", href: "/projects/ready", text: "Completed homes for occupation or investment." },
    { title: "Short-Term", href: "/projects/short-term-rentals", text: "Flexible stays and holiday-home opportunities." },
    { title: "Long-Term", href: "/projects/long-term-rentals", text: "Annual rental opportunities across Dubai." },
  ],
  fr: [
    { title: "Sur plan", href: "/projects/off-plan", text: "Nouveaux lancements et projets en cours de construction." },
    { title: "Prêt", href: "/projects/ready", text: "Biens achevés pour y vivre ou investir." },
    { title: "Courte durée", href: "/projects/short-term-rentals", text: "Séjours flexibles et opportunités de location saisonnière." },
    { title: "Longue durée", href: "/projects/long-term-rentals", text: "Opportunités de location annuelle à Dubaï." },
  ],
};

const APPROACH = {
  en: {
    eyebrow: "KeyHold approach",
    title: "More context. Less noise.",
    items: [
      ["Curated", "The platform is designed to prioritise relevant opportunities over endless inventory."],
      ["Transparent", "Availability, assumptions and project information will carry clear source and freshness signals."],
      ["Analytical", "Investment analysis should look beyond headline pricing to cash timing, costs, risk, comparables and exit strategy."],
      ["Long-term", "The relationship continues beyond purchase through updates, portfolio tools and after-sales services."],
    ],
  },
  fr: {
    eyebrow: "Approche KeyHold",
    title: "Plus de contexte. Moins de bruit.",
    items: [
      ["Sélectif", "La plateforme est pensée pour privilégier les opportunités pertinentes plutôt qu’un inventaire sans fin."],
      ["Transparent", "Disponibilité, hypothèses et informations projet porteront des signaux clairs de source et de fraîcheur."],
      ["Analytique", "L’analyse d’investissement doit dépasser le prix affiché pour couvrir le calendrier des paiements, les coûts, le risque, les comparables et la stratégie de sortie."],
      ["Long terme", "La relation se poursuit après l’achat via les mises à jour, les outils de portefeuille et les services après-vente."],
    ],
  },
} as const;

const SECTION_HEADINGS = {
  featured: { en: { eyebrow: "Featured opportunities", title: "A considered selection across Dubai.", description: "Selected opportunities presented with clear context, considered positioning and a direct route to current availability.", link: "View all projects" }, fr: { eyebrow: "Opportunités en vedette", title: "Une sélection réfléchie à travers Dubaï.", description: "Des opportunités sélectionnées, présentées avec un contexte clair et un accès direct à la disponibilité actuelle.", link: "Voir tous les projets" } },
  updates: { en: { eyebrow: "Construction updates", title: "See how projects are progressing.", description: "Updates are designed as a recurring reason for owners and investors to return to KeyHold.", link: "View all updates" }, fr: { eyebrow: "Avancement de construction", title: "Suivez l’avancement des projets.", description: "Les mises à jour donnent aux propriétaires et investisseurs une raison régulière de revenir sur KeyHold.", link: "Voir toutes les mises à jour" } },
  insights: { en: { eyebrow: "Insights", title: "Built for better property decisions.", description: "Guides, market thinking and practical explanations that help clients understand what sits behind a headline price.", link: "Explore insights" }, fr: { eyebrow: "Analyses", title: "Conçu pour de meilleures décisions immobilières.", description: "Guides, analyses de marché et explications pratiques pour comprendre ce qui se cache derrière un prix affiché.", link: "Explorer les analyses" } },
  services: { en: { eyebrow: "Services", title: "Property support before, during and after the transaction.", link: "All services" }, fr: { eyebrow: "Services", title: "Un accompagnement avant, pendant et après la transaction.", link: "Tous les services" } },
} as const;

function FallbackHomeSections({ locale }: { locale: KeyHoldLocale }) {
  const trustStrip = TRUST_STRIP[locale];
  const explore = EXPLORE_HEADING[locale];
  const propertyTypes = PROPERTY_TYPES[locale];
  const approach = APPROACH[locale];
  const featuredProjects = localizedFeaturedProjects(locale);
  const updates = localizedUpdates(locale);
  const insights = localizedInsights(locale);
  const services = localizedServices(locale);

  return (
    <>
      <section className="border-b border-black/[0.07] bg-[var(--color-teal-soft)]">
        <div className="site-container grid divide-y divide-black/10 py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {trustStrip.map(([title, text]) => (
            <div key={title} className="py-6 sm:px-7 sm:first:pl-0 sm:last:pr-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-teal-deep)]">{title}</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-stone)]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-container py-20 lg:py-28">
        <SectionHeading eyebrow={SECTION_HEADINGS.featured[locale].eyebrow} title={SECTION_HEADINGS.featured[locale].title} description={SECTION_HEADINGS.featured[locale].description} href={localizedHref("/projects", locale)} linkLabel={SECTION_HEADINGS.featured[locale].link} />
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {featuredProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </section>

      <section className="bg-[var(--color-sand)]">
        <div className="site-container py-20 lg:py-28">
          <SectionHeading eyebrow={explore.eyebrow} title={explore.title} description={explore.description} />
          <div className="grid border-l border-t border-black/10 sm:grid-cols-2 xl:grid-cols-4">
            {propertyTypes.map((item, index) => (
              <Link key={item.title} href={localizedHref(item.href, locale)} className="group min-h-64 border-b border-r border-black/10 p-7 transition-colors hover:bg-[var(--color-teal-soft)]">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs text-[var(--color-stone)]">0{index + 1}</span>
                  <ArrowUpRightIcon className="size-5 text-[var(--color-teal)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <h3 className="font-display mt-16 text-3xl tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-stone)]">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-20 lg:py-28">
        <SectionHeading eyebrow={SECTION_HEADINGS.updates[locale].eyebrow} title={SECTION_HEADINGS.updates[locale].title} description={SECTION_HEADINGS.updates[locale].description} href={localizedHref("/updates", locale)} linkLabel={SECTION_HEADINGS.updates[locale].link} />
        <div>{updates.slice(0, 3).map((update) => <UpdateCard key={update.slug} update={update} />)}</div>
      </section>

      <section className="bg-[var(--color-charcoal)] text-[var(--color-bone)]">
        <div className="site-container py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#dbc79f]">{approach.eyebrow}</p>
              <h2 className="font-display mt-4 text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl">{approach.title}</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {approach.items.map(([title, text]) => (
                <div key={title} className="border-t border-white/[0.16] pt-5">
                  <h3 className="text-lg font-medium">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/[0.58]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-20 lg:py-28">
        <SectionHeading eyebrow={SECTION_HEADINGS.insights[locale].eyebrow} title={SECTION_HEADINGS.insights[locale].title} description={SECTION_HEADINGS.insights[locale].description} href={localizedHref("/insights", locale)} linkLabel={SECTION_HEADINGS.insights[locale].link} />
        <div className="grid gap-6 lg:grid-cols-3">
          {insights.map((item) => (
            <article key={item.slug} className="group border-t border-black/[0.12] pt-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-champagne-ink)]">{item.category}</p>
              <h3 className="font-display mt-5 text-3xl leading-tight tracking-[-0.03em]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{item.excerpt}</p>
              <Link href={localizedHref("/insights", locale)} className="text-link mt-7 inline-flex items-center gap-2">
                {locale === "fr" ? "Lire l’analyse" : "Read insight"} <ArrowRightIcon className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/[0.08] bg-[var(--color-champagne-soft)]">
        <div className="site-container py-20 lg:py-28">
          <SectionHeading eyebrow={SECTION_HEADINGS.services[locale].eyebrow} title={SECTION_HEADINGS.services[locale].title} href={localizedHref("/services", locale)} linkLabel={SECTION_HEADINGS.services[locale].link} />
          <div className="grid gap-x-8 gap-y-0 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <div key={service.title} className="border-t border-black/10 py-7">
                <div className="flex gap-5">
                  <span className="mt-1 text-xs text-[var(--color-stone)]">0{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-medium">{service.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--color-stone)]">{service.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand locale={locale} />
    </>
  );
}

export function HomeContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("home", locale);
  const sections = websiteSections("home", locale);
  const hero = HERO_COPY[locale];

  const heroEyebrow = page?.eyebrow || hero.eyebrow;
  const heroTitle = page?.heroTitle || hero.title;
  const heroSubtitle = page?.heroSubtitle || hero.subtitle;
  const heroImage = page?.heroImageUrl || "/images/hero-dubai.svg";
  const heroImageAlt = page?.heroImageAlt || "Abstract architectural view inspired by Dubai";
  const primaryCtaLabel = page?.primaryCtaLabel || hero.primaryCta;
  const primaryCtaHref = page?.primaryCtaHref || "/projects";
  const secondaryCtaLabel = page?.secondaryCtaLabel || hero.secondaryCta;
  const secondaryCtaHref = page?.secondaryCtaHref || "/contact";

  return (
    <>
      <section className="relative min-h-[78svh] overflow-hidden bg-[var(--color-charcoal)] text-[var(--color-bone)]">
        <Image
          src={heroImage}
          alt={heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,52,49,0.82),rgba(35,67,63,0.34)_64%,rgba(35,67,63,0.08))]" />
        <div className="site-container relative flex min-h-[78svh] items-end py-14 sm:py-[4.5rem] lg:py-20">
          <div className="max-w-5xl">
            <p className="animate-rise text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#eadfc9]">
              {heroEyebrow}
            </p>
            <h1 className="font-display mt-5 max-w-4xl animate-rise text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[6.4rem]">
              {heroTitle}
            </h1>
            <p className="mt-7 max-w-xl animate-rise text-base leading-8 text-white/[0.74] sm:text-lg">
              {heroSubtitle}
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3">
              <Link href={localizedHref(primaryCtaHref, locale)} className="button button-light">
                {primaryCtaLabel}
              </Link>
              <Link href={localizedHref(secondaryCtaHref, locale)} className="button button-outline-light inline-flex items-center gap-2">
                {secondaryCtaLabel}
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <QuickDiscovery locale={locale} />

      {sections.length > 0
        ? sections.map((section) => <HomeSection key={section.id} section={section} locale={locale} />)
        : <FallbackHomeSections locale={locale} />}
    </>
  );
}

export default function HomePage() {
  return <HomeContent locale="en" />;
}
