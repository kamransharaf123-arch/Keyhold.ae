"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AreaExplorerMap } from "@/components/discovery/area-explorer-map";
import { DiscoveryProjectCard } from "@/components/discovery/discovery-project-card";
import { SmartFinder } from "@/components/discovery/smart-finder";
import { localizedHref } from "@/lib/i18n/locale";
import {
  EMPTY_DISCOVERY_FILTERS,
  activeFilterCount,
  filterAndSortProjects,
  filtersFromSearchParams,
  filtersToSearchParams,
  getPaymentPlanSignature,
  getProjectViews,
  type DiscoveryFilters,
  type DiscoverySort,
} from "@/lib/discovery";
import { formatAed } from "@/lib/format";
import type {
  AreaProfile,
  DeveloperProfile,
  InvestmentGoal,
  LifestyleTag,
  Project,
  ProjectCategory,
} from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

type DiscoveryExplorerProps = {
  projects: Project[];
  developers: DeveloperProfile[];
  areas: AreaProfile[];
  locale?: KeyHoldLocale;
};

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  createdAt: string;
};

const COMPARE_STORAGE_KEY = "keyhold_compare_v1";
const SAVED_SEARCH_STORAGE_KEY = "keyhold_saved_searches_v1";
const categories: ProjectCategory[] = ["Off-Plan", "Ready", "Short-Term", "Long-Term"];

