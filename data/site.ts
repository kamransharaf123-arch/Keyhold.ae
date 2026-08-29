export type NavItem = {
  label: string;
  href: string;
};

export type ProjectPreview = {
  slug: string;
  title: string;
  location: string;
  category: "Off-Plan" | "Ready" | "Short-Term" | "Long-Term";
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

export const siteConfig = {
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

// Demo content only. Replace with verified live inventory before launch.
export const featuredProjects: ProjectPreview[] = [
  {
    slug: "coastal-residences",
    title: "Coastal Residences",
    location: "Dubai, UAE",
    category: "Off-Plan",
    price: "From AED 2.1M",
    meta: "1–3 bedrooms · Waterfront",
    image: "/images/project-1.svg",
  },
  {
    slug: "downtown-collection",
    title: "Downtown Collection",
    location: "Downtown Dubai",
    category: "Ready",
    price: "From AED 3.4M",
    meta: "2–4 bedrooms · City living",
    image: "/images/project-2.svg",
  },
  {
    slug: "marina-private-homes",
    title: "Marina Private Homes",
    location: "Dubai Marina",
    category: "Long-Term",
    price: "From AED 240K / year",
    meta: "2–3 bedrooms · Marina view",
    image: "/images/project-3.svg",
  },
];

export const projectCatalog: ProjectPreview[] = [
  ...featuredProjects,
  {
    slug: "desert-golf-villas",
    title: "Desert Golf Villas",
    location: "Dubai, UAE",
    category: "Off-Plan",
    price: "From AED 5.8M",
    meta: "4–5 bedrooms · Golf community",
    image: "/images/project-4.svg",
  },
  {
    slug: "palm-view-residence",
    title: "Palm View Residence",
    location: "Palm Jumeirah",
    category: "Short-Term",
    price: "From AED 1,850 / night",
    meta: "2 bedrooms · Sea view",
    image: "/images/project-5.svg",
  },
  {
    slug: "creekside-ready-home",
    title: "Creekside Ready Home",
    location: "Dubai Creek Harbour",
    category: "Ready",
    price: "AED 2.95M",
    meta: "2 bedrooms · Vacant on transfer",
    image: "/images/project-6.svg",
  },
];

export const updates: UpdatePreview[] = [
  {
    slug: "coastal-residences-august-2026",
    project: "Coastal Residences",
    location: "Dubai, UAE",
    progress: 64,
    status: "Superstructure progressing",
    updatedAt: "August 2026",
    image: "/images/update-1.svg",
  },
  {
    slug: "desert-golf-villas-august-2026",
    project: "Desert Golf Villas",
    location: "Dubai, UAE",
    progress: 38,
    status: "Structural works underway",
    updatedAt: "August 2026",
    image: "/images/update-2.svg",
  },
  {
    slug: "coastal-residences-july-2026",
    project: "Coastal Residences",
    location: "Dubai, UAE",
    progress: 58,
    status: "Facade installation started",
    updatedAt: "July 2026",
    image: "/images/update-3.svg",
  },
];

export const insights: InsightPreview[] = [
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

export const services = [
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

export const areas = [
  "Palm Jumeirah",
  "Downtown Dubai",
  "Dubai Marina",
  "Dubai Hills Estate",
  "Dubai Creek Harbour",
  "Business Bay",
];

export const developers = [
  "Emaar",
  "Nakheel",
  "Meraas",
  "Sobha",
  "OMNIYAT",
  "Binghatti",
];
