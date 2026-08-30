import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { ProjectCard } from "@/components/project-card";
import { QuickDiscovery } from "@/components/discovery/quick-discovery";
import { SectionHeading } from "@/components/section-heading";
import { UpdateCard } from "@/components/update-card";
import { featuredProjects, insights, services, updates } from "@/data/site";

const propertyTypes = [
  { title: "Off-Plan", href: "/projects/off-plan", text: "New launches and projects under development." },
  { title: "Ready", href: "/projects/ready", text: "Completed homes for occupation or investment." },
  { title: "Short-Term", href: "/projects/short-term-rentals", text: "Flexible stays and holiday-home opportunities." },
  { title: "Long-Term", href: "/projects/long-term-rentals", text: "Annual rental opportunities across Dubai." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[78svh] overflow-hidden bg-[var(--color-graphite)] text-[var(--color-bone)]">
        <Image
          src="/images/hero-dubai.svg"
          alt="Abstract architectural view inspired by Dubai"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,17,0.72),rgba(17,17,17,0.18)_68%,rgba(17,17,17,0.06))]" />
        <div className="site-container relative flex min-h-[78svh] items-end py-14 sm:py-[4.5rem] lg:py-20">
          <div className="max-w-5xl">
            <p className="animate-rise text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#d6bd93]">
              Dubai real estate · Curated advisory
            </p>
            <h1 className="font-display mt-5 max-w-4xl animate-rise text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[6.4rem]">
              Property decisions, considered properly.
            </h1>
            <p className="mt-7 max-w-xl animate-rise text-base leading-8 text-white/[0.74] sm:text-lg">
              Explore off-plan, ready and rental opportunities through a refined Dubai property experience built around clarity, context and long-term value.
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3">
              <Link href="/projects" className="button button-light">
                Explore Projects
              </Link>
              <Link href="/contact" className="button button-outline-light inline-flex items-center gap-2">
                Speak with an Advisor
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <QuickDiscovery />

      <section className="border-b border-black/[0.08] bg-[var(--color-bone)]">
        <div className="site-container grid divide-y divide-black/10 py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Dubai focused", "A focused platform for property across the UAE’s most active real estate market."],
            ["Investment minded", "Property presentation designed around decisions, not just listings."],
            ["End-to-end", "From discovery and acquisition to rentals, management and future client tools."],
          ].map(([title, text]) => (
            <div key={title} className="py-6 sm:px-7 sm:first:pl-0 sm:last:pr-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-graphite)]">{title}</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-stone)]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-container py-20 lg:py-28">
        <SectionHeading
          eyebrow="Featured opportunities"
          title="A considered selection across Dubai."
          description="Selected opportunities presented with clear context, considered positioning and a direct route to current availability."
          href="/projects"
          linkLabel="View all projects"
        />
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {featuredProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </section>

      <section className="bg-[var(--color-bone)]">
        <div className="site-container py-20 lg:py-28">
          <SectionHeading
            eyebrow="Explore"
            title="One destination, four ways to move."
            description="A simple public structure designed to remain clear even as the KeyHold platform grows in depth."
          />
          <div className="grid border-l border-t border-black/10 sm:grid-cols-2 xl:grid-cols-4">
            {propertyTypes.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="group min-h-64 border-b border-r border-black/10 p-7 transition-colors hover:bg-[var(--color-soft-white)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs text-[var(--color-stone)]">0{index + 1}</span>
                  <ArrowUpRightIcon className="size-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <h3 className="font-display mt-16 text-3xl tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-stone)]">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-20 lg:py-28">
        <SectionHeading
          eyebrow="Construction updates"
          title="See how projects are progressing."
          description="Updates are designed as a recurring reason for owners and investors to return to KeyHold."
          href="/updates"
          linkLabel="View all updates"
        />
        <div>{updates.slice(0, 3).map((update) => <UpdateCard key={update.slug} update={update} />)}</div>
      </section>

      <section className="bg-[var(--color-graphite)] text-[var(--color-bone)]">
        <div className="site-container py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-champagne)]">KeyHold approach</p>
              <h2 className="font-display mt-4 text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl">
                More context. Less noise.
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {[
                ["Curated", "The platform is designed to prioritise relevant opportunities over endless inventory."],
                ["Transparent", "Availability, assumptions and project information will carry clear source and freshness signals."],
                ["Analytical", "Investment analysis should look beyond headline pricing to cash timing, costs, risk, comparables and exit strategy."],
                ["Long-term", "The relationship continues beyond purchase through updates, portfolio tools and after-sales services."],
              ].map(([title, text]) => (
                <div key={title} className="border-t border-white/[0.16] pt-5">
                  <h3 className="text-lg font-medium">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/[0.58]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-20 lg:py-28">
        <SectionHeading
          eyebrow="Insights"
          title="Built for better property decisions."
          description="Guides, market thinking and practical explanations that help clients understand what sits behind a headline price."
          href="/insights"
          linkLabel="Explore insights"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {insights.map((item) => (
            <article key={item.slug} className="group border-t border-black/[0.12] pt-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-champagne)]">{item.category}</p>
              <h3 className="font-display mt-5 text-3xl leading-tight tracking-[-0.03em]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{item.excerpt}</p>
              <Link href="/insights" className="text-link mt-7 inline-flex items-center gap-2">
                Read insight <ArrowRightIcon className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/[0.08] bg-[var(--color-bone)]">
        <div className="site-container py-20 lg:py-28">
          <SectionHeading eyebrow="Services" title="Property support before, during and after the transaction." href="/services" linkLabel="All services" />
          <div className="grid gap-x-8 gap-y-0 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <div key={service.title} className="border-t border-black/10 py-7">
                <div className="flex gap-5">
                  <span className="mt-1 text-xs text-[var(--color-stone)]">0{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-medium">{service.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--color-stone)]">{service.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