const COPY = {
  en: {
    searchLabel: "Search projects, areas, developers or property types",
    searchPlaceholder: "e.g. waterfront 2 bedroom, Dubai Marina, villa...",
    closeGuidedFinder: "Close guided finder",
    guidedFinder: "Guided finder",
    filters: "Filters",
    refineResults: "Refine results",
    active: "active",
    discoveryResults: "Discovery results",
    match: "match",
    matches: "matches",
    availabilityNote: "Availability remains subject to current developer/seller confirmation.",
    sort: "Sort",
    sortRelevance: "KeyHold relevance",
    sortPriceAsc: "Price / rent: low to high",
    sortPriceDesc: "Price / rent: high to low",
    sortInitialCash: "Lowest initial cash",
    sortHandover: "Ready / earliest handover",
    sortAvailability: "Available units first",
    sortNewest: "Newest on KeyHold",
    activeFilter: "active filter",
    activeFilters: "active filters",
    clearAll: "Clear all",
    noExactMatch: "No exact match",
    noMatchTitle: "Your filters are a little too precise for the current catalogue.",
    noMatchBody: "Clear one or two constraints, broaden the area, or speak with an advisor. Production inventory will be much larger than this demo dataset.",
    clearFilters: "Clear filters",
    askAdvisor: "Ask an advisor",
    compareCount: (count: number) => `Compare ${count} project${count === 1 ? "" : "s"}`,
    compareNote: "Select up to 4. Financial comparison expands in Module 4.",
    clear: "Clear",
    compareNow: "Compare now",
    refine: "Refine",
    reset: "Reset",
    propertyRoute: "Property route",
    priceRent: "Price / rent",
    minAed: "Min AED",
    maxAed: "Max AED",
    any: "Any",
    cashAvailable: "Cash available today",
    maxFirstMilestone: "Maximum first milestone",
    cashExample: "e.g. 500000",
    showingInventory: (amount: string) => `Showing sale inventory with estimated first payment ≤ ${amount}.`,
    bedrooms: "Bedrooms",
    area: "Area",
    developer: "Developer",
    propertyType: "Property type",
    investmentGoal: "Investment goal",
    lifestyle: "Lifestyle",
    handover: "Handover",
    readyNow: "Ready now",
    paymentPlan: "Payment plan",
    view: "View",
    availability: "Availability",
    availableOnly: "Available units only",
    availabilityDisclaimer: "Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice.",
    saveSearch: "Save this search",
    searchName: "Search name",
    save: "Save",
    savedLocally: "Saved locally on this device until account sync arrives with the Client Portal.",
    deleteSaved: (name: string) => `Delete saved search ${name}`,
  },
  fr: {
    searchLabel: "Rechercher des projets, quartiers, promoteurs ou types de biens",
    searchPlaceholder: "ex. front de mer 2 chambres, Dubai Marina, villa...",
    closeGuidedFinder: "Fermer l’assistant guidé",
    guidedFinder: "Assistant guidé",
    filters: "Filtres",
    refineResults: "Affiner les résultats",
    active: "actif(s)",
    discoveryResults: "Résultats de recherche",
    match: "résultat",
    matches: "résultats",
    availabilityNote: "La disponibilité reste sous réserve de confirmation actuelle du promoteur/vendeur.",
    sort: "Trier",
    sortRelevance: "Pertinence KeyHold",
    sortPriceAsc: "Prix / loyer : croissant",
    sortPriceDesc: "Prix / loyer : décroissant",
    sortInitialCash: "Trésorerie initiale la plus faible",
    sortHandover: "Prêt / livraison la plus proche",
    sortAvailability: "Unités disponibles en premier",
    sortNewest: "Nouveautés KeyHold",
    activeFilter: "filtre actif",
    activeFilters: "filtres actifs",
    clearAll: "Tout effacer",
    noExactMatch: "Aucune correspondance exacte",
    noMatchTitle: "Vos filtres sont un peu trop précis pour le catalogue actuel.",
    noMatchBody: "Retirez une ou deux contraintes, élargissez la zone ou parlez à un conseiller. L’inventaire de production sera bien plus vaste que ce jeu de données de démonstration.",
    clearFilters: "Effacer les filtres",
    askAdvisor: "Demander à un conseiller",
    compareCount: (count: number) => `Comparer ${count} projet${count === 1 ? "" : "s"}`,
    compareNote: "Sélectionnez jusqu’à 4 projets. La comparaison financière est enrichie au Module 4.",
    clear: "Effacer",
    compareNow: "Comparer maintenant",
    refine: "Affiner",
    reset: "Réinitialiser",
    propertyRoute: "Catégorie de bien",
    priceRent: "Prix / loyer",
    minAed: "Min AED",
    maxAed: "Max AED",
    any: "Indifférent",
    cashAvailable: "Liquidités disponibles aujourd’hui",
    maxFirstMilestone: "Premier versement maximum",
    cashExample: "ex. 500000",
    showingInventory: (amount: string) => `Affichage des biens avec un premier versement estimé ≤ ${amount}.`,
    bedrooms: "Chambres",
    area: "Quartier",
    developer: "Promoteur",
    propertyType: "Type de bien",
    investmentGoal: "Objectif d’investissement",
    lifestyle: "Style de vie",
    handover: "Livraison",
    readyNow: "Prêt maintenant",
    paymentPlan: "Plan de paiement",
    view: "Vue",
    availability: "Disponibilité",
    availableOnly: "Unités disponibles uniquement",
    availabilityDisclaimer: "La disponibilité des unités dépend de la disponibilité actuelle du promoteur/vendeur, doit être confirmée et peut changer sans préavis.",
    saveSearch: "Enregistrer cette recherche",
    searchName: "Nom de la recherche",
    save: "Enregistrer",
    savedLocally: "Enregistré localement sur cet appareil jusqu’à l’arrivée de la synchronisation de compte avec le Portail Client.",
    deleteSaved: (name: string) => `Supprimer la recherche enregistrée ${name}`,
  },
} as const;

function safeReadStringArray(key: string): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function safeReadSavedSearches(): SavedSearch[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_SEARCH_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedSearch =>
        typeof item === "object" && item !== null &&
        typeof item.id === "string" && typeof item.name === "string" &&
        typeof item.query === "string" && typeof item.createdAt === "string",
    );
  } catch {
    return [];
  }
}

function toggleItem<T>(items: T[], item: T): T[] {
  return items.includes(item) ? items.filter((candidate) => candidate !== item) : [...items, item];
}

function parseMoneyInput(value: string): number | null {
  const normalized = value.replace(/[^0-9]/g, "");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function CheckboxRow({ checked, label, count, onChange }: { checked: boolean; label: string; count?: number; onChange: () => void }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-3">
        <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[var(--color-graphite)]" />
        <span>{label}</span>
      </span>
      {typeof count === "number" ? <span className="text-xs text-[var(--color-stone)]">{count}</span> : null}
    </label>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-black/[0.08] py-5 first:border-t-0 first:pt-0">
      <p className="mb-3 text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{title}</p>
      {children}
    </div>
  );
}

