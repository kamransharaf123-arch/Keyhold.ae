import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { featuredProjects, insights, projectNav, services, siteConfig } from "@/data/site";

const companyLinks = [
  { label: "Who We Are", href: "/who-we-are" },
  { label: "Developers", href: "/developers" },
  { label: "Areas", href: "/areas" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  const hasGoogleReviews =
    siteConfig.googleReviews.rating !== null && Boolean(siteConfig.googleReviews.href);

  return (
    <footer className="border-t border-black/[0.08] bg-[var(--color-soft-white)]">
      <div className="site-container py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <FooterHeading>Projects & Properties</FooterHeading>
            <FooterList>
              {projectNav.map((item) => (
                <FooterLink key={item.href} href={item.href}>{item.label}</FooterLink>
              ))}
              {featuredProjects.slice(0, 3).map((project) => (
                <FooterLink key={project.slug} href={`/projects/${project.slug}`}>{project.title}</FooterLink>
              ))}
              <FooterLink href="/discover">Smart Property Discovery</FooterLink>
              <FooterLink href="/projects">View All Projects</FooterLink>
            </FooterList>
          </div>
          <div>
            <FooterHeading>Guides & Insights</FooterHeading>
            <FooterList>
              {insights.map((item) => (
                <FooterLink key={item.slug} href="/insights">{item.category}</FooterLink>
              ))}
              <FooterLink href="/updates">Construction Updates</FooterLink>
              <FooterLink href="/investment-calculator">Investment Calculator</FooterLink>
              <FooterLink href="/areas">Dubai Areas</FooterLink>
            </FooterList>
          </div>
          <div>
            <FooterHeading>Services</FooterHeading>
            <FooterList>
              {services.slice(0, 6).map((service) => (
                <FooterLink key={service.title} href="/services">{service.title}</FooterLink>
              ))}
            </FooterList>
          </div>
          <div>
            <FooterHeading>Who We Are</FooterHeading>
            <FooterList>
              {companyLinks.map((item) => (
                <FooterLink key={item.href} href={item.href}>{item.label}</FooterLink>
              ))}
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
            </FooterList>
          </div>
        </div>

        <div className="mt-16 border-t border-black/10 pt-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr]">
            <div>
              <Logo />
              <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--color-stone)]">
                Dubai real estate advisory for off-plan, ready properties and rental opportunities, presented with clarity and considered guidance.
              </p>
              {siteConfig.socials.length > 0 || hasGoogleReviews ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {siteConfig.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center border border-black/10 px-3 text-xs text-[var(--color-stone)] transition-colors hover:border-black/20 hover:text-[var(--color-graphite)]"
                    >
                      {social.label}
                    </a>
                  ))}
                  {hasGoogleReviews ? (
                    <a
                      href={siteConfig.googleReviews.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center border border-black/10 px-3 text-xs text-[var(--color-stone)] transition-colors hover:border-black/20 hover:text-[var(--color-graphite)]"
                    >
                      Google {siteConfig.googleReviews.rating?.toFixed(1)}
                      {siteConfig.googleReviews.reviewCount ? ` · ${siteConfig.googleReviews.reviewCount} reviews` : ""}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div>
              <FooterHeading>Company</FooterHeading>
              <div className="space-y-2 text-sm leading-6 text-[var(--color-stone)]">
                <p>{siteConfig.company.legalName}</p>
                {siteConfig.addressLine ? <p>{siteConfig.addressLine}</p> : null}
                <p>{siteConfig.location}</p>
                {siteConfig.company.orn ? <p>RERA ORN {siteConfig.company.orn}</p> : null}
                {siteConfig.company.tradeLicense ? <p>Trade License {siteConfig.company.tradeLicense}</p> : null}
              </div>
            </div>
            <div>
              <FooterHeading>Contact</FooterHeading>
              <div className="space-y-2 text-sm leading-6 text-[var(--color-stone)]">
                <a className="block transition-colors hover:text-[var(--color-graphite)]" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                {siteConfig.phone ? <a className="block transition-colors hover:text-[var(--color-graphite)]" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>{siteConfig.phone}</a> : null}
                <p>{siteConfig.languages.join(" · ")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 border-t border-black/10 pt-6 text-xs text-[var(--color-stone)] sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <p>© {new Date().getFullYear()} KeyHold. All rights reserved.</p>
          <p className="uppercase tracking-[0.16em] sm:text-center">Dubai · UAE</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-self-end">
            <Link href="/privacy" className="hover:text-[var(--color-graphite)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--color-graphite)]">Terms</Link>
            <Link href="/cookies" className="hover:text-[var(--color-graphite)]">Cookies</Link>
          </div>
        </div>

        <div className="mt-8 max-w-5xl text-[0.7rem] leading-6 text-[var(--color-stone)]">
          Property information, pricing, availability, payment plans and completion dates are subject to confirmation by the relevant developer, owner or authorised seller. Any investment figures shown on KeyHold are estimates and do not constitute guaranteed returns.
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-graphite)]">{children}</h2>;
}

function FooterList({ children }: { children: ReactNode }) {
  return <ul className="space-y-3">{children}</ul>;
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-[var(--color-stone)] transition-colors hover:text-[var(--color-graphite)]">
        {children}
      </Link>
    </li>
  );
}
