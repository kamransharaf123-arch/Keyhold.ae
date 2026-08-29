import type { Metadata } from "next";
import { ProjectCategoryPage } from "@/components/project-category-page";

export const metadata: Metadata = { title: "Ready Properties" };

export default function ReadyPage() {
  return <ProjectCategoryPage category="Ready" eyebrow="Projects · Ready" title="Completed property, ready for the next move." description="A refined catalogue for completed Dubai homes, designed around availability, comparables, ownership costs and informed decision-making." />;
}
