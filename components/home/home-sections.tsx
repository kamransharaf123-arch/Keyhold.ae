import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { UpdateCard } from "@/components/update-card";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedFeaturedProjects, localizedInsights, localizedProjectCatalog, localizedServices, localizedUpdates } from "@/lib/i18n/localized-site";
import type { KeyHoldLocale } from "@/types/localization";
import type { WebsiteSection } from "@/types/website-cms";

type PayloadItem = { title: string; text: string; href?: string };

function itemsFromPayload(section: WebsiteSection): PayloadItem[] {
  const raw = (section.payload as { items?: unknown } | undefined)?.items;
  return Array.isArray(raw)
    ? raw.filter((item): item is PayloadItem => typeof item === "object" && item !== null && typeof (item as PayloadItem).title === "string")
    : [];
}

function payloadNumber(section: WebsiteSection, key: string, fallback: number): number {
  const value = (section.payload as Record<string, unknown> | undefined)?.[key];
  return typeof value === "number" ? value : fallback;
}

function payloadString(section: WebsiteSection, key: string): string | undefined {
  const value = (section.payload as Record<string, unknown> | undefined)?.[key];
  return typeof value === "string" && value ? value : undefined;
}

export function HomeSection({ section, locale }: { section: WebsiteSection; locale: KeyHoldLocale }) {
  switch (section.sectionType) {
    case "trust-strip": {
      const items = itemsFromPayload(section);
      if (items.length === 0) return null;
      return (
        <section className="border-b border-black/[0.07] bg-[var(--color-teal-soft)]">
          <div className="site-container grid divide-y divide-black/10 py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {items.map((item) => (
              <div key={item.title} className="py-6 sm:px-7 sm:first:pl-0 sm:last:pr-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-teal-deep)]">{item.title}</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-stone)]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "project-grid": {
      const slugs = (section.payload as { projectSlugs?: unknown } | undefined)?.projectSlugs;
      const limit = payloadNumber(section, "limit", 6);
      const linkLabel = payloadString(section, "linkLabel");
      const catalog = localizedProjectCatalog(locale);
      const chosen = Array.isArray(slugs) && slugs.length ? catalog.filter((p) => (slugs as string[]).includes(p.slug)) : localizedFeaturedProjects(locale);
      const projects = chosen.slice(0, limit);
      if (projects.length === 0) return null;
      return (
        <section className="site-container py-20 lg:py-28">
          <SectionHeading eyebrow={section.eyebrow} title={section.title || ""} description={section.body} href={linkLabel ? localizedHref("/projects", locale) : undefined} linkLabel={linkLabel} />
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
        </section>
      );
    }
    case "link-grid": {
      const items = (section.payload as { items?: unknown } | undefined)?.items;
      const cards = Array.isArray(items) ? (items as Array<{ title: string; href: string; text: string }>) : [];
      if (cards.length === 0) return null;
      const wrapClass = section.styleVariant === "soft-teal" ? "bg-[var(--color-sand)]" : section.styleVariant === "dark" ? "bg-[var(--color-charcoal)] text-[var(--color-bone)]" : "";
      return (
        <section className={wrapClass}>
          <div className="site-container py-20 lg:py-28">
            <SectionHeading eyebrow={section.eyebrow} title={section.title || ""} description={section.body} />
            <div className="grid border-l border-t border-black/10 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((item, index) => (
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
      );
    }
    case "updates-grid": {
      const limit = payloadNumber(section, "limit", 3);
      const linkLabel = payloadString(section, "linkLabel");
      const updates = localizedUpdates(locale).slice(0, limit);
      if (updates.length === 0) return null;
      return (
        <section className="site-container py-20 lg:py-28">
          <SectionHeading eyebrow={section.eyebrow} title={section.title || ""} description={section.body} href={linkLabel ? localizedHref("/updates", locale) : undefined} linkLabel={linkLabel} />
          <div>{updates.map((update) => <UpdateCard key={update.slug} update={update} />)}</div>
        </section>
      );
    }
    case "feature": {
      const items = itemsFromPayload(section);
      return (
        <section className="bg-[var(--color-charcoal)] text-[var(--color-bone)]">
          <div className="site-container py-20 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#dbc79f]">{section.eyebrow}</p>
                <h2 className="font-display mt-4 text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl">{section.title}</h2>
              </div>
              {items.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2">
                  {items.map((item) => (
                    <div key={item.title} className="border-t border-white/[0.16] pt-5">
                      <h3 className="text-lg font-medium">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/[0.58]">{item.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }
    case "insights-grid": {
      const limit = payloadNumber(section, "limit", 3);
      const linkLabel = payloadString(section, "linkLabel");
      const insights = localizedInsights(locale).slice(0, limit);
      if (insights.length === 0) return null;
      return (
        <section className="site-container py-20 lg:py-28">
          <SectionHeading eyebrow={section.eyebrow} title={section.title || ""} description={section.body} href={linkLabel ? localizedHref("/insights", locale) : undefined} linkLabel={linkLabel} />
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
      );
    }
    case "services-grid": {
      const limit = payloadNumber(section, "limit", 6);
      const linkLabel = payloadString(section, "linkLabel");
      const services = localizedServices(locale).slice(0, limit);
      if (services.length === 0) return null;
      return (
        <section className="border-y border-black/[0.08] bg-[var(--color-champagne-soft)]">
          <div className="site-container py-20 lg:py-28">
            <SectionHeading eyebrow={section.eyebrow} title={section.title || ""} description={section.body} href={linkLabel ? localizedHref("/services", locale) : undefined} linkLabel={linkLabel} />
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
      );
    }
    case "global-cta":
      return <CtaBand locale={locale} />;
    default:
      return null;
  }
}
