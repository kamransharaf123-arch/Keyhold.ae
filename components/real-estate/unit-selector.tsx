"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectUnit, UnitAvailability } from "@/types/real-estate";
import { formatAed, formatDateTimeDubai } from "@/lib/format";

const availabilityCopy: Record<UnitAvailability, string> = {
  available: "Shown available*",
  reserved: "Shown reserved*",
  sold: "Shown sold*",
  unknown: "Confirm availability*",
};

export function UnitSelector({ units, projectSlug }: { units: ProjectUnit[]; projectSlug?: string }) {
  const bedrooms = useMemo(() => [...new Set(units.map((unit) => unit.bedrooms))].sort((a, b) => a - b), [units]);
  const [bedroomFilter, setBedroomFilter] = useState<number | "all">("all");

  const filtered = bedroomFilter === "all" ? units : units.filter((unit) => unit.bedrooms === bedroomFilter);

  if (units.length === 0) {
    return (
      <div className="border border-black/10 bg-[var(--color-bone)] p-6 text-sm leading-7 text-[var(--color-stone)]">
        No unit-level inventory is displayed. Request the latest availability from a KeyHold advisor.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter units by bedroom count">
        <button type="button" onClick={() => setBedroomFilter("all")} aria-pressed={bedroomFilter === "all"} className={`min-h-11 border px-4 text-sm transition-colors ${bedroomFilter === "all" ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-black/10 hover:bg-[var(--color-bone)]"}`}>All units</button>
        {bedrooms.map((count) => (
          <button key={count} type="button" onClick={() => setBedroomFilter(count)} aria-pressed={bedroomFilter === count} className={`min-h-11 border px-4 text-sm transition-colors ${bedroomFilter === count ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-black/10 hover:bg-[var(--color-bone)]"}`}>{count} BR</button>
        ))}
      </div>

      <div className="overflow-x-auto border border-black/10">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[var(--color-bone)] text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-stone)]">
            <tr>
              <th className="px-4 py-4">Unit</th>
              <th className="px-4 py-4">Floor</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Size</th>
              <th className="px-4 py-4">View</th>
              <th className="px-4 py-4">Price / rate</th>
              <th className="px-4 py-4">Status</th>
              {projectSlug ? <th className="px-4 py-4">Analysis</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((unit) => (
              <tr key={unit.id} className="border-t border-black/10 align-top">
                <td className="px-4 py-4 font-medium">{unit.unitNumber}</td>
                <td className="px-4 py-4 text-[var(--color-stone)]">{unit.floor}</td>
                <td className="px-4 py-4 text-[var(--color-stone)]">{unit.bedrooms} BR · {unit.propertyType}</td>
                <td className="px-4 py-4 text-[var(--color-stone)]">{new Intl.NumberFormat("en-US").format(unit.sizeSqft)} sqft</td>
                <td className="px-4 py-4 text-[var(--color-stone)]">{unit.view}</td>
                <td className="px-4 py-4 font-medium">{unit.priceAed === null ? "On request" : formatAed(unit.priceAed, { compact: true })}</td>
                <td className="px-4 py-4">
                  <span className="block font-medium">{availabilityCopy[unit.availability]}</span>
                  <span className="mt-1 block text-[0.68rem] text-[var(--color-stone)]">Checked {formatDateTimeDubai(unit.lastVerifiedAt)}</span>
                </td>
                {projectSlug ? (
                  <td className="px-4 py-4">
                    {unit.priceAed !== null ? (
                      <Link
                        href={`/projects/${projectSlug}?investmentUnit=${encodeURIComponent(unit.id)}#investment`}
                        className="text-link whitespace-nowrap"
                      >
                        Simulate unit
                      </Link>
                    ) : (
                      <span className="text-xs text-[var(--color-stone)]">Price required</span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
        <strong className="font-semibold text-[var(--color-graphite)]">* Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice.</strong> Prices, rates, unit numbers and status must be re-confirmed before reservation, offer or payment.
      </div>
    </div>
  );
}
