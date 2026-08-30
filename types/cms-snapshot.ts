import type { ProjectIntelligenceProfile } from "@/types/intelligence";
import type { AreaProfile, ConstructionUpdate, DeveloperProfile, Project } from "@/types/real-estate";
import type { WebsiteCmsContent } from "@/types/website-cms";

export type CmsSnapshot = {
  enabled: boolean;
  generatedAt: string | null;
  source: "demo-fallback" | "supabase-cms";
  websiteEnabled: boolean;
  website: WebsiteCmsContent | null;
  developers: DeveloperProfile[];
  areas: AreaProfile[];
  projects: Project[];
  constructionUpdates: ConstructionUpdate[];
  intelligenceProfiles: ProjectIntelligenceProfile[];
  insights: Array<{ slug: string; category: string; title: string; excerpt: string; date: string }>;
  services: Array<{ title: string; text: string }>;
  siteSettings: null | {
    name: string;
    email: string;
    phone: string;
    location: string;
    addressLine: string;
    company: { legalName: string; orn: string; tradeLicense: string };
    socials: Array<{ label: string; href: string }>;
    googleReviews: { rating: number | null; reviewCount: number | null; href: string };
    languages: string[];
  };
};
