import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { websiteSettings } from "@/data/website-content";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

export function CtaBand({ locale = "en" }: { locale?: KeyHoldLocale }) {
  const isFr = locale === "fr";
  const cta = websiteSettings(locale)?.globalCta;
  const eyebrow = cta?.eyebrow || (isFr ? "Conseil immobilier privé" : "Private property advisory");
  const title = cta?.title || (isFr ? "Trouvez votre place à Dubaï." : "Find your place in Dubai.");
  const primaryLabel = cta?.primaryLabel || (isFr ? "Explorer les projets" : "Explore Projects");
  const primaryHref = cta?.primaryHref || "/projects";
  const secondaryLabel = cta?.secondaryLabel || (isFr ? "Parler à un conseiller" : "Speak with an Advisor");
  const secondaryHref = cta?.secondaryHref || "/contact";

  return (
    <section className="bg-[var(--color-charcoal)] text-[var(--color-bone)]">
      <div className="site-container grid gap-10 py-16 md:grid-cols-[1fr_auto] md:items-end lg:py-20">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#dbc79f]">{eyebrow}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            {title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={localizedHref(primaryHref, locale)} className="button button-light">
            {primaryLabel}
          </Link>
          <Link href={localizedHref(secondaryHref, locale)} className="button button-outline-light inline-flex items-center gap-2">
            {secondaryLabel}
            <ArrowUpRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
