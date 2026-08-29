import Image from "next/image";
import type { RegulatoryInfo } from "@/types/real-estate";
import { formatDateTimeDubai } from "@/lib/format";

export function RegulatoryCard({ regulatory }: { regulatory: RegulatoryInfo }) {
  const isVerified = regulatory.registrationStatus === "verified";

  return (
    <div className="border border-black/10 bg-[var(--color-bone)] p-6 lg:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow">Regulatory information</p>
          <h3 className="font-display mt-3 text-2xl">{isVerified ? "Verified project reference" : "Verification pending"}</h3>
          {isVerified && regulatory.permitNumber ? (
            <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">Permit / advertising reference: <strong className="font-medium text-[var(--color-graphite)]">{regulatory.permitNumber}</strong></p>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[var(--color-stone)]">
              No permit number or QR code is published in this demo record. Production data must only be displayed after verification against the appropriate official or authorised source.
            </p>
          )}
          {regulatory.verifiedAt ? <p className="mt-2 text-xs text-[var(--color-stone)]">Verified {formatDateTimeDubai(regulatory.verifiedAt)}</p> : null}
          {isVerified && regulatory.verificationUrl ? (
            <a href={regulatory.verificationUrl} target="_blank" rel="noreferrer" className="text-link mt-5 inline-block">Open verification source</a>
          ) : null}
        </div>
        {isVerified && regulatory.qrCodeImage ? (
          <div className="relative size-28 shrink-0 border border-black/10 bg-white">
            <Image src={regulatory.qrCodeImage} alt="Project regulatory verification QR code" fill sizes="112px" className="object-contain p-2" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
