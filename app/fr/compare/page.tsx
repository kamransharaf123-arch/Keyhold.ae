import type { Metadata } from "next";
import { CompareContent } from "@/app/(en)/compare/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("compare", "/compare", { title: "Compare Projects" }, "fr");
}

export default function ComparePageFr() {
  return <CompareContent locale="fr" />;
}
