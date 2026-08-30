import type { Metadata } from "next";
import { IntelligenceMethodologyContent } from "@/app/(en)/intelligence-methodology/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("intelligence-methodology", "/intelligence-methodology", { title: "Intelligence Methodology" }, "fr");
}

export default function IntelligenceMethodologyPageFr() {
  return <IntelligenceMethodologyContent locale="fr" />;
}
