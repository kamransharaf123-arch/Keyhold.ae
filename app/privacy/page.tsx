import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="A clear foundation for how KeyHold handles personal information on the public website." />
      <article className="site-container max-w-4xl py-16 text-sm leading-8 text-[var(--color-stone)] lg:py-24">
        <LegalSection title="1. Information we collect">KeyHold may collect information you choose to provide when you contact us, request property information or use future account features. This may include your name, email address, telephone number, property interests and enquiry details.</LegalSection>
        <LegalSection title="2. How information is used">Information may be used to respond to enquiries, provide requested property information, improve our services, maintain security and meet applicable legal or regulatory obligations.</LegalSection>
        <LegalSection title="3. Service providers">Where necessary, information may be processed by service providers that support hosting, communications, analytics, customer relationship management or other operational functions, subject to appropriate safeguards.</LegalSection>
        <LegalSection title="4. Retention and rights">Personal information should be retained only for as long as reasonably necessary for the relevant purpose or as required by applicable law. Requests relating to personal information can be directed to the contact below.</LegalSection>
        <LegalSection title="5. Contact">For privacy-related questions, contact <a className="text-[var(--color-graphite)] underline underline-offset-4" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</LegalSection>
        <p className="mt-12 border-t border-black/10 pt-6 text-xs leading-6">Before production launch, legal counsel should review this policy against KeyHold’s final UAE corporate structure, data flows and connected services.</p>
      </article>
    </>
  );
}

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-9"><h2 className="mb-3 text-base font-medium text-[var(--color-graphite)]">{title}</h2><p>{children}</p></section>;
}
