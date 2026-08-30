import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    eyebrow: "Legal", title: "Terms & Conditions", description: "The baseline terms governing use of the KeyHold public website.",
    sections: [
      ["1. Website information", "Information on KeyHold is provided for general information and property discovery. Property availability, pricing, incentives, payment plans, areas, specifications and completion dates may change and must be confirmed with the relevant developer, owner or authorised seller."],
      ["2. Investment information", "Any yield, return, appreciation, financing or cost figures presented by KeyHold are estimates based on stated assumptions. They are not guarantees of future performance and should not be treated as financial, tax or legal advice."],
      ["3. Third-party information", "Project materials and other information may originate from developers, owners, public authorities or other third parties. KeyHold should identify sources and freshness where practical, but users should independently verify material information before entering into a transaction."],
      ["4. Intellectual property", "Unless otherwise stated, the KeyHold brand, website design and original editorial content may not be reproduced or commercially reused without permission."],
      ["5. Updates", "These terms may be updated as the platform gains additional functionality, accounts, calculators, transaction tools and connected services."],
    ],
    note: "This baseline must be reviewed by UAE legal counsel before production launch.",
  },
  fr: {
    eyebrow: "Mentions légales", title: "Conditions générales", description: "Les conditions de base régissant l’utilisation du site public KeyHold.",
    sections: [
      ["1. Website information", "Information on KeyHold is provided for general information and property discovery. Property availability, pricing, incentives, payment plans, areas, specifications and completion dates may change and must be confirmed with the relevant developer, owner or authorised seller."],
      ["2. Investment information", "Any yield, return, appreciation, financing or cost figures presented by KeyHold are estimates based on stated assumptions. They are not guarantees of future performance and should not be treated as financial, tax or legal advice."],
      ["3. Third-party information", "Project materials and other information may originate from developers, owners, public authorities or other third parties. KeyHold should identify sources and freshness where practical, but users should independently verify material information before entering into a transaction."],
      ["4. Intellectual property", "Unless otherwise stated, the KeyHold brand, website design and original editorial content may not be reproduced or commercially reused without permission."],
      ["5. Updates", "These terms may be updated as the platform gains additional functionality, accounts, calculators, transaction tools and connected services."],
    ],
    note: "Ce texte doit être révisé par un conseil juridique aux Émirats arabes unis avant le lancement en production. (Traduction française en attente de révision légale.)",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("terms", "/terms", { title: "Terms & Conditions" }, "en");
}

export function TermsContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("terms", locale);
  const copy = COPY[locale];
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <article className="site-container max-w-4xl py-16 text-sm leading-8 text-[var(--color-stone)] lg:py-24">
        {copy.sections.map(([title, body]) => <LegalSection key={title} title={title}>{body}</LegalSection>)}
        <p className="mt-12 border-t border-black/10 pt-6 text-xs leading-6">{copy.note}</p>
      </article>
    </>
  );
}

export default function TermsPage() {
  return <TermsContent locale="en" />;
}

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-9"><h2 className="mb-3 text-base font-medium text-[var(--color-graphite)]">{title}</h2><p>{children}</p></section>;
}
