import type { Metadata } from "next";
import { ProjectCategoryPage } from "@/components/project-category-page";

export const metadata: Metadata = { title: "Short-Term Rentals" };

export default function ShortTermRentalsPage() {
  return <ProjectCategoryPage category="Short-Term" eyebrow="Projects · Short-Term Rentals" title="Flexible Dubai stays, curated properly." description="Short-term rental opportunities presented with the same considered visual language as the wider KeyHold platform." />;
}
