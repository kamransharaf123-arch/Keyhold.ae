import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Cookie Policy" description="How KeyHold approaches optional analytics, marketing and essential website technologies." />
      <article className="site-container max-w-4xl py-16 text-sm leading-8 text-[var(--color-stone)] lg:py-24">
        <h2 className="mb-3 text-base font-medium text-[var(--color-graphite)]">Current website setup</h2>
        <p>The current public website does not require marketing or analytics cookies to provide its core browsing experience. If analytics, CRM, advertising or personalisation services are enabled, this policy and the site’s consent controls should reflect the technologies actually in use.</p>
        <h2 className="mb-3 mt-9 text-base font-medium text-[var(--color-graphite)]">Consent controls</h2>
        <p>Where required, KeyHold should provide clear controls for optional analytics, advertising and personalisation technologies while preserving strictly necessary functionality.</p>
      </article>
    </>
  );
}
