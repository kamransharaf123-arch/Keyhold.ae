"use client";

import { useState, useTransition } from "react";
import { saveProjectAction } from "@/app/client-actions";

const COPY = {
  en: { save: "Save", saved: "Saved", unavailable: "This property cannot be saved yet." },
  fr: { save: "Enregistrer", saved: "Enregistré", unavailable: "Ce bien ne peut pas encore être enregistré." },
} as const;

export function SaveProjectButton({ slug, locale = "en" }: { slug: string; locale?: "en" | "fr" }) {
  const [saved, setSaved] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [pending, startTransition] = useTransition();
  const copy = COPY[locale];

  if (unavailable) {
    return <p className="text-sm text-[var(--color-stone)]">{copy.unavailable}</p>;
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      disabled={pending}
      className="button min-h-11 border border-black/10 hover:bg-[var(--color-bone)]"
      onClick={() => startTransition(async () => {
        const result = await saveProjectAction({ slug, locale });
        if (result.unavailable) setUnavailable(true);
        else if (result.saved !== undefined) setSaved(result.saved);
      })}
    >
      {pending ? "…" : saved ? copy.saved : copy.save}
    </button>
  );
}
