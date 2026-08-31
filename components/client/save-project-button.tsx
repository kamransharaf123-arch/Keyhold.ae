"use client";

import { useState, useTransition } from "react";
import { saveProjectAction } from "@/app/client-actions";

export function SaveProjectButton({ slug, locale = "en" }: { slug: string; locale?: "en" | "fr" }) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-pressed={saved}
      disabled={pending}
      className="button min-h-11 border border-black/10 hover:bg-[var(--color-bone)]"
      onClick={() => startTransition(async () => {
        const result = await saveProjectAction({ slug, locale });
        if (result?.saved !== undefined) setSaved(result.saved);
      })}
    >
      {pending ? "…" : saved ? (locale === "fr" ? "Enregistré" : "Saved") : (locale === "fr" ? "Enregistrer" : "Save")}
    </button>
  );
}
