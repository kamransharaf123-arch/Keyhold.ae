import Link from "next/link";
import { ClientCard, EmptyState, formatAed } from "@/components/client/client-ui";
import { requireClientContext } from "@/lib/client/session";
import { getClientPortfolio } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";
import { clientEnumLabel } from "@/lib/client/locale";

export async function ClientPortfolioPage({ locale }: { locale: ClientLocale }) {
  const { accessToken } = await requireClientContext(locale);
  const assets = await getClientPortfolio(accessToken, locale);
  if (!assets.length) return <EmptyState title={locale === "fr" ? "Votre portefeuille apparaîtra ici" : "Your portfolio will appear here"} text={locale === "fr" ? "Une fois une réservation ou acquisition enregistrée par KeyHold, vous pourrez suivre le bien, les paiements et les documents ici." : "Once KeyHold records a reservation or acquisition, you can track the property, payments and documents here."} />;
  return <div><h1 className="text-3xl font-semibold">{locale === "fr" ? "Portefeuille" : "Portfolio"}</h1><div className="mt-6 grid gap-4">{assets.map((asset) => <ClientCard key={asset.id}><div className="grid gap-4 md:grid-cols-[1fr_auto]"><div><p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sage)]">{clientEnumLabel(locale, asset.ownershipStatus)}</p><h2 className="mt-2 text-xl font-semibold">{asset.project?.title || asset.customTitle || (locale === "fr" ? "Bien privé" : "Private property")}</h2><p className="mt-2 text-sm text-[var(--color-stone)]">{asset.project?.location}{asset.unit ? ` · ${locale === "fr" ? "Unité" : "Unit"} ${asset.unit.unitNumber} · ${asset.unit.sizeSqft.toLocaleString()} ${locale === "fr" ? "pi²" : "sqft"}` : ""}</p></div><div className="grid grid-cols-2 gap-3 md:text-right"><div><p className="text-xs text-[var(--color-stone)]">{locale === "fr" ? "Achat" : "Purchase"}</p><p className="font-semibold">{formatAed(asset.purchasePriceAed)}</p></div><div><p className="text-xs text-[var(--color-stone)]">{locale === "fr" ? "Valeur estimée" : "Estimated value"}</p><p className="font-semibold">{formatAed(asset.estimatedValueAed ?? asset.purchasePriceAed)}</p></div></div></div>{asset.project ? <div className="mt-4"><Link href={`${locale === "fr" ? "/fr" : ""}/projects/${asset.project.slug}`} className="text-sm text-[var(--color-teal)]">{locale === "fr" ? "Voir le projet →" : "View project →"}</Link></div> : null}</ClientCard>)}</div></div>;
}
