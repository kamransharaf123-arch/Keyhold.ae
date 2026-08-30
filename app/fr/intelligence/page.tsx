import type { Metadata } from "next";
import { IntelligenceContent } from "@/app/intelligence/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("intelligence", "/intelligence", { title: "KeyHold Intelligence" }, "fr");
}

export default function IntelligencePageFr() {
  return <IntelligenceContent locale="fr" />;
}
