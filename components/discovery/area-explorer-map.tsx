"use client";

import type { AreaProfile } from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: { eyebrow: "Area explorer", title: "Explore Dubai visually.", note: "Schematic / not to scale. Use for discovery only, not navigation." },
  fr: { eyebrow: "Explorateur de quartiers", title: "Explorez Dubaï visuellement.", note: "Schématique / non à l’échelle. À utiliser pour la découverte uniquement, pas pour la navigation." },
} as const;

type AreaExplorerMapProps = {
  areas: AreaProfile[];
  selectedAreaSlugs: string[];
  onToggleArea: (slug: string) => void;
  locale?: KeyHoldLocale;
};

export function AreaExplorerMap({ areas, selectedAreaSlugs, onToggleArea, locale = "en" }: AreaExplorerMapProps) {
  const copy = COPY[locale];
  return (
    <div className="border border-[var(--color-teal)]/20 bg-[var(--color-teal-soft)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-teal-deep)]">{copy.eyebrow}</p>
          <h3 className="font-display mt-2 text-2xl tracking-[-0.03em]">{copy.title}</h3>
        </div>
        <p className="max-w-xs text-right text-[0.7rem] leading-5 text-[var(--color-stone)]">{copy.note}</p>
      </div>
      <div className="relative mt-6 aspect-[16/9] sm:min-h-64 overflow-hidden border border-black/[0.08] bg-[var(--color-soft-white)]">
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <path d="M7 87 C17 70, 18 60, 25 45 C34 27, 48 19, 66 14 C78 12, 89 18, 95 30 L95 86 Z" fill="var(--color-sage-soft)" opacity="0.95" />
          <path d="M15 84 C28 69, 32 57, 38 45 C46 30, 57 24, 72 20" fill="none" stroke="var(--color-stone)" strokeWidth="0.55" strokeDasharray="2 2" opacity="0.55" />
          <path d="M20 89 C28 80, 33 72, 38 63" fill="none" stroke="var(--color-teal)" strokeWidth="0.7" opacity="0.6" />
        </svg>
        {areas.map((area) => {
          const selected = selectedAreaSlugs.includes(area.slug);
          return (
            <button
              key={area.slug}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleArea(area.slug)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-[0.68rem] font-semibold shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                selected
                  ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-[var(--color-soft-white)]"
                  : "border-black/10 bg-[color:rgba(252,251,248,0.94)] text-[var(--color-graphite)] hover:border-[var(--color-teal)]"
              }`}
              style={{ left: `${area.mapPosition.x}%`, top: `${area.mapPosition.y}%` }}
            >
              {area.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
