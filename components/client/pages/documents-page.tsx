import { ClientCard, EmptyState } from "@/components/client/client-ui";
import { requireClientContext } from "@/lib/client/session";
import { getClientDocuments } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";

export async function ClientDocumentsPage({ locale }: { locale: ClientLocale }) {
  const { accessToken } = await requireClientContext(locale);
  const docs = await getClientDocuments(accessToken);
  if (!docs.length) return <EmptyState title={locale === "fr" ? "Aucun document privé" : "No private documents yet"} text={locale === "fr" ? "Les documents de réservation, SPA, reçus et éléments DLD apparaîtront ici lorsqu'ils seront ajoutés à votre dossier." : "Reservation, SPA, receipts and DLD documents will appear here when added to your file."} />;
  return <div><h1 className="text-3xl font-semibold">Documents</h1><p className="mt-3 text-sm text-[var(--color-stone)]">{locale === "fr" ? "Chaque téléchargement utilise un lien privé de courte durée." : "Every download uses a short-lived private link."}</p><div className="mt-6 grid gap-3">{docs.map((doc) => <ClientCard key={doc.id} className="p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-medium">{doc.label}</p><p className="mt-1 text-xs text-[var(--color-stone)]">{doc.category} · {doc.fileName}</p></div><a href={`/api/client/documents/${doc.id}`} className="button button-light" rel="nofollow">{locale === "fr" ? "Télécharger" : "Download"}</a></div></ClientCard>)}</div></div>;
}
