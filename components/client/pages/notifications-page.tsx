import { NotificationList } from "@/components/client/notification-list";
import { EmptyState } from "@/components/client/client-ui";
import { markAllNotificationsReadAction } from "@/app/client-actions";
import { requireClientContext } from "@/lib/client/session";
import { getClientNotifications } from "@/lib/client/queries";
import type { ClientLocale } from "@/types/client-portal";

export async function ClientNotificationsPage({ locale }: { locale: ClientLocale }) {
  const { accessToken } = await requireClientContext(locale);
  const items = await getClientNotifications(accessToken, 50);
  if (!items.length) return <EmptyState title={locale === "fr" ? "Aucune notification" : "No notifications"} text={locale === "fr" ? "Les mises à jour importantes apparaîtront ici." : "Important account updates will appear here."}/>;
  return <div><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-semibold">Notifications</h1>{items.some((i)=>!i.isRead)?<form action={markAllNotificationsReadAction}><input type="hidden" name="locale" value={locale}/><button className="button button-light" type="submit">{locale === "fr" ? "Tout marquer comme lu" : "Mark all read"}</button></form>:null}</div><div className="mt-6"><NotificationList locale={locale} notifications={items}/></div></div>;
}
