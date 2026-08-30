import type { Metadata } from "next";
import { ShortTermRentalsContent } from "@/app/(en)/projects/short-term-rentals/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("short-term-rentals", "/projects/short-term-rentals", { title: "Short-Term Rentals" }, "fr");
}

export default function ShortTermRentalsPageFr() {
  return <ShortTermRentalsContent locale="fr" />;
}
