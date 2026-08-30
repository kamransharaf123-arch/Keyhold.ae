import type {
  InvestmentGoal,
  LifestyleTag,
  Project,
  ProjectCategory,
  UnitAvailability,
} from "@/types/real-estate";

export type DiscoverySort =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "handover"
  | "initial-cash"
  | "availability"
  | "newest";

export type DiscoveryFilters = {
  query: string;
  categories: ProjectCategory[];
  developerSlugs: string[];
  areaSlugs: string[];
  propertyTypes: string[];
  bedrooms: number[];
  minPriceAed: number | null;
  maxPriceAed: number | null;
  maxInitialCashAed: number | null;
  handoverYears: number[];
  investmentGoals: InvestmentGoal[];
  lifestyleTags: LifestyleTag[];
  views: string[];
  paymentPlanSignatures: string[];
  availableOnly: boolean;
  sort: DiscoverySort;
};

export const EMPTY_DISCOVERY_FILTERS: DiscoveryFilters = {
  query: "",
  categories: [],
  developerSlugs: [],
  areaSlugs: [],
  propertyTypes: [],
  bedrooms: [],
  minPriceAed: null,
  maxPriceAed: null,
  maxInitialCashAed: null,
  handoverYears: [],
  investmentGoals: [],
  lifestyleTags: [],
  views: [],
  paymentPlanSignatures: [],
  availableOnly: false,
  sort: "relevance",
};

export function getProjectListingPrice(project: Project): number | null {
  return project.priceFromAed ?? project.rentalPriceFromAed ?? null;
}

export function getPaymentPlanSignature(project: Project): string | null {
  if (project.paymentPlan.length === 0) return null;
  return project.paymentPlan.map((milestone) => milestone.percentage).join(" / ");
}

export function getInitialCashRequirement(project: Project): number | null {
  if (project.priceFromAed === null) return null;
  const firstMilestone = project.paymentPlan[0];
  if (!firstMilestone) return project.priceFromAed;
  return Math.round(project.priceFromAed * (firstMilestone.percentage / 100));
}

