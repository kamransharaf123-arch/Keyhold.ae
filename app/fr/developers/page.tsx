import type { Metadata } from "next";
import { DevelopersContent } from "@/app/developers/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("developers", "/developers", { title: "Developers" }, "fr");
}

export default function DevelopersPageFr() {
  return <DevelopersContent locale="fr" />;
}
