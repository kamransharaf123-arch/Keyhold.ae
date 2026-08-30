import Link from "next/link";
import { Logo } from "@/components/logo";
import { ChevronDownIcon, MenuIcon } from "@/components/icons";
import { primaryNav, projectNav } from "@/data/site";

function DesktopNav() {
  return (
    <nav aria-label="Primary navigation" className="hidden lg:block">
      <ul className="flex items-center gap-7 xl:gap-9">
        <li>
          <Link className="nav-link" href="/">
            Home
          </Link>
        </li>
        <li>
          <details className="group relative">
            <summary className="nav-link flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
              Projects
              <ChevronDownIcon className="size-4 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="absolute left-1/2 top-[calc(100%+1.25rem)] z-50 w-72 -translate-x-1/2 border border-black/10 bg-[var(--color-soft-white)] p-2 shadow-[0_20px_60px_rgba(36,49,47,0.10)]">
              {projectNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-3.5 text-sm text-[var(--color-graphite)] transition-colors hover:bg-[var(--color-teal-soft)] hover:text-[var(--color-teal-deep)]"
                >
                  {item.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </details>
        </li>
        {primaryNav.slice(1).map((item) => (
          <li key={item.href}>
            <Link className="nav-link" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MobileNav() {
  return (
    <details className="relative lg:hidden">
      <summary
        aria-label="Open navigation menu"
        className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-black/10 [&::-webkit-details-marker]:hidden"
      >
        <MenuIcon className="size-5" />
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.8rem)] z-50 w-[min(88vw,22rem)] border border-black/10 bg-[var(--color-soft-white)] p-3 shadow-[0_24px_70px_rgba(36,49,47,0.12)]">
        <Link className="mobile-nav-link" href="/">
          Home
        </Link>
        <div className="my-2 border-y border-black/[0.08] py-2">
          <div className="px-3 pb-2 pt-1 text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
            Projects
          </div>
          {projectNav.map((item) => (
            <Link key={item.href} className="mobile-nav-link" href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        {primaryNav.slice(1).map((item) => (
          <Link key={item.href} className="mobile-nav-link" href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.08] bg-[color:rgba(247,244,238,0.94)] backdrop-blur-xl">
      <div className="site-container grid min-h-20 grid-cols-[1fr_auto] items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
        <div className="justify-self-start">
          <Logo />
        </div>
        <DesktopNav />
        <div className="hidden justify-self-end lg:block">
          <Link href="/contact" className="button button-dark text-xs">
            Speak to an Advisor
          </Link>
        </div>
        <div className="justify-self-end lg:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
