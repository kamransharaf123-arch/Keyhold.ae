"use client";

import { useState, useTransition } from "react";
import { saveInvestmentAnalysisAction } from "@/app/client-actions";

export function SaveAnalysisButton(props: {
  locale: "en" | "fr";
  projectSlug?: string | null;
  unitId?: string | null;
  scenarioKey?: string | null;
  name: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending || saved} className="button border border-black/10 hover:bg-[var(--color-bone)]" onClick={() => startTransition(async () => {
    const result = await saveInvestmentAnalysisAction({
      locale: props.locale,
      projectSlug: props.projectSlug,
      unitId: props.unitId,
      scenarioKey: props.scenarioKey,
      name: props.name,
      inputsJson: JSON.stringify(props.inputs),
      outputsJson: JSON.stringify(props.outputs),
    });
    if (result?.saved) setSaved(true);
  })}>{saved ? (props.locale === "fr" ? "Analyse enregistrée" : "Analysis saved") : pending ? "…" : (props.locale === "fr" ? "Enregistrer l’analyse" : "Save analysis")}</button>;
}
