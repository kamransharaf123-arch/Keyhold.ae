import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectComparison } from "@/components/discovery/project-comparison";
import { areas, developers, projects } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Compare Projects",
  description: "Compare selected KeyHold Dubai property projects side by side.",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="site-container py-16 text-sm text-[var(--color-stone)]">Loading comparison…</div>}>
      <ProjectComparison projects={projects} developers={developers} areas={areas} />
    </Suspense>
  );
}
