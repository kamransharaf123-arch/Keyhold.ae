import { ClientCard, EmptyState } from "@/components/client/client-ui";
import { deleteInvestmentAnalysisAction } from "@/app/client-actions";
import { requireClientContext } from "@/lib/client/session";
import { getClientAnalyses } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";
import { clientEnumLabel } from "@/lib/client/locale";

export async function ClientAnalysesPage({ locale }: { locale: ClientLocale }) {
  const { accessToken } = await requireClientContext(locale);
  const analyses = await getClientAnalyses(accessToken);
  if (!analyses.length) return <EmptyState title={locale === "fr" ? "Aucune analyse enregistrée" : "No saved analyses"} text={locale === "fr" ? "Le simulateur d'investissement pourra enregistrer ici vos scénarios sans modifier ses calculs." : "The investment simulator can save your scenarios here without changing its calculations."}/>;
  return <div><h1 className="text-3xl font-semibold">{locale === "fr" ? "Analyses enregistrées" : "Saved Analyses"}</h1><div className="mt-6 grid gap-4">{analyses.map((a)=><ClientCard key={a.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-semibold">{a.name}</h2><p className="mt-1 text-xs text-[var(--color-stone)]">{clientEnumLabel(locale, a.scenarioKey || "custom")} · {new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB",{dateStyle:"medium"}).format(new Date(a.createdAt))}</p></div><form action={deleteInvestmentAnalysisAction}><input type="hidden" name="locale" value={locale}/><input type="hidden" name="id" value={a.id}/><button type="submit" className="text-sm text-[var(--color-terracotta)]">{locale === "fr" ? "Supprimer" : "Delete"}</button></form></div></ClientCard>)}</div></div>;
}
