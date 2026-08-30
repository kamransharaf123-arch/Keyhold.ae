import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedServices } from "@/lib/i18n/localized-site";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Services", title: "Support around the full property journey.", description: "From selecting an opportunity to rental strategy and ongoing management, KeyHold is designed to stay useful beyond the transaction itself.", prompt: "Looking for something specific?", cta: "Speak with KeyHold" },
  fr: { eyebrow: "Services", title: "Un accompagnement sur l’ensemble du parcours immobilier.", description: "De la sélection d’une opportunité à la stratégie locative et à la gestion continue, KeyHold reste utile bien au-delà de la transaction.", prompt: "Vous cherchez quelque chose de précis ?", cta: "Parler avec KeyHold" },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("services", "/services", { title: "Services", description: "Explore KeyHold property acquisition, sales, investment, rental and management services in Dubai." }, "en");
}

export function ServicesContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("services", locale);
  const copy = COPY[locale];
  const services = localizedServices(locale);
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <section className="site-container py-16 lg:py-24">
        <div className="grid border-l border-t border-black/10 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <article key={service.title} className="min-h-72 border-b border-r border-black/10 p-7 sm:p-9">
              <div className="flex items-start justify-between">
                <span className="text-xs text-[var(--color-stone)]">0{index + 1}</span>
                <ArrowUpRightIcon className="size-5 text-[var(--color-champagne)]" />
              </div>
              <h2 className="font-display mt-14 text-3xl tracking-[-0.03em]">{service.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{service.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 text-sm text-[var(--color-stone)]">
          {copy.prompt} <Link href={localizedHref("/contact", locale)} className="text-link ml-1">{copy.cta}</Link>
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}

export default function ServicesPage() {
  return <ServicesContent locale="en" />;
}
