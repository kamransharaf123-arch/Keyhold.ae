import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { siteConfig } from "@/data/site";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    eyebrow: "Legal", title: "Privacy Policy", description: "A clear foundation for how KeyHold handles personal information on the public website.",
    sections: [
      ["1. Information we collect", "KeyHold may collect information you choose to provide when you contact us, request property information or use future account features. This may include your name, email address, telephone number, property interests and enquiry details."],
      ["2. How information is used", "Information may be used to respond to enquiries, provide requested property information, improve our services, maintain security and meet applicable legal or regulatory obligations."],
      ["3. Service providers", "Where necessary, information may be processed by service providers that support hosting, communications, analytics, customer relationship management or other operational functions, subject to appropriate safeguards."],
      ["4. Retention and rights", "Personal information should be retained only for as long as reasonably necessary for the relevant purpose or as required by applicable law. Requests relating to personal information can be directed to the contact below."],
    ],
    contactTitle: "5. Contact",
    contactPrefix: "For privacy-related questions, contact",
    note: "Before production launch, legal counsel should review this policy against KeyHold’s final UAE corporate structure, data flows and connected services.",
  },
  fr: {
    eyebrow: "Mentions légales", title: "Politique de confidentialité", description: "Une base claire sur la manière dont KeyHold traite les informations personnelles sur le site public.",
    sections: [
      ["1. Information we collect", "KeyHold may collect information you choose to provide when you contact us, request property information or use future account features. This may include your name, email address, telephone number, property interests and enquiry details."],
      ["2. How information is used", "Information may be used to respond to enquiries, provide requested property information, improve our services, maintain security and meet applicable legal or regulatory obligations."],
      ["3. Service providers", "Where necessary, information may be processed by service providers that support hosting, communications, analytics, customer relationship management or other operational functions, subject to appropriate safeguards."],
      ["4. Retention and rights", "Personal information should be retained only for as long as reasonably necessary for the relevant purpose or as required by applicable law. Requests relating to personal information can be directed to the contact below."],
    ],
    contactTitle: "5. Contact",
    contactPrefix: "Pour toute question relative à la confidentialité, contactez",
    note: "Avant le lancement en production, cette politique doit être révisée par un conseil juridique aux Émirats arabes unis. (Traduction française en attente de révision légale.)",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("privacy", "/privacy", { title: "Privacy Policy" }, "en");
}

export function PrivacyContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("privacy", locale);
  const copy = COPY[locale];
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <article className="site-container max-w-4xl py-16 text-sm leading-8 text-[var(--color-stone)] lg:py-24">
        {copy.sections.map(([title, body]) => <LegalSection key={title} title={title}>{body}</LegalSection>)}
        <LegalSection title={copy.contactTitle}>{copy.contactPrefix} <a className="text-[var(--color-graphite)] underline underline-offset-4" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</LegalSection>
        <p className="mt-12 border-t border-black/10 pt-6 text-xs leading-6">{copy.note}</p>
      </article>
    </>
  );
}

export default function PrivacyPage() {
  return <PrivacyContent locale="en" />;
}

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-9"><h2 className="mb-3 text-base font-medium text-[var(--color-graphite)]">{title}</h2><p>{children}</p></section>;
}
