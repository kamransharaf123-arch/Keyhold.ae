import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { UpdateCard } from "@/components/update-card";
import { updates } from "@/data/site";

export const metadata: Metadata = {
  title: "Construction Updates",
  description: "Follow project construction progress and update history through KeyHold.",
};

export default function UpdatesPage() {
  return (
    <>
      <PageHero eyebrow="Updates" title="Construction progress, presented clearly." description="A dedicated home for ongoing project updates, progress milestones and verified construction media." />
      <section className="site-container py-16 lg:py-24">
        <div className="mb-10 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">
          Construction information should always be read together with its update date and source. The Module 2 records below are demo data used to prove the timeline architecture.
        </div>
        {updates.length > 0 ? <div>{updates.map((update) => <UpdateCard key={update.slug} update={update} />)}</div> : <p className="text-sm text-[var(--color-stone)]">No construction updates are currently displayed.</p>}
      </section>
    </>
  );
}
