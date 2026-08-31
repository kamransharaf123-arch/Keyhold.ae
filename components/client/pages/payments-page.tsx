import { ClientCard, EmptyState, formatAed } from "@/components/client/client-ui";
import { requireClientContext } from "@/lib/client/session";
import { getClientPayments } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";
import { clientEnumLabel } from "@/lib/client/locale";

export async function ClientPaymentsPage({ locale }: { locale: ClientLocale }) {
  const { accessToken } = await requireClientContext(locale);
  const items = await getClientPayments(accessToken);
  if (!items.length) return <EmptyState title={locale === "fr" ? "Aucun paiement enregistré" : "No payment schedule recorded"} text={locale === "fr" ? "Les échéances liées à vos acquisitions seront affichées ici lorsqu'elles seront confirmées." : "Confirmed payment obligations related to your acquisitions will appear here."} />;
  return <div><h1 className="text-3xl font-semibold">{locale === "fr" ? "Calendrier des paiements" : "Payment Calendar"}</h1><div className="mt-6 grid gap-3">{items.map((item) => <ClientCard key={item.id} className="p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-medium">{item.label}</p><p className="mt-1 text-sm text-[var(--color-stone)]">{new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${item.dueDate}T00:00:00Z`))}</p></div><div className="text-right"><p className="font-semibold">{formatAed(item.amountAed)}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--color-teal)]">{clientEnumLabel(locale, item.status)}</p></div></div></ClientCard>)}</div></div>;
}
