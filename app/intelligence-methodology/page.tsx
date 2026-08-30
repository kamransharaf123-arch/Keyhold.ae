import type { Metadata } from "next";
import Link from "next/link";
import { websitePageMetadata } from "@/lib/cms/website-metadata";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

const weights = [
  ["Rental potential", "20%"],
  ["Capital growth", "20%"],
  ["Developer", "15%"],
  ["Liquidity", "15%"],
  ["Payment structure", "15%"],
  ["Supply resilience", "15%"],
];

const COPY = {
  en: {
    eyebrow: "Methodology", title: "How KeyHold Intelligence is meant to work.",
    intro: "The purpose of the intelligence layer is not to disguise opinions as certainty. It separates inputs, sources, calculations and analyst judgement so a client can see what is known, what is estimated and what still requires verification.",
    scoreEyebrow: "Investment Score", scoreTitle: "Weighted, visible and reproducible.",
    scoreBody: "Each dimension is scored from 0 to 10. The overall score is the weighted average below. A high score is not a guarantee of profit and should never replace transaction-specific due diligence.",
    riskEyebrow: "Risk Radar", riskTitle: "Higher means more modelled risk.",
    riskBody1: "Risk dimensions use a 0–10 scale where 0 represents lower modelled risk and 10 represents higher modelled risk. The overall band uses the simple average: Low ≤3, Moderate ≤5, Elevated ≤7, High >7.",
    riskBody2: "Risk dimensions cover developer, construction, future supply, rental and liquidity exposure. They are analytical indicators, not probabilities of loss.",
    marketEyebrow: "Market Position", marketTitle: "Comparator positioning, not a valuation.",
    marketBody1: "The subject price per sqft is compared with the median price per sqft of the displayed comparator set. Bands are: below median at ≤−8%, slightly below between −8% and −3%, near median between −3% and +3%, slightly above between +3% and +8%, and above median at ≥+8%.",
    marketBody2: "The result must not be labelled an appraisal or definitive “overpriced / underpriced” judgement.",
    sourceEyebrow: "Source Status", sourceTitle: "Every important figure carries provenance.",
    demo: "Demo placeholder:", demoText: "built only to exercise the product and must not be presented as current market evidence.",
    pending: "Pending verification:", pendingText: "a source exists or has been entered but has not completed the required review.",
    verified: "Verified:", verifiedText: "may only be used when the production workflow records the actual source, reviewer, timestamp and verification requirements.",
    pubEyebrow: "Publication rule", pubTitle: "No source, no claim.",
    pubBody: "Module 5 intentionally ships with demo-placeholder intelligence. Production CMS workflows should prevent a score, comparable, developer-delivery claim, supply estimate, price-history point or “verified” badge from being published without the required provenance. KeyHold verdicts should identify both positive factors and material watch items.",
    back: "Back to KeyHold Intelligence",
  },
  fr: {
    eyebrow: "Méthodologie", title: "Comment fonctionne KeyHold Intelligence.",
    intro: "L’objectif de la couche d’intelligence n’est pas de déguiser des opinions en certitudes. Elle sépare les données, les sources, les calculs et le jugement analytique afin qu’un client puisse voir ce qui est connu, ce qui est estimé et ce qui reste à vérifier.",
    scoreEyebrow: "Score d’investissement", scoreTitle: "Pondéré, visible et reproductible.",
    scoreBody: "Chaque dimension est notée de 0 à 10. Le score global est la moyenne pondérée ci-dessous. Un score élevé n’est pas une garantie de profit et ne remplace jamais une diligence spécifique à la transaction.",
    riskEyebrow: "Radar de risque", riskTitle: "Plus le chiffre est élevé, plus le risque modélisé est important.",
    riskBody1: "Les dimensions de risque utilisent une échelle de 0 à 10, où 0 représente un risque modélisé plus faible et 10 un risque plus élevé. La bande globale utilise la moyenne simple : Faible ≤3, Modéré ≤5, Élevé ≤7, Très élevé >7.",
    riskBody2: "Les dimensions de risque couvrent l’exposition au promoteur, à la construction, à l’offre future, à la location et à la liquidité. Ce sont des indicateurs analytiques, non des probabilités de perte.",
    marketEyebrow: "Position de marché", marketTitle: "Un positionnement comparatif, pas une évaluation.",
    marketBody1: "Le prix au pied carré du bien est comparé à la médiane du groupe de comparables affiché. Les bandes sont : en dessous de la médiane à ≤−8 %, légèrement en dessous entre −8 % et −3 %, proche de la médiane entre −3 % et +3 %, légèrement au-dessus entre +3 % et +8 %, et au-dessus à ≥+8 %.",
    marketBody2: "Le résultat ne doit pas être présenté comme une expertise ou un jugement définitif « surévalué / sous-évalué ».",
    sourceEyebrow: "Statut de la source", sourceTitle: "Chaque donnée importante porte une provenance.",
    demo: "Espace réservé de démonstration :", demoText: "créé uniquement pour tester le produit et ne doit pas être présenté comme une preuve de marché actuelle.",
    pending: "Vérification en attente :", pendingText: "une source existe ou a été saisie mais n’a pas terminé la revue requise.",
    verified: "Vérifié :", verifiedText: "ne peut être utilisé que lorsque le flux de production enregistre la source réelle, le relecteur, l’horodatage et les exigences de vérification.",
    pubEyebrow: "Règle de publication", pubTitle: "Pas de source, pas d’affirmation.",
    pubBody: "Le Module 5 est volontairement livré avec une intelligence de type espace réservé. Les flux de production CMS doivent empêcher la publication d’un score, d’un comparable, d’une affirmation de livraison promoteur, d’une estimation d’offre, d’un point d’historique de prix ou d’un badge « vérifié » sans la provenance requise. Les verdicts KeyHold doivent identifier à la fois les facteurs positifs et les points de vigilance importants.",
    back: "Retour à KeyHold Intelligence",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return websitePageMetadata("intelligence-methodology", "/intelligence-methodology", { title: "Intelligence Methodology", description: "How KeyHold project scores, risk indicators, market position and source statuses are calculated and communicated." }, "en");
}

export function IntelligenceMethodologyContent({ locale = "en" as KeyHoldLocale }: { locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  return (
    <div className="site-container py-12 lg:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="display-title mt-4 text-5xl sm:text-6xl">{copy.title}</h1>
        <p className="mt-6 text-base leading-8 text-[var(--color-stone)]">{copy.intro}</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="border border-black/10 p-6 sm:p-8">
          <p className="eyebrow">{copy.scoreEyebrow}</p>
          <h2 className="font-display mt-3 text-3xl">{copy.scoreTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{copy.scoreBody}</p>
          <dl className="mt-6">{weights.map(([label, weight]) => <div key={label} className="flex items-center justify-between border-b border-black/10 py-3 text-sm"><dt>{label}</dt><dd className="font-medium">{weight}</dd></div>)}</dl>
        </section>

        <section className="border border-black/10 p-6 sm:p-8">
          <p className="eyebrow">{copy.riskEyebrow}</p>
          <h2 className="font-display mt-3 text-3xl">{copy.riskTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{copy.riskBody1}</p>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{copy.riskBody2}</p>
        </section>

        <section className="border border-black/10 p-6 sm:p-8">
          <p className="eyebrow">{copy.marketEyebrow}</p>
          <h2 className="font-display mt-3 text-3xl">{copy.marketTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{copy.marketBody1}</p>
          <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{copy.marketBody2}</p>
        </section>

        <section className="border border-black/10 p-6 sm:p-8">
          <p className="eyebrow">{copy.sourceEyebrow}</p>
          <h2 className="font-display mt-3 text-3xl">{copy.sourceTitle}</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-stone)]">
            <p><strong className="text-[var(--color-graphite)]">{copy.demo}</strong> {copy.demoText}</p>
            <p><strong className="text-[var(--color-graphite)]">{copy.pending}</strong> {copy.pendingText}</p>
            <p><strong className="text-[var(--color-graphite)]">{copy.verified}</strong> {copy.verifiedText}</p>
          </div>
        </section>
      </div>

      <section className="mt-8 border border-black/10 bg-[var(--color-bone)] p-6 sm:p-8">
        <p className="eyebrow">{copy.pubEyebrow}</p>
        <h2 className="font-display mt-3 text-3xl">{copy.pubTitle}</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--color-stone)]">{copy.pubBody}</p>
        <Link href={localizedHref("/intelligence", locale)} className="button button-dark mt-6">{copy.back}</Link>
      </section>
    </div>
  );
}

export default function IntelligenceMethodologyPage() {
  return <IntelligenceMethodologyContent locale="en" />;
}
