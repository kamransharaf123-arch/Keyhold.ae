import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Start with the property decision you are trying to make." description="Buying, selling, renting or simply comparing options in Dubai? Start the conversation with KeyHold." />
      <section className="site-container grid gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="eyebrow">KeyHold Dubai</p>
          <h2 className="font-display mt-4 max-w-xl text-4xl tracking-[-0.04em] sm:text-5xl">A direct line to the advisory team.</h2>
        </div>
        <div className="space-y-8 border-t border-black/10 pt-7">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-stone)]">Email</p>
            <a className="mt-2 block text-xl hover:text-[var(--color-teal)]" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-stone)]">Location</p>
            <p className="mt-2 text-xl">{siteConfig.location}</p>
          </div>
          <div className="border-t border-black/10 pt-7 text-sm leading-7 text-[var(--color-stone)]">
            For property availability, investment questions, sales and rental enquiries, contact KeyHold directly and an advisor can continue the conversation with the relevant project context.
          </div>
          <Link href="/projects" className="button button-dark">Explore Projects</Link>
        </div>
      </section>
    </>
  );
}
