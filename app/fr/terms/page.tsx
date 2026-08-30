import type { Metadata } from "next";
import { TermsContent } from "@/app/(en)/terms/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("terms", "/terms", { title: "Terms & Conditions" }, "fr");
}

export default function TermsPageFr() {
  return <TermsContent locale="fr" />;
}
