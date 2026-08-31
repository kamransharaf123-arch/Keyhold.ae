"use client";

import { useState, useTransition } from "react";
import { saveComparisonAction } from "@/app/client-actions";

export function SaveComparisonButton({ slugs, locale = "en" }: { slugs: string[]; locale?: "en" | "fr" }) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  if (slugs.length < 2) return null;
  return (
    <button type="button" disabled={pending || done} className="button border border-black/10 hover:bg-[var(--color-bone)]" onClick={() => startTransition(async () => {
      const result = await saveComparisonAction({ slugs: slugs.slice(0, 4), locale });
      if (result?.saved) setDone(true);
    })}>
      {done ? (locale === "fr" ? "Comparaison enregistrée" : "Comparison saved") : pending ? "…" : (locale === "fr" ? "Enregistrer la comparaison" : "Save comparison")}
    </button>
  );
}
