import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" description="The baseline terms governing use of the KeyHold public website." />
      <article className="site-container max-w-4xl py-16 text-sm leading-8 text-[var(--color-stone)] lg:py-24">
        <LegalSection title="1. Website information">Information on KeyHold is provided for general information and property discovery. Property availability, pricing, incentives, payment plans, areas, specifications and completion dates may change and must be confirmed with the relevant developer, owner or authorised seller.</LegalSection>
        <LegalSection title="2. Investment information">Any yield, return, appreciation, financing or cost figures presented by KeyHold are estimates based on stated assumptions. They are not guarantees of future performance and should not be treated as financial, tax or legal advice.</LegalSection>
        <LegalSection title="3. Third-party information">Project materials and other information may originate from developers, owners, public authorities or other third parties. KeyHold should identify sources and freshness where practical, but users should independently verify material information before entering into a transaction.</LegalSection>
        <LegalSection title="4. Intellectual property">Unless otherwise stated, the KeyHold brand, website design and original editorial content may not be reproduced or commercially reused without permission.</LegalSection>
        <LegalSection title="5. Updates">These terms may be updated as the platform gains additional functionality, accounts, calculators, transaction tools and connected services.</LegalSection>
        <p className="mt-12 border-t border-black/10 pt-6 text-xs leading-6">This baseline must be reviewed by UAE legal counsel before production launch.</p>
      </article>
    </>
  );
}

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-9"><h2 className="mb-3 text-base font-medium text-[var(--color-graphite)]">{title}</h2><p>{children}</p></section>;
}
