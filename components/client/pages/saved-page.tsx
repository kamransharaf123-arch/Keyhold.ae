import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/client/client-ui";
import { removeSavedProjectAction } from "@/app/client-actions";
import { requireClientContext } from "@/lib/client/session";
import { getClientSavedProjects } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";

export async function ClientSavedPage({ locale }: { locale: ClientLocale }) {
  const { accessToken } = await requireClientContext(locale);
  const saved = await getClientSavedProjects(accessToken, locale);
  if (!saved.length) return <EmptyState title={locale === "fr" ? "Aucun bien enregistré" : "No saved properties yet"} text={locale === "fr" ? "Enregistrez un projet depuis sa fiche pour le retrouver ici." : "Save a project from its property page and it will appear here."} action={<Link href={locale === "fr" ? "/fr/discover" : "/discover"} className="button button-dark">{locale === "fr" ? "Découvrir" : "Discover"}</Link>} />;
  return <div><h1 className="text-3xl font-semibold">{locale === "fr" ? "Biens enregistrés" : "Saved Properties"}</h1><div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{saved.map((item) => <article key={item.projectId} className="group overflow-hidden rounded-[26px] border border-black/8 bg-[var(--color-soft-white)]"><Link href={`${locale === "fr" ? "/fr" : ""}/projects/${item.slug}`} className="block"><div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-warm-ivory)]">{item.heroImageUrl ? <Image src={item.heroImageUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : null}</div><div className="p-5 pb-3"><p className="text-xs uppercase tracking-[0.14em] text-[var(--color-teal)]">{item.category}</p><h2 className="mt-2 text-xl font-semibold">{item.title}</h2><p className="mt-2 text-sm text-[var(--color-stone)]">{item.location} · {item.bedroomsLabel}</p></div></Link><form action={removeSavedProjectAction} className="px-5 pb-5"><input type="hidden" name="locale" value={locale}/><input type="hidden" name="projectId" value={item.projectId}/><button type="submit" className="text-sm text-[var(--color-terracotta)]">{locale === "fr" ? "Retirer" : "Remove"}</button></form></article>)}</div></div>;
}
