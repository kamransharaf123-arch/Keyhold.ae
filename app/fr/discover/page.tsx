import type { Metadata } from "next";
import { DiscoverContent } from "@/app/(en)/discover/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("discover", "/discover", { title: "Discover Dubai Property" }, "fr");
}

export default function DiscoverPageFr() {
  return <DiscoverContent locale="fr" />;
}
