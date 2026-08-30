"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectUnit, UnitAvailability } from "@/types/real-estate";
import { formatAed, formatDateTimeDubai } from "@/lib/format";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

const availabilityCopy: Record<KeyHoldLocale, Record<UnitAvailability, string>> = {
  en: { available: "Shown available*", reserved: "Shown reserved*", sold: "Shown sold*", unknown: "Confirm availability*" },
  fr: { available: "Disponible affiché*", reserved: "Réservé affiché*", sold: "Vendu affiché*", unknown: "Confirmer la disponibilité*" },
};

const COPY = {
  en: {
    allUnits: "All units", unit: "Unit", floor: "Floor", type: "Type", size: "Size", view: "View", price: "Price / rate", status: "Status", analysis: "Analysis",
    onRequest: "On request", checked: "Checked", simulate: "Simulate unit", priceRequired: "Price required", empty: "No unit-level inventory is displayed. Request the latest availability from a KeyHold advisor.",
    disclaimerStrong: "* Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice.",
    disclaimerRest: "Prices, rates, unit numbers and status must be re-confirmed before reservation, offer or payment.",
    filterAriaLabel: "Filter units by bedroom count", br: "BR", sqft: "sqft",
  },
  fr: {
    allUnits: "Toutes les unités", unit: "Unité", floor: "Étage", type: "Type", size: "Surface", view: "Vue", price: "Prix / tarif", status: "Statut", analysis: "Analyse",
    onRequest: "Sur demande", checked: "Vérifié le", simulate: "Simuler l’unité", priceRequired: "Prix requis", empty: "Aucun inventaire au niveau des unités n’est affiché. Demandez la disponibilité la plus récente à un conseiller KeyHold.",
    disclaimerStrong: "* La disponibilité des unités dépend de la disponibilité actuelle du promoteur/vendeur, doit être confirmée et peut changer sans préavis.",
    disclaimerRest: "Les prix, tarifs, numéros d’unité et statuts doivent être reconfirmés avant toute réservation, offre ou paiement.",
    filterAriaLabel: "Filtrer les unités par nombre de chambres", br: "ch.", sqft: "pi²",
  },
} as const;

export function UnitSelector({ units, projectSlug, locale = "en" }: { units: ProjectUnit[]; projectSlug?: string; locale?: KeyHoldLocale }) {
  const bedrooms = useMemo(() => [...new Set(units.map((unit) => unit.bedrooms))].sort((a, b) => a - b), [units]);
  const [bedroomFilter, setBedroomFilter] = useState<number | "all">("all");
  const copy = COPY[locale];
  const availability = availabilityCopy[locale];

  const filtered = bedroomFilter === "all" ? units : units.filter((unit) => unit.bedrooms === bedroomFilter);

  if (units.length === 0) {
    return (
      <div className="border border-black/10 bg-[var(--color-bone)] p-6 text-sm leading-7 text-[var(--color-stone)]">
        {copy.empty}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" aria-label={copy.filterAriaLabel}>
        <button type="button" onClick={() => setBedroomFilter("all")} aria-pressed={bedroomFilter === "all"} className={`min-h-11 border px-4 text-sm transition-colors ${bedroomFilter === "all" ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-black/10 hover:bg-[var(--color-bone)]"}`}>{copy.allUnits}</button>
        {bedrooms.map((count) => (
          <button key={count} type="button" onClick={() => setBedroomFilter(count)} aria-pressed={bedroomFilter === count} className={`min-h-11 border px-4 text-sm transition-colors ${bedroomFilter === count ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-black/10 hover:bg-[var(--color-bone)]"}`}>{count} {copy.br}</button>
        ))}
      </div>

      <div className="overflow-x-auto border border-black/10">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[var(--color-bone)] text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-stone)]">
            <tr>
              <th className="px-4 py-4">{copy.unit}</th>
              <th className="px-4 py-4">{copy.floor}</th>
              <th className="px-4 py-4">{copy.type}</th>
              <th className="px-4 py-4">{copy.size}</th>
              <th className="px-4 py-4">{copy.view}</th>
              <th className="px-4 py-4">{copy.price}</th>
              <th className="px-4 py-4">{copy.status}</th>
              {projectSlug ? <th className="px-4 py-4">{copy.analysis}</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((unit) => (
              <tr key={unit.id} className="border-t border-black/10 align-top">
                <td className="px-4 py-4 font-medium">{unit.unitNumber}</td>
                <td className="px-4 py-4 text-[var(--color-stone)]">{unit.floor}</td>
                <td className="px-4 py-4 text-[var(--color-stone)]">{unit.bedrooms} {copy.br} · {unit.propertyType}</td>
                <td className="px-4 py-4 text-[var(--color-stone)]">{new Intl.NumberFormat("en-US").format(unit.sizeSqft)} {copy.sqft}</td>
                <td className="px-4 py-4 text-[var(--color-stone)]">{unit.view}</td>
                <td className="px-4 py-4 font-medium">{unit.priceAed === null ? copy.onRequest : formatAed(unit.priceAed, { compact: true })}</td>
                <td className="px-4 py-4">
                  <span className="block font-medium">{availability[unit.availability]}</span>
                  <span className="mt-1 block text-[0.68rem] text-[var(--color-stone)]">{copy.checked} {formatDateTimeDubai(unit.lastVerifiedAt, locale)}</span>
                </td>
                {projectSlug ? (
                  <td className="px-4 py-4">
                    {unit.priceAed !== null ? (
                      <Link
                        href={`${localizedHref(`/projects/${projectSlug}`, locale)}?investmentUnit=${encodeURIComponent(unit.id)}#investment`}
                        className="text-link whitespace-nowrap"
                      >
                        {copy.simulate}
                      </Link>
                    ) : (
                      <span className="text-xs text-[var(--color-stone)]">{copy.priceRequired}</span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
        <strong className="font-semibold text-[var(--color-graphite)]">{copy.disclaimerStrong}</strong> {copy.disclaimerRest}
      </div>
    </div>
  );
}
