import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { websitePageByKey } from "@/data/website-content";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    eyebrow: "Who We Are",
    title: "A more considered way to navigate Dubai property.",
    description: "KeyHold is being built as a premium real estate advisory platform that combines strong presentation with better context, transparency and long-term client tools.",
    pov: "Our point of view",
    heading: "Real estate should feel informed, not rushed.",
    paragraphs: [
      "Dubai moves quickly. KeyHold is designed to create a calmer layer between the volume of the market and the decisions a buyer, investor, owner or tenant actually needs to make.",
      "KeyHold is designed to combine project discovery with deeper investment analysis, construction visibility, private client tools and long-term owner support within one coherent experience.",
    ],
    principlesEyebrow: "Principles",
    principles: [
      ["Clarity", "Property information should be understandable, sourced and useful enough to support a real decision."],
      ["Selectivity", "More inventory is not automatically better. KeyHold is designed around considered curation."],
      ["Context", "Price alone says very little. Payment timing, fees, supply, liquidity and exit strategy matter too."],
      ["Continuity", "The relationship should continue through construction, handover, rental, management and eventual resale."],
    ],
  },
  fr: {
    eyebrow: "Qui sommes-nous",
    title: "Une approche plus réfléchie de l’immobilier à Dubaï.",
    description: "KeyHold est conçu comme une plateforme de conseil immobilier haut de gamme, alliant une présentation soignée à plus de contexte, de transparence et d’outils client sur le long terme.",
    pov: "Notre point de vue",
    heading: "L’immobilier devrait être informé, pas précipité.",
    paragraphs: [
      "Dubaï évolue vite. KeyHold est conçu pour créer une couche plus posée entre le volume du marché et les décisions qu’un acheteur, investisseur, propriétaire ou locataire doit réellement prendre.",
      "KeyHold associe la découverte de projets à une analyse d’investissement plus approfondie, une visibilité sur la construction, des outils privés et un accompagnement de long terme au sein d’une même expérience cohérente.",
    ],
    principlesEyebrow: "Principes",
    principles: [
      ["Clarté", "L’information immobilière doit être compréhensible, sourcée et utile pour soutenir une véritable décision."],
      ["Sélectivité", "Plus d’inventaire n’est pas automatiquement mieux. KeyHold est conçu autour d’une sélection réfléchie."],
      ["Contexte", "Le prix seul en dit très peu. Le calendrier des paiements, les frais, l’offre, la liquidité et la stratégie de sortie comptent aussi."],
      ["Continuité", "La relation doit se poursuivre pendant la construction, la livraison, la location, la gestion et la revente éventuelle."],
    ],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("who-we-are", "/who-we-are", { title: "Who We Are", description: "Discover the KeyHold approach to Dubai real estate advisory." }, "en");
}

export function WhoWeAreContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const page = websitePageByKey("who-we-are", locale);
  const copy = COPY[locale];
  return (
    <>
      <PageHero eyebrow={page?.eyebrow || copy.eyebrow} title={page?.heroTitle || copy.title} description={page?.heroSubtitle || copy.description} />
      <section className="site-container py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="eyebrow">{copy.pov}</p>
            <h2 className="font-display mt-4 text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">{copy.heading}</h2>
          </div>
          <div className="max-w-3xl space-y-6 text-base leading-8 text-[var(--color-stone)]">
            {copy.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      </section>
      <section className="bg-[var(--color-bone)]">
        <div className="site-container py-20 lg:py-28">
          <p className="eyebrow">{copy.principlesEyebrow}</p>
          <div className="mt-8 grid border-l border-t border-black/10 md:grid-cols-2">
            {copy.principles.map(([title, text], index) => (
              <div key={title} className="min-h-64 border-b border-r border-black/10 p-7 sm:p-9">
                <span className="text-xs text-[var(--color-stone)]">0{index + 1}</span>
                <h3 className="font-display mt-14 text-3xl tracking-[-0.03em]">{title}</h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--color-stone)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}

export default function WhoWeArePage() {
  return <WhoWeAreContent locale="en" />;
}
