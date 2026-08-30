import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { DiscoveryExplorer } from "@/components/discovery/discovery-explorer";
import { areas, developers, projects } from "@/data/real-estate";

export const metadata: Metadata = {
  title: "Discover Dubai Property",
  description: "Search and filter KeyHold Dubai property by area, developer, payment plan, handover, lifestyle, available cash and more.",
};

export default function DiscoverPage() {
  return (
    <>
      <PageHero
        eyebrow="Search & discovery"
        title="Find property around the way you actually invest and live."
        description="Search by project, area, developer, property route, payment structure, cash available today, lifestyle and current unit availability."
      />
      <Suspense fallback={<div className="site-container py-16 text-sm text-[var(--color-stone)]">Loading discovery tools…</div>}>
        <DiscoveryExplorer projects={projects} developers={developers} areas={areas} />
      </Suspense>
    </>
  );
}
