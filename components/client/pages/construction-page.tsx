import Link from "next/link";
import { ClientCard, EmptyState } from "@/components/client/client-ui";
import { requireClientContext } from "@/lib/client/session";
import { getClientConstructionUpdates } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";

export async function ClientConstructionPage({ locale }: { locale: ClientLocale }) {
  const { accessToken } = await requireClientContext(locale);
  const updates = await getClientConstructionUpdates(accessToken, locale);
  if (!updates.length) return <EmptyState title={locale === "fr" ? "Aucun projet en construction suivi" : "No tracked construction yet"} text={locale === "fr" ? "Les dernières mises à jour des projets de votre portefeuille apparaîtront ici." : "The latest construction updates for projects in your portfolio will appear here."}/>;
  return <div><h1 className="text-3xl font-semibold">{locale === "fr" ? "Suivi construction" : "Construction Tracking"}</h1><div className="mt-6 grid gap-4">{updates.map((u)=><ClientCard key={u.projectId}><div className="flex flex-wrap justify-between gap-4"><div><p className="text-sm font-medium">{u.statusLabel}</p><p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">{u.summary}</p></div><p className="text-3xl font-semibold text-[var(--color-teal)]">{u.progress}%</p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-black/8"><div className="h-full rounded-full bg-[var(--color-teal)]" style={{width:`${Math.max(0,Math.min(100,u.progress))}%`}}/></div><div className="mt-4"><Link href={`${locale === "fr" ? "/fr" : ""}/updates/${u.slug}`} className="text-sm text-[var(--color-teal)]">{locale === "fr" ? "Voir la mise à jour →" : "View update →"}</Link></div></ClientCard>)}</div></div>;
}
