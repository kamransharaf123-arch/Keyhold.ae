import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { areasForLocale } from "@/data/localized-catalog";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import { getProjectsByArea } from "@/lib/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Areas", title: "Explore Dubai by area.", description: "Discover communities through property, lifestyle and investment context.", projects: "projects" },
  fr: { eyebrow: "Quartiers", title: "Explorez Dubaï par quartier.", description: "Découvrez les quartiers à travers l’immobilier, le style de vie et l’investissement.", projects: "projets" },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("areas", "/areas", { title: "Dubai Areas" }, "en");
}

export function AreasContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("areas", locale);
  const copy = COPY[locale];
  const areas = areasForLocale(locale);
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <section className="site-container py-16 lg:py-24">
        <div className="grid border-l border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, index) => (
            <Link key={area.slug} href={localizedHref(`/areas/${area.slug}`, locale)} className="group min-h-52 border-b border-r border-black/10 p-7 transition-colors hover:bg-[var(--color-bone)]">
              <div className="flex items-start justify-between gap-4"><span className="text-xs text-[var(--color-stone)]">{String(index + 1).padStart(2, "0")}</span><span className="text-xs text-[var(--color-stone)]">{getProjectsByArea(area.slug).length} {copy.projects}</span></div>
              <h2 className="font-display mt-10 text-3xl">{area.name}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">{area.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default function AreasPage() {
  return <AreasContent locale="en" />;
}
