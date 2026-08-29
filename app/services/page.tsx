import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { services } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore KeyHold property acquisition, sales, investment, rental and management services in Dubai.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Support around the full property journey."
        description="From selecting an opportunity to rental strategy and ongoing management, KeyHold is designed to stay useful beyond the transaction itself."
      />
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
          Looking for something specific? <Link href="/contact" className="text-link ml-1">Speak with KeyHold</Link>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
