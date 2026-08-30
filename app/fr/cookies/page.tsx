import type { Metadata } from "next";
import { CookiesContent } from "@/app/cookies/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("cookies", "/cookies", { title: "Cookie Policy" }, "fr");
}

export default function CookiesPageFr() {
  return <CookiesContent locale="fr" />;
}
