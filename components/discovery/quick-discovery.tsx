import { areas } from "@/data/catalog";
import { areasForLocale } from "@/data/localized-catalog";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { search: "Search Dubai property", placeholder: "Project, area, developer or lifestyle", route: "Route", all: "All property", area: "Area", allAreas: "All Dubai areas", submit: "Search" },
  fr: { search: "Rechercher un bien à Dubaï", placeholder: "Projet, quartier, promoteur ou style de vie", route: "Catégorie", all: "Tous les biens", area: "Quartier", allAreas: "Tous les quartiers de Dubaï", submit: "Rechercher" },
};

export function QuickDiscovery({ locale = "en" }: { locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  const localizedAreas = locale === "en" ? areas : areasForLocale(locale);
  return (
    <section className="border-b border-black/[0.07] bg-[var(--color-champagne-soft)]">
      <form action={localizedHref("/discover", locale)} method="get" className="site-container grid gap-3 py-5 md:grid-cols-[minmax(0,1.5fr)_minmax(9rem,0.7fr)_minmax(11rem,0.8fr)_auto] md:items-end">
        <label>
          <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.search}</span>
          <input name="q" type="search" placeholder={copy.placeholder} className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-4 text-base outline-none focus:border-[var(--color-teal)]" />
        </label>
        <label>
          <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.route}</span>
          <select name="categories" defaultValue="" className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">{copy.all}</option>
            <option value="Off-Plan">Off-Plan</option>
            <option value="Ready">Ready</option>
            <option value="Short-Term">Short-Term</option>
            <option value="Long-Term">Long-Term</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.area}</span>
          <select name="areaSlugs" defaultValue="" className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">{copy.allAreas}</option>
            {localizedAreas.map((area) => <option key={area.slug} value={area.slug}>{area.name}</option>)}
          </select>
        </label>
        <button type="submit" className="button button-dark min-h-12">{copy.submit}</button>
      </form>
    </section>
  );
}
