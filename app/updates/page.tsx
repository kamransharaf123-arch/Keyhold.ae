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
      <PageHero
        eyebrow="Updates"
        title="Construction progress, presented clearly."
        description="A dedicated home for ongoing project updates, progress milestones and future verified construction media."
      />
      <section className="site-container py-16 lg:py-24">
        <div className="mb-10 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">
          Construction information should always be read together with its update date and source. KeyHold presents project progress as a timeline so investors can understand how a development is moving over time.
        </div>
        <div>{updates.map((update) => <UpdateCard key={update.slug} update={update} />)}</div>
      </section>
    </>
  );
}
