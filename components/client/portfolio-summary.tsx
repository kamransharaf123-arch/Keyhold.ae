import { ClientMetric, formatAed } from "@/components/client/client-ui";
import type { ClientDashboardSummary, ClientLocale } from "@/types/client-portal";

const COPY = {
  en: {
    portfolioValue: "Portfolio value", portfolioValueNote: "Estimated values are informational, not guaranteed.",
    paidToDate: "Paid to date", upcomingPayments: "Upcoming payments", properties: "Properties",
  },
  fr: {
    portfolioValue: "Valeur du portefeuille", portfolioValueNote: "Les valeurs estimées sont indicatives et non garanties.",
    paidToDate: "Payé à ce jour", upcomingPayments: "Paiements à venir", properties: "Biens",
  },
} as const;

export function PortfolioSummary({ summary, locale = "en" }: { summary: ClientDashboardSummary; locale?: ClientLocale }) {
  const copy = COPY[locale];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ClientMetric label={copy.portfolioValue} value={formatAed(summary.portfolioEstimatedValueAed)} note={copy.portfolioValueNote} />
      <ClientMetric label={copy.paidToDate} value={formatAed(summary.paidToDateAed)} />
      <ClientMetric label={copy.upcomingPayments} value={formatAed(summary.upcomingPaymentsAed)} />
      <ClientMetric label={copy.properties} value={String(summary.portfolioCount)} />
    </div>
  );
}
