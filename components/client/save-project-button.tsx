"use client";

import { useState, useTransition } from "react";
import { saveProjectAction } from "@/app/client-actions";
import { BookmarkIcon } from "@/components/icons";

const COPY = {
  en: { save: "Save", saved: "Saved", unavailable: "This property cannot be saved yet." },
  fr: { save: "Enregistrer", saved: "Enregistré", unavailable: "Ce bien ne peut pas encore être enregistré." },
} as const;

export function SaveProjectButton({ slug, locale = "en", compact = false }: { slug: string; locale?: "en" | "fr"; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [pending, startTransition] = useTransition();
  const copy = COPY[locale];

  if (unavailable) {
    return compact ? null : <p className="text-sm text-[var(--color-stone)]">{copy.unavailable}</p>;
  }

  const toggle = () => startTransition(async () => {
    const result = await saveProjectAction({ slug, locale });
    if (result.unavailable) setUnavailable(true);
    else if (result.saved !== undefined) setSaved(result.saved);
  });

  if (compact) {
    return (
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? copy.saved : copy.save}
        disabled={pending}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggle();
        }}
        className="kh-card-favorite grid size-10 place-items-center rounded-full bg-[color:rgba(21,29,27,0.42)] text-white backdrop-blur-sm"
      >
        <BookmarkIcon filled={saved} className="size-[1.05rem]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      disabled={pending}
      className="button inline-flex min-h-11 items-center gap-2 border border-black/10 hover:bg-[var(--color-bone)]"
      onClick={toggle}
    >
      <BookmarkIcon filled={saved} className="size-4" />
      {pending ? "…" : saved ? copy.saved : copy.save}
    </button>
  );
}
