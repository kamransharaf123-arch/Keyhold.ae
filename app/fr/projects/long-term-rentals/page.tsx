import type { Metadata } from "next";
import { LongTermRentalsContent } from "@/app/(en)/projects/long-term-rentals/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("long-term-rentals", "/projects/long-term-rentals", { title: "Long-Term Rentals" }, "fr");
}

export default function LongTermRentalsPageFr() {
  return <LongTermRentalsContent locale="fr" />;
}
