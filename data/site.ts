import {
  areas as areaProfiles,
  constructionUpdates,
  developers as developerProfiles,
  projects as realEstateProjects,
  cmsInsights,
  cmsServices,
  cmsSiteSettings,
  cmsSnapshotEnabled,
} from "@/data/catalog";
import { formatProjectPrice } from "@/lib/format";
import type { ProjectCategory } from "@/types/real-estate";

export type NavItem = {
  label: string;
  href: string;
};

export type ProjectPreview = {
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  price: string;
  meta: string;
  image: string;
};

export type InsightPreview = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
};

export type UpdatePreview = {
  slug: string;
  project: string;
  location: string;
  progress: number;
  status: string;
  updatedAt: string;
  image: string;
};

const defaultSiteConfig = {
  name: "KeyHold",
  domain: "keyhold.ae",
  url: "https://keyhold.ae",
  description:
    "KeyHold is a Dubai real estate advisory platform for off-plan, ready properties, short-term rentals and long-term rentals.",
  email: "hello@keyhold.ae",
  phone: "",
  location: "Dubai, United Arab Emirates",
  addressLine: "",
  company: {
    legalName: "KeyHold",
    orn: "",
    tradeLicense: "",
  },
  socials: [] as Array<{ label: string; href: string }>,
  googleReviews: {
    rating: null as number | null,
    reviewCount: null as number | null,
    href: "",
  },
  languages: ["EN"],
};

export const siteConfig = cmsSiteSettings
  ? {
      ...defaultSiteConfig,
      ...cmsSiteSettings,
      domain: defaultSiteConfig.domain,
      url: defaultSiteConfig.url,
      description: defaultSiteConfig.description,
      company: { ...defaultSiteConfig.company, ...cmsSiteSettings.company },
      googleReviews: { ...defaultSiteConfig.googleReviews, ...cmsSiteSettings.googleReviews },
    }
  : defaultSiteConfig;

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Updates", href: "/updates" },
  { label: "Insights", href: "/insights" },
  { label: "Services", href: "/services" },
  { label: "Who We Are", href: "/who-we-are" },
];

export const projectNav: NavItem[] = [
  { label: "Off-Plan", href: "/projects/off-plan" },
  { label: "Ready", href: "/projects/ready" },
  { label: "Short-Term Rentals", href: "/projects/short-term-rentals" },
  { label: "Long-Term Rentals", href: "/projects/long-term-rentals" },
];

function toPreview(project: (typeof realEstateProjects)[number]): ProjectPreview {
  return {
    slug: project.slug,
    title: project.title,
    location: project.location,
    category: project.category,
    price: formatProjectPrice(project),
    meta: `${project.bedroomsLabel} · ${project.propertyTypes.join(" / ")}`,
    image: project.heroImage,
  };
}

// Demo content only. Replace with verified live inventory before launch.
export const projectCatalog: ProjectPreview[] = realEstateProjects.map(toPreview);
export const featuredProjects: ProjectPreview[] = realEstateProjects.filter((project) => project.featured).map(toPreview);

export const updates: UpdatePreview[] = constructionUpdates.map((update) => ({
  slug: update.slug,
  project: update.project,
  location: update.location,
  progress: update.progress,
  status: update.status,
  updatedAt: update.updatedAt,
  image: update.image,
}));

const fallbackInsights: InsightPreview[] = [
  {
    slug: "how-to-read-a-dubai-payment-plan",
    category: "Off-Plan Guide",
    title: "How to read a Dubai payment plan before you commit",
    excerpt:
      "A practical framework for understanding booking payments, construction milestones and handover exposure.",
    date: "August 2026",
  },
  {
    slug: "what-investors-should-compare-beyond-yield",
    category: "Investment",
    title: "What investors should compare beyond headline rental yield",
    excerpt:
      "Service charges, liquidity, supply, payment timing and exit costs can materially change the quality of a deal.",
    date: "August 2026",
  },
  {
    slug: "ready-vs-off-plan-dubai",
    category: "Market Insight",
    title: "Ready vs off-plan: choosing the right route in Dubai",
    excerpt:
      "The right choice depends on liquidity, time horizon, rental needs and tolerance for construction risk.",
    date: "July 2026",
  },
];

export const insights: InsightPreview[] = cmsSnapshotEnabled ? cmsInsights : fallbackInsights;

const fallbackServices = [
  {
    title: "Property Acquisition",
    text: "Curated off-plan and ready opportunities aligned with a buyer’s objectives, time horizon and liquidity profile.",
  },
  {
    title: "Property Sales",
    text: "Positioning, pricing and buyer outreach for owners looking to sell in Dubai’s primary and secondary markets.",
  },
  {
    title: "Investment Advisory",
    text: "Decision support around payment plans, yield assumptions, holding costs, liquidity and exit strategy.",
  },
  {
    title: "Long-Term Rental",
    text: "Tenant-focused leasing support for owners and residents seeking stable long-term occupancy.",
  },
  {
    title: "Short-Term Rental",
    text: "Holiday-home strategy support with an emphasis on positioning, operating assumptions and guest demand.",
  },
  {
    title: "Property Management",
    text: "Ongoing support after acquisition, including coordination, reporting and property-care workflows.",
  },
];

export const services = cmsSnapshotEnabled ? cmsServices : fallbackServices;

export const areas = areaProfiles.map((area) => area.name);
export const developers = developerProfiles.map((developer) => developer.name);
