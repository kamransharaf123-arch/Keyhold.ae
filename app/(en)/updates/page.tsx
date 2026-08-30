import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { UpdateCard } from "@/components/update-card";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedUpdates } from "@/lib/i18n/localized-site";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Updates", title: "Construction progress, presented clearly.", description: "A dedicated home for ongoing project updates, progress milestones and verified construction media.", note: "Construction information should always be read together with its update date and source. The Module 2 records below are demo data used to prove the timeline architecture.", empty: "No construction updates are currently displayed." },
  fr: { eyebrow: "Avancement", title: "L’avancement des chantiers, présenté clairement.", description: "Un espace dédié aux mises à jour de projets, aux étapes clés et aux médias de construction vérifiés.", note: "Les informations de construction doivent toujours être lues avec leur date de mise à jour et leur source. Les données ci-dessous sont des données de démonstration.", empty: "Aucune mise à jour de construction n’est actuellement affichée." },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("updates", "/updates", { title: "Construction Updates", description: "Follow project construction progress and update history through KeyHold." }, "en");
}

export function UpdatesContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("updates", locale);
  const copy = COPY[locale];
  const updates = localizedUpdates(locale);
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <section className="site-container py-16 lg:py-24">
        <div className="mb-10 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">{copy.note}</div>
        {updates.length > 0 ? <div>{updates.map((update) => <UpdateCard key={update.slug} update={update} locale={locale} />)}</div> : <p className="text-sm text-[var(--color-stone)]">{copy.empty}</p>}
      </section>
    </>
  );
}

export default function UpdatesPage() {
  return <UpdatesContent locale="en" />;
}
