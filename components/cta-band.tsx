import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";

export function CtaBand() {
  return (
    <section className="bg-[var(--color-charcoal)] text-[var(--color-bone)]">
      <div className="site-container grid gap-10 py-16 md:grid-cols-[1fr_auto] md:items-end lg:py-20">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#dbc79f]">Private property advisory</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            Find your place in Dubai.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/projects" className="button button-light">
            Explore Projects
          </Link>
          <Link href="/contact" className="button button-outline-light inline-flex items-center gap-2">
            Speak with an Advisor
            <ArrowUpRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
