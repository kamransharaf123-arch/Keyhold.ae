import type { Metadata } from "next";
import { PrivacyContent } from "@/app/privacy/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("privacy", "/privacy", { title: "Privacy Policy" }, "fr");
}

export default function PrivacyPageFr() {
  return <PrivacyContent locale="fr" />;
}
