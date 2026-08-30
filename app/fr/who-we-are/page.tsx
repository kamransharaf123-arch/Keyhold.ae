import type { Metadata } from "next";
import { WhoWeAreContent } from "@/app/(en)/who-we-are/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("who-we-are", "/who-we-are", { title: "Who We Are" }, "fr");
}

export default function WhoWeArePageFr() {
  return <WhoWeAreContent locale="fr" />;
}
