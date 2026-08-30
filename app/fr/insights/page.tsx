import type { Metadata } from "next";
import { InsightsContent } from "@/app/(en)/insights/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("insights", "/insights", { title: "Insights" }, "fr");
}

export default function InsightsPageFr() {
  return <InsightsContent locale="fr" />;
}
