import type { Metadata } from "next";
import { AreasContent } from "@/app/areas/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("areas", "/areas", { title: "Dubai Areas" }, "fr");
}

export default function AreasPageFr() {
  return <AreasContent locale="fr" />;
}
