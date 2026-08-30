import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { siteConfig } from "@/data/site";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Contact", title: "Start with the property decision you are trying to make.", description: "Buying, selling, renting or simply comparing options in Dubai? Start the conversation with KeyHold.", kicker: "KeyHold Dubai", heading: "A direct line to the advisory team.", email: "Email", location: "Location", body: "For property availability, investment questions, sales and rental enquiries, contact KeyHold directly and an advisor can continue the conversation with the relevant project context.", cta: "Explore Projects" },
  fr: { eyebrow: "Contact", title: "Parlez avec KeyHold.", description: "Achat, vente, location ou simple comparaison à Dubaï ? Démarrez la conversation avec KeyHold.", kicker: "KeyHold Dubaï", heading: "Une ligne directe avec l’équipe conseil.", email: "E-mail", location: "Localisation", body: "Pour toute question de disponibilité, d’investissement, de vente ou de location, contactez directement KeyHold : un conseiller poursuivra la conversation avec le contexte du projet concerné.", cta: "Explorer les projets" },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("contact", "/contact", { title: "Contact" }, "en");
}

export function ContactContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("contact", locale);
  const copy = COPY[locale];
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <section className="site-container grid gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="eyebrow">{copy.kicker}</p>
          <h2 className="font-display mt-4 max-w-xl text-4xl tracking-[-0.04em] sm:text-5xl">{copy.heading}</h2>
        </div>
        <div className="space-y-8 border-t border-black/10 pt-7">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.email}</p>
            <a className="mt-2 block text-xl hover:text-[var(--color-teal)]" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.location}</p>
            <p className="mt-2 text-xl">{siteConfig.location}</p>
          </div>
          <div className="border-t border-black/10 pt-7 text-sm leading-7 text-[var(--color-stone)]">
            {copy.body}
          </div>
          <Link href={localizedHref("/projects", locale)} className="button button-dark">{copy.cta}</Link>
        </div>
      </section>
    </>
  );
}

export default function ContactPage() {
  return <ContactContent locale="en" />;
}
