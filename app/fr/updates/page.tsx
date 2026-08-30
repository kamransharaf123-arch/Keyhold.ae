import type { Metadata } from "next";
import { UpdatesContent } from "@/app/updates/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("updates", "/updates", { title: "Construction Updates" }, "fr");
}

export default function UpdatesPageFr() {
  return <UpdatesContent locale="fr" />;
}
