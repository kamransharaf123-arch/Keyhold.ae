"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AreaExplorerMap } from "@/components/discovery/area-explorer-map";
import { DiscoveryProjectCard } from "@/components/discovery/discovery-project-card";
import { SmartFinder } from "@/components/discovery/smart-finder";
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

type DiscoveryExplorerProps = {
  projects: Project[];
  developers: DeveloperProfile[];
  areas: AreaProfile[];
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

export function DiscoveryExplorer({ projects, developers, areas }: DiscoveryExplorerProps) {
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
    const nextUrl = query ? `/discover?${query}` : "/discover";
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
          <span className="mb-2 block text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Search projects, areas, developers or property types</span>
          <input
            value={filters.query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => patchFilters({ query: event.target.value })}
            placeholder="e.g. waterfront 2 bedroom, Dubai Marina, villa..."
            className="min-h-14 w-full border border-black/10 bg-[var(--color-soft-white)] px-4 text-base outline-none transition-colors focus:border-[var(--color-champagne)]"
            type="search"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setFinderOpen((open) => !open)} className="button border border-black/10 bg-[var(--color-soft-white)] text-xs">
            {finderOpen ? "Close guided finder" : "Guided finder"}
          </button>
          <button type="button" onClick={() => document.getElementById("filters-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="button button-dark text-xs">
            Filters {filterCount > 0 ? `(${filterCount})` : ""}
          </button>
        </div>
      </div>

      {finderOpen ? <div className="mt-5"><SmartFinder areas={areas} onApply={(patch) => { commitFilters({ ...EMPTY_DISCOVERY_FILTERS, ...patch }, { scroll: true }); setFinderOpen(false); }} /></div> : null}

      <div className="mt-5">
        <AreaExplorerMap areas={areas} selectedAreaSlugs={filters.areaSlugs} onToggleArea={(slug) => patchFilters({ areaSlugs: toggleItem(filters.areaSlugs, slug) })} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside id="filters-panel" className="self-start lg:sticky lg:top-28">
          <details className="border border-black/10 bg-[var(--color-soft-white)] lg:hidden" open={filterCount > 0}>
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">Refine results {filterCount > 0 ? `· ${filterCount} active` : ""}</summary>
            <div className="border-t border-black/10 p-5">{renderFilters()}</div>
          </details>
          <div className="hidden border border-black/10 bg-[var(--color-soft-white)] p-5 lg:block">{renderFilters()}</div>
        </aside>

        <main id="discovery-results" className="min-w-0 scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-black/10 pb-5">
            <div>
              <p className="text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-champagne)]">Discovery results</p>
              <h2 className="font-display mt-2 text-3xl tracking-[-0.035em]">{results.length} {results.length === 1 ? "match" : "matches"}</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--color-stone)]">Availability remains subject to current developer/seller confirmation.</p>
            </div>
            <label className="text-sm">
              <span className="mr-3 text-xs uppercase tracking-[0.12em] text-[var(--color-stone)]">Sort</span>
              <select value={filters.sort} onChange={(event: ChangeEvent<HTMLSelectElement>) => patchFilters({ sort: event.target.value as DiscoverySort })} className="min-h-11 border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
                <option value="relevance">KeyHold relevance</option>
                <option value="price-asc">Price / rent: low to high</option>
                <option value="price-desc">Price / rent: high to low</option>
                <option value="initial-cash">Lowest initial cash</option>
                <option value="handover">Ready / earliest handover</option>
                <option value="availability">Available units first</option>
                <option value="newest">Newest on KeyHold</option>
              </select>
            </label>
          </div>

          {filterCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2 py-4">
              <span className="text-xs text-[var(--color-stone)]">{filterCount} active filter{filterCount === 1 ? "" : "s"}</span>
              <button type="button" onClick={resetFilters} className="text-link ml-2">Clear all</button>
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
                />
              ))}
            </div>
          ) : (
            <div className="border border-black/10 bg-[var(--color-bone)] p-8 sm:p-12">
              <p className="eyebrow">No exact match</p>
              <h3 className="font-display mt-4 text-4xl tracking-[-0.035em]">Your filters are a little too precise for the current catalogue.</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">Clear one or two constraints, broaden the area, or speak with an advisor. Production inventory will be much larger than this demo dataset.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={resetFilters} className="button button-dark">Clear filters</button>
                <Link href="/contact" className="button border border-black/10">Ask an advisor</Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {compareSlugs.length > 0 ? (
        <div className="sticky bottom-4 z-30 mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-between gap-4 border border-black/10 bg-[color:rgba(252,251,248,0.96)] p-4 shadow-[0_16px_50px_rgba(17,17,17,0.12)] backdrop-blur">
          <div>
            <p className="text-sm font-semibold">Compare {compareSlugs.length} project{compareSlugs.length === 1 ? "" : "s"}</p>
            <p className="mt-1 text-xs text-[var(--color-stone)]">Select up to 4. Financial comparison expands in Module 4.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setCompareSlugs([]); window.localStorage.setItem(COMPARE_STORAGE_KEY, "[]"); }} className="button border border-black/10 text-xs">Clear</button>
            <Link href={`/compare?projects=${compareSlugs.join(",")}`} className="button button-dark text-xs">Compare now</Link>
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
            <p className="text-sm font-semibold">Refine</p>
            <p className="mt-1 text-xs text-[var(--color-stone)]">{filterCount} active</p>
          </div>
          {filterCount > 0 ? <button type="button" onClick={resetFilters} className="text-xs font-semibold underline decoration-[var(--color-champagne)] underline-offset-4">Reset</button> : null}
        </div>

        <FilterSection title="Property route">
          {categories.map((category) => <CheckboxRow key={category} checked={filters.categories.includes(category)} label={category} count={categoryCount(category)} onChange={() => patchFilters({ categories: toggleItem(filters.categories, category) })} />)}
        </FilterSection>

        <FilterSection title="Price / rent">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-[var(--color-stone)]">Min AED<input value={filters.minPriceAed ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => patchFilters({ minPriceAed: parseMoneyInput(event.target.value) })} inputMode="numeric" placeholder="0" className="mt-1 min-h-11 w-full border border-black/10 px-3 text-base text-[var(--color-graphite)] md:text-sm" /></label>
            <label className="text-xs text-[var(--color-stone)]">Max AED<input value={filters.maxPriceAed ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => patchFilters({ maxPriceAed: parseMoneyInput(event.target.value) })} inputMode="numeric" placeholder="Any" className="mt-1 min-h-11 w-full border border-black/10 px-3 text-base text-[var(--color-graphite)] md:text-sm" /></label>
          </div>
        </FilterSection>

        <FilterSection title="Cash available today">
          <label className="text-xs text-[var(--color-stone)]">Maximum first milestone<input value={filters.maxInitialCashAed ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => patchFilters({ maxInitialCashAed: parseMoneyInput(event.target.value) })} inputMode="numeric" placeholder="e.g. 500000" className="mt-1 min-h-11 w-full border border-black/10 px-3 text-base text-[var(--color-graphite)] md:text-sm" /></label>
          {filters.maxInitialCashAed !== null ? <p className="mt-2 text-xs text-[var(--color-stone)]">Showing sale inventory with estimated first payment ≤ {formatAed(filters.maxInitialCashAed, { compact: true })}.</p> : null}
        </FilterSection>

        <FilterSection title="Bedrooms">
          <div className="flex flex-wrap gap-2">{bedroomOptions.map((bedroom) => <button key={bedroom} type="button" aria-pressed={filters.bedrooms.includes(bedroom)} onClick={() => patchFilters({ bedrooms: toggleItem(filters.bedrooms, bedroom) })} className={`min-h-10 min-w-10 border px-3 text-xs ${filters.bedrooms.includes(bedroom) ? "border-[var(--color-graphite)] bg-[var(--color-graphite)] text-white" : "border-black/10"}`}>{bedroom}</button>)}</div>
        </FilterSection>

        <FilterSection title="Area">
          {areas.map((area) => <CheckboxRow key={area.slug} checked={filters.areaSlugs.includes(area.slug)} label={area.name} onChange={() => patchFilters({ areaSlugs: toggleItem(filters.areaSlugs, area.slug) })} />)}
        </FilterSection>

        <FilterSection title="Developer">
          {developers.map((developer) => <CheckboxRow key={developer.slug} checked={filters.developerSlugs.includes(developer.slug)} label={developer.name} onChange={() => patchFilters({ developerSlugs: toggleItem(filters.developerSlugs, developer.slug) })} />)}
        </FilterSection>

        <FilterSection title="Property type">
          {propertyTypes.map((type) => <CheckboxRow key={type} checked={filters.propertyTypes.includes(type)} label={type} onChange={() => patchFilters({ propertyTypes: toggleItem(filters.propertyTypes, type) })} />)}
        </FilterSection>

        <FilterSection title="Investment goal">
          {investmentGoals.map((goal) => <CheckboxRow key={goal} checked={filters.investmentGoals.includes(goal)} label={goal} onChange={() => patchFilters({ investmentGoals: toggleItem(filters.investmentGoals, goal) })} />)}
        </FilterSection>

        <FilterSection title="Lifestyle">
          {lifestyleTags.map((tag) => <CheckboxRow key={tag} checked={filters.lifestyleTags.includes(tag)} label={tag} onChange={() => patchFilters({ lifestyleTags: toggleItem(filters.lifestyleTags, tag) })} />)}
        </FilterSection>

        <FilterSection title="Handover">
          {handoverYears.map((year) => <CheckboxRow key={year} checked={filters.handoverYears.includes(year)} label={year === 0 ? "Ready now" : String(year)} onChange={() => patchFilters({ handoverYears: toggleItem(filters.handoverYears, year) })} />)}
        </FilterSection>

        <FilterSection title="Payment plan">
          {paymentPlans.map((plan) => <CheckboxRow key={plan} checked={filters.paymentPlanSignatures.includes(plan)} label={plan} onChange={() => patchFilters({ paymentPlanSignatures: toggleItem(filters.paymentPlanSignatures, plan) })} />)}
        </FilterSection>

        <FilterSection title="View">
          {views.map((view) => <CheckboxRow key={view} checked={filters.views.includes(view)} label={view} onChange={() => patchFilters({ views: toggleItem(filters.views, view) })} />)}
        </FilterSection>

        <FilterSection title="Availability">
          <CheckboxRow checked={filters.availableOnly} label="Available units only" onChange={() => patchFilters({ availableOnly: !filters.availableOnly })} />
          <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-stone)]">Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice.</p>
        </FilterSection>

        <FilterSection title="Save this search">
          <div className="flex gap-2">
            <input value={saveName} onChange={(event: ChangeEvent<HTMLInputElement>) => setSaveName(event.target.value)} placeholder="Search name" className="min-h-11 min-w-0 flex-1 border border-black/10 px-3 text-base md:text-sm" />
            <button type="button" onClick={saveCurrentSearch} className="min-h-11 border border-black/10 px-3 text-xs font-semibold hover:border-[var(--color-champagne)]">Save</button>
          </div>
          <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-stone)]">Saved locally on this device until account sync arrives with the Client Portal.</p>
          {savedSearches.length > 0 ? <div className="mt-4 grid gap-2">{savedSearches.map((search) => <div key={search.id} className="flex items-center justify-between gap-2 border-t border-black/[0.08] pt-2"><button type="button" onClick={() => loadSavedSearch(search)} className="min-w-0 truncate text-left text-xs font-medium hover:underline">{search.name}</button><button type="button" onClick={() => deleteSavedSearch(search.id)} aria-label={`Delete saved search ${search.name}`} className="px-2 text-xs text-[var(--color-stone)] hover:text-[var(--color-graphite)]">×</button></div>)}</div> : null}
        </FilterSection>
      </>
    );
  }
}
