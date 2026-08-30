import type { Metadata } from "next";
import { InvestmentCalculatorContent } from "@/app/investment-calculator/page";
import { websitePageMetadata } from "@/lib/cms/website-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("investment-calculator", "/investment-calculator", { title: "Investment Calculator" }, "fr");
}

export default function InvestmentCalculatorPageFr() {
  return <InvestmentCalculatorContent locale="fr" />;
}
