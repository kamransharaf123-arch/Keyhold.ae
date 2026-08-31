import { ClientCard, EmptyState } from "@/components/client/client-ui";
import { requireClientContext } from "@/lib/client/session";
import { getClientAdvisorNotes } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";

export async function ClientAdvisorPage({ locale }: { locale: ClientLocale }) {
  const { user, accessToken } = await requireClientContext(locale);
  const notes = await getClientAdvisorNotes(accessToken);
  return <div className="grid gap-6"><div><h1 className="text-3xl font-semibold">{locale === "fr" ? "Votre conseiller" : "Your Advisor"}</h1><p className="mt-3 text-sm text-[var(--color-stone)]">{user.advisorUserId ? (locale === "fr" ? "Un conseiller KeyHold est assigné à votre compte." : "A KeyHold advisor is assigned to your account.") : (locale === "fr" ? "Aucun conseiller n'est encore assigné." : "No advisor has been assigned yet.")}</p></div>{notes.length?<div className="grid gap-3">{notes.map((n)=><ClientCard key={n.id} className={n.isPinned?"border-[var(--color-champagne)]/35":""}><p className="text-sm leading-7">{n.body}</p><p className="mt-3 text-xs text-[var(--color-stone)]">{new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB",{dateStyle:"medium"}).format(new Date(n.createdAt))}</p></ClientCard>)}</div>:<EmptyState title={locale === "fr" ? "Aucune note de conseiller" : "No advisor notes"} text={locale === "fr" ? "Les recommandations privées de votre conseiller apparaîtront ici." : "Private notes and recommendations from your advisor will appear here."}/>}</div>;
}