export function DiscoveryExplorer({ projects, developers, areas, locale = "en" }: DiscoveryExplorerProps) {
  const copy = COPY[locale];
  const discoverPath = localizedHref("/discover", locale);
  const searchParams = useSearchParams();
  const initialFilters = useMemo(() => filtersFromSearchParams(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [filters, setFilters] = useState<DiscoveryFilters>(initialFilters);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveName, setSaveName] = useState("");
  const [finderOpen, setFinderOpen] = useState(false);

  useEffect(() => {
    const validSlugs = new Set(projects.map((project) => project.slug));
    setCompareSlugs(safeReadStringArray(COMPARE_STORAGE_KEY).filter((slug) => validSlugs.has(slug)).slice(0, 4));
    setSavedSearches(safeReadSavedSearches());
  }, [projects]);

  const developerNameBySlug = useMemo(
    () => Object.fromEntries(developers.map((developer) => [developer.slug, developer.name])),
    [developers],
  );
  const areaNameBySlug = useMemo(() => Object.fromEntries(areas.map((area) => [area.slug, area.name])), [areas]);

  const results = useMemo(
    () => filterAndSortProjects(projects, filters, { developerNameBySlug, areaNameBySlug }),
    [projects, filters, developerNameBySlug, areaNameBySlug],
  );

  const propertyTypes = useMemo(() => [...new Set(projects.flatMap((project) => project.propertyTypes))].sort(), [projects]);
  const bedroomOptions = useMemo(() => [...new Set(projects.flatMap((project) => project.bedrooms))].sort((a, b) => a - b), [projects]);
  const handoverYears = useMemo(() => {
    const values = projects.map((project) => project.handoverDate ? Number(project.handoverDate.slice(0, 4)) : (project.completionStatus === "ready" ? 0 : null));
    return [...new Set(values.filter((value): value is number => value !== null && Number.isFinite(value)))].sort((a, b) => a - b);
  }, [projects]);
  const investmentGoals = useMemo(() => [...new Set(projects.flatMap((project) => project.discovery.investmentGoals))].sort() as InvestmentGoal[], [projects]);
  const lifestyleTags = useMemo(() => [...new Set(projects.flatMap((project) => project.discovery.lifestyleTags))].sort() as LifestyleTag[], [projects]);
  const views = useMemo(() => [...new Set(projects.flatMap(getProjectViews))].sort(), [projects]);
  const paymentPlans = useMemo(() => [...new Set(projects.map(getPaymentPlanSignature).filter((value): value is string => Boolean(value)))].sort(), [projects]);
  const filterCount = activeFilterCount(filters);

  function commitFilters(next: DiscoveryFilters, options?: { scroll?: boolean }) {
    setFilters(next);
    const params = filtersToSearchParams(next);
    const query = params.toString();
    const nextUrl = query ? `${discoverPath}?${query}` : discoverPath;
    window.history.replaceState(null, "", nextUrl);
    if (options?.scroll) document.getElementById("discovery-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function patchFilters(patch: Partial<DiscoveryFilters>, options?: { scroll?: boolean }) {
    commitFilters({ ...filters, ...patch }, options);
  }

  function resetFilters() {
    commitFilters({ ...EMPTY_DISCOVERY_FILTERS });
  }

  function toggleCompare(slug: string) {
    setCompareSlugs((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug].slice(0, 4);
      window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function saveCurrentSearch() {
    const name = saveName.trim() || `Search ${savedSearches.length + 1}`;
    const params = filtersToSearchParams(filters).toString();
    const item: SavedSearch = { id: `${Date.now()}`, name, query: params, createdAt: new Date().toISOString() };
    const next = [item, ...savedSearches].slice(0, 8);
    setSavedSearches(next);
    setSaveName("");
    window.localStorage.setItem(SAVED_SEARCH_STORAGE_KEY, JSON.stringify(next));
  }

  function loadSavedSearch(search: SavedSearch) {
    const next = filtersFromSearchParams(new URLSearchParams(search.query));
    commitFilters(next, { scroll: true });
  }

  function deleteSavedSearch(id: string) {
    const next = savedSearches.filter((item) => item.id !== id);
    setSavedSearches(next);
    window.localStorage.setItem(SAVED_SEARCH_STORAGE_KEY, JSON.stringify(next));
  }

  function categoryCount(category: ProjectCategory) {
    return projects.filter((project) => project.category === category).length;
  }

  return (
    <div className="site-container py-12 lg:py-16">
      <div className="grid gap-5 border border-black/10 bg-[var(--color-bone)] p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <label>
          <span className="mb-2 block text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.searchLabel}</span>
          <input
            value={filters.query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => patchFilters({ query: event.target.value })}
            placeholder={copy.searchPlaceholder}
            className="min-h-14 w-full border border-black/10 bg-[var(--color-soft-white)] px-4 text-base outline-none transition-colors focus:border-[var(--color-champagne)]"
            type="search"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setFinderOpen((open) => !open)} className="button border border-black/10 bg-[var(--color-soft-white)] text-xs">
            {finderOpen ? copy.closeGuidedFinder : copy.guidedFinder}
          </button>
          <button type="button" onClick={() => document.getElementById("filters-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="button button-dark text-xs">
            {copy.filters} {filterCount > 0 ? `(${filterCount})` : ""}
          </button>
        </div>
      </div>

      {finderOpen ? <div className="mt-5"><SmartFinder areas={areas} onApply={(patch) => { commitFilters({ ...EMPTY_DISCOVERY_FILTERS, ...patch }, { scroll: true }); setFinderOpen(false); }} locale={locale} /></div> : null}

      <div className="mt-5">
        <AreaExplorerMap areas={areas} selectedAreaSlugs={filters.areaSlugs} onToggleArea={(slug) => patchFilters({ areaSlugs: toggleItem(filters.areaSlugs, slug) })} locale={locale} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside id="filters-panel" className="self-start lg:sticky lg:top-28">
          <details className="border border-black/10 bg-[var(--color-soft-white)] lg:hidden" open={filterCount > 0}>
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">{copy.refineResults} {filterCount > 0 ? `· ${filterCount} ${copy.active}` : ""}</summary>
            <div className="border-t border-black/10 p-5">{renderFilters()}</div>
          </details>
          <div className="hidden border border-black/10 bg-[var(--color-soft-white)] p-5 lg:block">{renderFilters()}</div>
        </aside>

        <main id="discovery-results" className="min-w-0 scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-black/10 pb-5">
            <div>
              <p className="text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-teal-deep)]">{copy.discoveryResults}</p>
              <h2 className="font-display mt-2 text-3xl tracking-[-0.035em]">{results.length} {results.length === 1 ? copy.match : copy.matches}</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">{copy.availabilityNote}</p>
            </div>
            <label className="text-sm">
              <span className="mr-3 text-xs uppercase tracking-[0.12em] text-[var(--color-stone)]">{copy.sort}</span>
              <select value={filters.sort} onChange={(event: ChangeEvent<HTMLSelectElement>) => patchFilters({ sort: event.target.value as DiscoverySort })} className="min-h-11 border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
                <option value="relevance">{copy.sortRelevance}</option>
                <option value="price-asc">{copy.sortPriceAsc}</option>
                <option value="price-desc">{copy.sortPriceDesc}</option>
                <option value="initial-cash">{copy.sortInitialCash}</option>
                <option value="handover">{copy.sortHandover}</option>
                <option value="availability">{copy.sortAvailability}</option>
                <option value="newest">{copy.sortNewest}</option>
              </select>
            </label>
          </div>

          {filterCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2 py-4">
              <span className="text-xs text-[var(--color-stone)]">{filterCount} {filterCount === 1 ? copy.activeFilter : copy.activeFilters}</span>
              <button type="button" onClick={resetFilters} className="text-link ml-2">{copy.clearAll}</button>
            </div>
          ) : <div className="h-5" />}

          {results.length > 0 ? (
            <div className="grid gap-5">
              {results.map((project) => (
                <DiscoveryProjectCard
                  key={project.slug}
                  project={project}
                  developerName={developerNameBySlug[project.developerSlug] ?? project.developerSlug}
                  compareSelected={compareSlugs.includes(project.slug)}
                  compareDisabled={compareSlugs.length >= 4}
                  onToggleCompare={toggleCompare}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="border border-black/10 bg-[var(--color-bone)] p-8 sm:p-12">
              <p className="eyebrow">{copy.noExactMatch}</p>
              <h3 className="font-display mt-4 text-4xl tracking-[-0.035em]">{copy.noMatchTitle}</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">{copy.noMatchBody}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={resetFilters} className="button button-dark">{copy.clearFilters}</button>
                <Link href={localizedHref("/contact", locale)} className="button border border-black/10">{copy.askAdvisor}</Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {compareSlugs.length > 0 ? (
        <div className="sticky bottom-4 z-30 mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-between gap-4 border border-black/10 bg-[color:rgba(252,251,248,0.96)] p-4 shadow-[0_16px_50px_rgba(17,17,17,0.12)] backdrop-blur">
          <div>
            <p className="text-sm font-semibold">{copy.compareCount(compareSlugs.length)}</p>
            <p className="mt-1 text-xs text-[var(--color-stone)]">{copy.compareNote}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setCompareSlugs([]); window.localStorage.setItem(COMPARE_STORAGE_KEY, "[]"); }} className="button border border-black/10 text-xs">{copy.clear}</button>
            <Link href={`${localizedHref("/compare", locale)}?projects=${compareSlugs.join(",")}`} className="button button-dark text-xs">{copy.compareNow}</Link>
          </div>
        </div>
      ) : null}
    </div>
  );

  function renderFilters() {
    return (
      <>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{copy.refine}</p>
            <p className="mt-1 text-xs text-[var(--color-stone)]">{filterCount} {copy.active}</p>
          </div>
          {filterCount > 0 ? <button type="button" onClick={resetFilters} className="text-xs font-semibold underline decoration-[var(--color-champagne)] underline-offset-4">{copy.reset}</button> : null}
        </div>

        <FilterSection title={copy.propertyRoute}>
          {categories.map((category) => <CheckboxRow key={category} checked={filters.categories.includes(category)} label={category} count={categoryCount(category)} onChange={() => patchFilters({ categories: toggleItem(filters.categories, category) })} />)}
        </FilterSection>

        <FilterSection title={copy.priceRent}>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-[var(--color-stone)]">{copy.minAed}<input value={filters.minPriceAed ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => patchFilters({ minPriceAed: parseMoneyInput(event.target.value) })} inputMode="numeric" placeholder="0" className="mt-1 min-h-11 w-full border border-black/10 px-3 text-base text-[var(--color-graphite)] md:text-sm" /></label>
            <label className="text-xs text-[var(--color-stone)]">{copy.maxAed}<input value={filters.maxPriceAed ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => patchFilters({ maxPriceAed: parseMoneyInput(event.target.value) })} inputMode="numeric" placeholder={copy.any} className="mt-1 min-h-11 w-full border border-black/10 px-3 text-base text-[var(--color-graphite)] md:text-sm" /></label>
          </div>
        </FilterSection>

        <FilterSection title={copy.cashAvailable}>
          <label className="text-xs text-[var(--color-stone)]">{copy.maxFirstMilestone}<input value={filters.maxInitialCashAed ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => patchFilters({ maxInitialCashAed: parseMoneyInput(event.target.value) })} inputMode="numeric" placeholder={copy.cashExample} className="mt-1 min-h-11 w-full border border-black/10 px-3 text-base text-[var(--color-graphite)] md:text-sm" /></label>
          {filters.maxInitialCashAed !== null ? <p className="mt-2 text-xs text-[var(--color-stone)]">{copy.showingInventory(formatAed(filters.maxInitialCashAed, { compact: true }))}</p> : null}
        </FilterSection>

        <FilterSection title={copy.bedrooms}>
          <div className="flex flex-wrap gap-2">{bedroomOptions.map((bedroom) => <button key={bedroom} type="button" aria-pressed={filters.bedrooms.includes(bedroom)} onClick={() => patchFilters({ bedrooms: toggleItem(filters.bedrooms, bedroom) })} className={`min-h-10 min-w-10 border px-3 text-xs ${filters.bedrooms.includes(bedroom) ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-black/10"}`}>{bedroom}</button>)}</div>
        </FilterSection>

        <FilterSection title={copy.area}>
          {areas.map((area) => <CheckboxRow key={area.slug} checked={filters.areaSlugs.includes(area.slug)} label={area.name} onChange={() => patchFilters({ areaSlugs: toggleItem(filters.areaSlugs, area.slug) })} />)}
        </FilterSection>

        <FilterSection title={copy.developer}>
          {developers.map((developer) => <CheckboxRow key={developer.slug} checked={filters.developerSlugs.includes(developer.slug)} label={developer.name} onChange={() => patchFilters({ developerSlugs: toggleItem(filters.developerSlugs, developer.slug) })} />)}
        </FilterSection>

        <FilterSection title={copy.propertyType}>
          {propertyTypes.map((type) => <CheckboxRow key={type} checked={filters.propertyTypes.includes(type)} label={type} onChange={() => patchFilters({ propertyTypes: toggleItem(filters.propertyTypes, type) })} />)}
        </FilterSection>

        <FilterSection title={copy.investmentGoal}>
          {investmentGoals.map((goal) => <CheckboxRow key={goal} checked={filters.investmentGoals.includes(goal)} label={goal} onChange={() => patchFilters({ investmentGoals: toggleItem(filters.investmentGoals, goal) })} />)}
        </FilterSection>

        <FilterSection title={copy.lifestyle}>
          {lifestyleTags.map((tag) => <CheckboxRow key={tag} checked={filters.lifestyleTags.includes(tag)} label={tag} onChange={() => patchFilters({ lifestyleTags: toggleItem(filters.lifestyleTags, tag) })} />)}
        </FilterSection>

        <FilterSection title={copy.handover}>
          {handoverYears.map((year) => <CheckboxRow key={year} checked={filters.handoverYears.includes(year)} label={year === 0 ? copy.readyNow : String(year)} onChange={() => patchFilters({ handoverYears: toggleItem(filters.handoverYears, year) })} />)}
        </FilterSection>

        <FilterSection title={copy.paymentPlan}>
          {paymentPlans.map((plan) => <CheckboxRow key={plan} checked={filters.paymentPlanSignatures.includes(plan)} label={plan} onChange={() => patchFilters({ paymentPlanSignatures: toggleItem(filters.paymentPlanSignatures, plan) })} />)}
        </FilterSection>

        <FilterSection title={copy.view}>
          {views.map((view) => <CheckboxRow key={view} checked={filters.views.includes(view)} label={view} onChange={() => patchFilters({ views: toggleItem(filters.views, view) })} />)}
        </FilterSection>

        <FilterSection title={copy.availability}>
          <CheckboxRow checked={filters.availableOnly} label={copy.availableOnly} onChange={() => patchFilters({ availableOnly: !filters.availableOnly })} />
          <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-stone)]">{copy.availabilityDisclaimer}</p>
        </FilterSection>

        <FilterSection title={copy.saveSearch}>
          <div className="flex gap-2">
            <input value={saveName} onChange={(event: ChangeEvent<HTMLInputElement>) => setSaveName(event.target.value)} placeholder={copy.searchName} className="min-h-11 min-w-0 flex-1 border border-black/10 px-3 text-base md:text-sm" />
            <button type="button" onClick={saveCurrentSearch} className="min-h-11 border border-black/10 px-3 text-xs font-semibold hover:border-[var(--color-teal)]">{copy.save}</button>
          </div>
          <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-stone)]">{copy.savedLocally}</p>
          {savedSearches.length > 0 ? <div className="mt-4 grid gap-2">{savedSearches.map((search) => <div key={search.id} className="flex items-center justify-between gap-2 border-t border-black/[0.08] pt-2"><button type="button" onClick={() => loadSavedSearch(search)} className="min-w-0 truncate text-left text-xs font-medium hover:underline">{search.name}</button><button type="button" onClick={() => deleteSavedSearch(search.id)} aria-label={copy.deleteSaved(search.name)} className="px-2 text-xs text-[var(--color-stone)] hover:text-[var(--color-graphite)]">×</button></div>)}</div> : null}
        </FilterSection>
      </>
    );
  }
}
