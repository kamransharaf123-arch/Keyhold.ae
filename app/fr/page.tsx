import type { Metadata } from "next";
import { HomeContent } from "@/app/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("home", "/", { title: "KeyHold | Dubai Real Estate" }, "fr");
}

export default function HomePageFr() {
  return <HomeContent locale="fr" />;
}
