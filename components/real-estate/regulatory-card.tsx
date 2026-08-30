import Image from "next/image";
import type { RegulatoryInfo } from "@/types/real-estate";
import { formatDateTimeDubai } from "@/lib/format";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    eyebrow: "Regulatory information", verified: "Verified project reference", pending: "Verification pending",
    permitPrefix: "Permit / advertising reference:",
    noPermit: "No permit number or QR code is published in this demo record. Production data must only be displayed after verification against the appropriate official or authorised source.",
    verifiedAt: "Verified", openSource: "Open verification source", qrAlt: "Project regulatory verification QR code",
  },
  fr: {
    eyebrow: "Informations réglementaires", verified: "Référence de projet vérifiée", pending: "Vérification en attente",
    permitPrefix: "Référence de permis / publicité :",
    noPermit: "Aucun numéro de permis ni code QR n’est publié dans ce dossier de démonstration. Les données de production ne doivent être affichées qu’après vérification auprès de la source officielle ou autorisée appropriée.",
    verifiedAt: "Vérifié le", openSource: "Ouvrir la source de vérification", qrAlt: "Code QR de vérification réglementaire du projet",
  },
} as const;

export function RegulatoryCard({ regulatory, locale = "en" }: { regulatory: RegulatoryInfo; locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  const isVerified = regulatory.registrationStatus === "verified";

  return (
    <div className="border border-black/10 bg-[var(--color-bone)] p-6 lg:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h3 className="font-display mt-3 text-2xl">{isVerified ? copy.verified : copy.pending}</h3>
          {isVerified && regulatory.permitNumber ? (
            <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">{copy.permitPrefix} <strong className="font-medium text-[var(--color-graphite)]">{regulatory.permitNumber}</strong></p>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">
              {copy.noPermit}
            </p>
          )}
          {regulatory.verifiedAt ? <p className="mt-2 text-xs text-[var(--color-stone)]">{copy.verifiedAt} {formatDateTimeDubai(regulatory.verifiedAt, locale)}</p> : null}
          {isVerified && regulatory.verificationUrl ? (
            <a href={regulatory.verificationUrl} target="_blank" rel="noreferrer" className="text-link mt-5 inline-block">{copy.openSource}</a>
          ) : null}
        </div>
        {isVerified && regulatory.qrCodeImage ? (
          <div className="relative size-28 shrink-0 border border-black/10 bg-white">
            <Image src={regulatory.qrCodeImage} alt={copy.qrAlt} fill sizes="112px" className="object-contain p-2" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
