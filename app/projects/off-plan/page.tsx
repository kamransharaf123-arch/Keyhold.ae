import type { Metadata } from "next";
import { ProjectCategoryPage } from "@/components/project-category-page";

export const metadata: Metadata = { title: "Off-Plan Projects" };

export default function OffPlanPage() {
  return <ProjectCategoryPage category="Off-Plan" eyebrow="Projects · Off-Plan" title="New projects, before handover." description="A curated view of Dubai projects under development, designed to later connect with payment plans, construction updates and investment analysis." />;
}
