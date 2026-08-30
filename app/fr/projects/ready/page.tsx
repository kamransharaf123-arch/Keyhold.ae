import type { Metadata } from "next";
import { ReadyContent } from "@/app/(en)/projects/ready/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("ready", "/projects/ready", { title: "Ready Properties" }, "fr");
}

export default function ReadyPageFr() {
  return <ReadyContent locale="fr" />;
}