export function getHandoverYear(project: Project): number | null {
  if (!project.handoverDate) return project.completionStatus === "ready" ? 0 : null;
  const year = Number(project.handoverDate.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

export function getProjectViews(project: Project): string[] {
  return [...new Set(project.units.map((unit) => unit.view).filter(Boolean))].sort();
}

export function hasAvailableUnit(project: Project): boolean {
  return project.units.some((unit) => unit.availability === "available");
}

export function countUnitsByAvailability(project: Project): Record<UnitAvailability, number> {
  return project.units.reduce<Record<UnitAvailability, number>>(
    (counts, unit) => {
      counts[unit.availability] += 1;
      return counts;
    },
    { available: 0, reserved: 0, sold: 0, unknown: 0 },
  );
}

function includesAll<T>(selected: T[], values: T[]): boolean {
  return selected.length === 0 || selected.some((item) => values.includes(item));
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("en").trim();
}

export function getSearchScore(
  project: Project,
  query: string,
  developerName: string,
  areaName: string,
): number {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return project.featured ? 10 : 1;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const fields = [
    { value: project.title, weight: 12 },
    { value: areaName, weight: 9 },
    { value: project.location, weight: 8 },
    { value: developerName, weight: 8 },
    { value: project.category, weight: 6 },
    { value: project.propertyTypes.join(" "), weight: 5 },
    { value: project.bedroomsLabel, weight: 5 },
    { value: project.discovery.keywords.join(" "), weight: 5 },
    { value: project.discovery.investmentGoals.join(" "), weight: 4 },
    { value: project.discovery.lifestyleTags.join(" "), weight: 4 },
    { value: getProjectViews(project).join(" "), weight: 3 },
    { value: project.shortDescription, weight: 2 },
  ];

  let score = 0;
  for (const token of tokens) {
    let matched = false;
    for (const field of fields) {
      const normalizedField = normalize(field.value);
      if (normalizedField === token) {
        score += field.weight * 1.5;
        matched = true;
      } else if (normalizedField.includes(token)) {
        score += field.weight;
        matched = true;
      }
    }
    if (!matched) return 0;
  }
  return score + (project.featured ? 2 : 0);
}

export type DiscoveryContext = {
  developerNameBySlug: Record<string, string>;
  areaNameBySlug: Record<string, string>;
};

export function filterAndSortProjects(
  projects: Project[],
  filters: DiscoveryFilters,
  context: DiscoveryContext,
): Project[] {
  const matches = projects.filter((project) => {
    const developerName = context.developerNameBySlug[project.developerSlug] ?? project.developerSlug;
    const areaName = context.areaNameBySlug[project.areaSlug] ?? project.location;
    const score = getSearchScore(project, filters.query, developerName, areaName);
    if (filters.query.trim() && score <= 0) return false;

    if (!includesAll(filters.categories, [project.category])) return false;
    if (!includesAll(filters.developerSlugs, [project.developerSlug])) return false;
    if (!includesAll(filters.areaSlugs, [project.areaSlug])) return false;
    if (!includesAll(filters.propertyTypes, project.propertyTypes)) return false;
    if (!includesAll(filters.bedrooms, project.bedrooms)) return false;
    if (!includesAll(filters.investmentGoals, project.discovery.investmentGoals)) return false;
    if (!includesAll(filters.lifestyleTags, project.discovery.lifestyleTags)) return false;
    if (!includesAll(filters.views, getProjectViews(project))) return false;

    const signature = getPaymentPlanSignature(project);
    if (
      filters.paymentPlanSignatures.length > 0 &&
      (!signature || !filters.paymentPlanSignatures.includes(signature))
    ) {
      return false;
    }

    const price = getProjectListingPrice(project);
    if (filters.minPriceAed !== null && (price === null || price < filters.minPriceAed)) return false;
    if (filters.maxPriceAed !== null && (price === null || price > filters.maxPriceAed)) return false;

    if (filters.maxInitialCashAed !== null) {
      const initialCash = getInitialCashRequirement(project);
      if (initialCash === null || initialCash > filters.maxInitialCashAed) return false;
    }

    if (filters.handoverYears.length > 0) {
      const year = getHandoverYear(project);
      const key = year === 0 ? 0 : year;
      if (key === null || !filters.handoverYears.includes(key)) return false;
    }

    if (filters.availableOnly && !hasAvailableUnit(project)) return false;
    return true;
  });

  const sorted = [...matches];
  sorted.sort((a, b) => {
    if (filters.sort === "price-asc" || filters.sort === "price-desc") {
      const priceA = getProjectListingPrice(a);
      const priceB = getProjectListingPrice(b);
      if (priceA === null && priceB === null) return 0;
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return filters.sort === "price-asc" ? priceA - priceB : priceB - priceA;
    }

    if (filters.sort === "handover") {
      const yearA = getHandoverYear(a);
      const yearB = getHandoverYear(b);
      const sortableA = yearA === 0 ? 1900 : (yearA ?? 9999);
      const sortableB = yearB === 0 ? 1900 : (yearB ?? 9999);
      return sortableA - sortableB;
    }

    if (filters.sort === "initial-cash") {
      return (getInitialCashRequirement(a) ?? Number.POSITIVE_INFINITY) -
        (getInitialCashRequirement(b) ?? Number.POSITIVE_INFINITY);
    }

    if (filters.sort === "availability") {
      return Number(hasAvailableUnit(b)) - Number(hasAvailableUnit(a));
    }

    if (filters.sort === "newest") {
      return b.publishedAt.localeCompare(a.publishedAt);
    }

    const scoreA = getSearchScore(
      a,
      filters.query,
      context.developerNameBySlug[a.developerSlug] ?? a.developerSlug,
      context.areaNameBySlug[a.areaSlug] ?? a.location,
    );
    const scoreB = getSearchScore(
      b,
      filters.query,
      context.developerNameBySlug[b.developerSlug] ?? b.developerSlug,
      context.areaNameBySlug[b.areaSlug] ?? b.location,
    );
    return scoreB - scoreA;
  });
  return sorted;
}

const ARRAY_KEYS = [
  "categories",
  "developerSlugs",
  "areaSlugs",
  "propertyTypes",
  "bedrooms",
  "handoverYears",
  "investmentGoals",
  "lifestyleTags",
  "views",
  "paymentPlanSignatures",
] as const;

export function filtersToSearchParams(filters: DiscoveryFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  for (const key of ARRAY_KEYS) {
    const values = filters[key];
    if (values.length > 0) params.set(key, values.join(","));
  }
  if (filters.minPriceAed !== null) params.set("minPrice", String(filters.minPriceAed));
  if (filters.maxPriceAed !== null) params.set("maxPrice", String(filters.maxPriceAed));
  if (filters.maxInitialCashAed !== null) params.set("cash", String(filters.maxInitialCashAed));
  if (filters.availableOnly) params.set("available", "1");
  if (filters.sort !== "relevance") params.set("sort", filters.sort);
  return params;
}

function parseFiniteNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function splitParam(value: string | null): string[] {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

export function filtersFromSearchParams(params: URLSearchParams): DiscoveryFilters {
  const sort = params.get("sort") as DiscoverySort | null;
  const validSorts: DiscoverySort[] = ["relevance", "price-asc", "price-desc", "handover", "initial-cash", "availability", "newest"];

  return {
    query: params.get("q") ?? "",
    categories: splitParam(params.get("categories")) as ProjectCategory[],
    developerSlugs: splitParam(params.get("developerSlugs")),
    areaSlugs: splitParam(params.get("areaSlugs")),
    propertyTypes: splitParam(params.get("propertyTypes")),
    bedrooms: splitParam(params.get("bedrooms")).map(Number).filter(Number.isFinite),
    minPriceAed: parseFiniteNumber(params.get("minPrice")),
    maxPriceAed: parseFiniteNumber(params.get("maxPrice")),
    maxInitialCashAed: parseFiniteNumber(params.get("cash")),
    handoverYears: splitParam(params.get("handoverYears")).map(Number).filter(Number.isFinite),
    investmentGoals: splitParam(params.get("investmentGoals")) as InvestmentGoal[],
    lifestyleTags: splitParam(params.get("lifestyleTags")) as LifestyleTag[],
    views: splitParam(params.get("views")),
    paymentPlanSignatures: splitParam(params.get("paymentPlanSignatures")),
    availableOnly: params.get("available") === "1",
    sort: sort && validSorts.includes(sort) ? sort : "relevance",
  };
}

export function activeFilterCount(filters: DiscoveryFilters): number {
  return (
    Number(Boolean(filters.query.trim())) +
    filters.categories.length +
    filters.developerSlugs.length +
    filters.areaSlugs.length +
    filters.propertyTypes.length +
    filters.bedrooms.length +
    filters.handoverYears.length +
    filters.investmentGoals.length +
    filters.lifestyleTags.length +
    filters.views.length +
    filters.paymentPlanSignatures.length +
    Number(filters.minPriceAed !== null) +
    Number(filters.maxPriceAed !== null) +
    Number(filters.maxInitialCashAed !== null) +
    Number(filters.availableOnly)
  );
}
