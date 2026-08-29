import type { Metadata } from "next";
import { ProjectCategoryPage } from "@/components/project-category-page";

export const metadata: Metadata = { title: "Long-Term Rentals" };

export default function LongTermRentalsPage() {
  return <ProjectCategoryPage category="Long-Term" eyebrow="Projects · Long-Term Rentals" title="Long-term homes across Dubai." description="Annual rental opportunities across Dubai, presented with a clean path from discovery to direct advisor contact." />;
}
