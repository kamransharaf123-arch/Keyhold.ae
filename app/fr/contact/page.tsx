import type { Metadata } from "next";
import { ContactContent } from "@/app/(en)/contact/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("contact", "/contact", { title: "Contact" }, "fr");
}

export default function ContactPageFr() {
  return <ContactContent locale="fr" />;
}
