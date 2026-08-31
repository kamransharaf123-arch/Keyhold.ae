import Link from "next/link";
import { ClientCard, EmptyState } from "@/components/client/client-ui";
import { deleteComparisonAction } from "@/app/client-actions";
import { requireClientContext } from "@/lib/client/session";
import { getClientSavedComparisons } from "@/lib/client/queries";
import { clientRest } from "@/lib/client/rest";
import type { ClientLocale } from "@/types/client-portal";
import { projectsForLocale } from "@/data/localized-catalog";

export async function ClientComparePage({ locale }: { locale: ClientLocale }) {
  const { accessToken } = await requireClientContext(locale);
  const comparisons = await getClientSavedComparisons(accessToken);
  if (!comparisons.length) return <EmptyState title={locale === "fr" ? "Aucune comparaison enregistrée" : "No saved comparisons"} text={locale === "fr" ? "Comparez des projets puis enregistrez la sélection pour la retrouver ici." : "Compare projects, then save the selection to return to it here."} action={<Link className="button button-dark" href={locale === "fr" ? "/fr/compare" : "/compare"}>{locale === "fr" ? "Comparer" : "Compare"}</Link>}/>;
  const ids = Array.from(new Set(comparisons.flatMap((c)=>c.projectIds)));
  const rows = ids.length ? await clientRest<Array<{id:string;slug:string;title:string}>>(`cms_projects?select=id,slug,title&id=in.(${ids.join(",")})`, { token: accessToken }) : [];
  const localized = new Map(projectsForLocale(locale).map((project)=>[project.slug, project]));
  const byId = new Map(rows.map((r)=>[r.id,{...r,title: localized.get(r.slug)?.title ?? r.title}]));
  return <div><h1 className="text-3xl font-semibold">{locale === "fr" ? "Comparaisons enregistrées" : "Saved Comparisons"}</h1><div className="mt-6 grid gap-4">{comparisons.map((c)=>{const projects=c.projectIds.map((id)=>byId.get(id)).filter(Boolean) as Array<{id:string;slug:string;title:string}>; const href=`${locale === "fr" ? "/fr" : ""}/compare?projects=${projects.map((p)=>p.slug).join(",")}`; return <ClientCard key={c.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{c.name}</h2><p className="mt-2 text-sm text-[var(--color-stone)]">{projects.map((p)=>p.title).join(" · ") || "—"}</p></div><div className="flex gap-3"><Link className="button button-light" href={href}>{locale === "fr" ? "Ouvrir" : "Open"}</Link><form action={deleteComparisonAction}><input type="hidden" name="locale" value={locale}/><input type="hidden" name="id" value={c.id}/><button className="button button-light" type="submit">{locale === "fr" ? "Supprimer" : "Delete"}</button></form></div></div></ClientCard>})}</div></div>;
}
