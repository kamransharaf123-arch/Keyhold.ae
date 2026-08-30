import type { Metadata } from "next";
import { ServicesContent } from "@/app/services/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("services", "/services", { title: "Services" }, "fr");
}

export default function ServicesPageFr() {
  return <ServicesContent locale="fr" />;
}
