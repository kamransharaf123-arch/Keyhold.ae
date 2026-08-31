import Link from "next/link";
import { PortfolioSummary } from "@/components/client/portfolio-summary";
import { ClientCard, ClientMetric, formatAed } from "@/components/client/client-ui";
import { clientPath } from "@/lib/client/locale";
import { requireClientContext } from "@/lib/client/session";
import { getClientAdvisorNotes, getClientDashboardSummary, getClientNotifications } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";

export async function ClientDashboardPage({ locale }: { locale: ClientLocale }) {
  const { user, accessToken } = await requireClientContext(locale);
  const [summary, notifications, notes] = await Promise.all([
    getClientDashboardSummary(accessToken),
    getClientNotifications(accessToken, 4),
    getClientAdvisorNotes(accessToken),
  ]);
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-teal)]">{locale === "fr" ? "Vue privée" : "Private overview"}</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--color-graphite)] sm:text-4xl">{locale === "fr" ? `Bonjour ${user.fullName || ""}` : `Welcome ${user.fullName || ""}`}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-stone)]">{locale === "fr" ? "Votre portefeuille, vos paiements et vos suivis KeyHold au même endroit." : "Your KeyHold portfolio, payments and property tracking in one place."}</p>
      </div>
      <PortfolioSummary summary={summary} locale={locale} />
      <div className="grid gap-4 xl:grid-cols-3">
        <ClientMetric label={locale === "fr" ? "Biens enregistrés" : "Saved properties"} value={String(summary.savedCount)} />
        <ClientMetric label={locale === "fr" ? "Documents" : "Documents"} value={String(summary.documentCount)} />
        <ClientMetric label={locale === "fr" ? "Analyses" : "Saved analyses"} value={String(summary.analysisCount)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ClientCard>
          <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{locale === "fr" ? "À surveiller" : "What needs attention"}</h2><Link href={clientPath(locale, "/payments")} className="text-sm text-[var(--color-teal)]">{locale === "fr" ? "Paiements" : "Payments"}</Link></div>
          <p className="mt-5 text-3xl font-semibold">{formatAed(summary.upcomingPaymentsAed)}</p>
          <p className="mt-2 text-sm text-[var(--color-stone)]">{locale === "fr" ? "Paiements à venir, dus ou en retard selon les données enregistrées par KeyHold." : "Upcoming, due or overdue payments currently recorded by KeyHold."}</p>
        </ClientCard>
        <ClientCard>
          <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{locale === "fr" ? "Notifications" : "Notifications"}</h2><Link href={clientPath(locale, "/notifications")} className="text-sm text-[var(--color-teal)]">{summary.unreadNotifications} {locale === "fr" ? "non lues" : "unread"}</Link></div>
          <div className="mt-4 grid gap-3">{notifications.length ? notifications.map((item) => <div key={item.id} className="rounded-xl bg-[var(--color-warm-ivory)] p-3"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-stone)]">{item.body}</p></div>) : <p className="text-sm text-[var(--color-stone)]">{locale === "fr" ? "Aucune nouvelle notification." : "No new notifications."}</p>}</div>
        </ClientCard>
      </div>
      {notes[0] ? <ClientCard className="border-[var(--color-champagne)]/30"><p className="text-xs uppercase tracking-[0.18em] text-[var(--color-champagne)]">{locale === "fr" ? "Note de votre conseiller" : "Your advisor's note"}</p><p className="mt-3 text-sm leading-7 text-[var(--color-graphite)]">{notes[0].body}</p></ClientCard> : null}
    </div>
  );
}
