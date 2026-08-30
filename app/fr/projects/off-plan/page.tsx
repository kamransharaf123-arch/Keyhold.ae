import type { Metadata } from "next";
import { OffPlanContent } from "@/app/(en)/projects/off-plan/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("off-plan", "/projects/off-plan", { title: "Off-Plan Projects" }, "fr");
}

export default function OffPlanPageFr() {
  return <OffPlanContent locale="fr" />;
}
