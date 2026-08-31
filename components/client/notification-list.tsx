import Link from "next/link";
import type { ClientNotification, ClientLocale } from "@/types/client-portal";
import { markNotificationReadAction } from "@/app/client-actions";
import { localizedHref } from "@/lib/i18n/locale";

export function NotificationList({ locale, notifications }: { locale: ClientLocale; notifications: ClientNotification[] }) {
  return (
    <div className="grid gap-3">
      {notifications.map((item) => (
        <article key={item.id} className={`rounded-2xl border p-4 ${item.isRead ? "border-black/8 bg-[var(--color-soft-white)]" : "border-[var(--color-teal)]/25 bg-[var(--color-teal-soft)]"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-graphite)]">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-stone)]">{item.body}</p>
              <p className="mt-2 text-xs text-[var(--color-stone)]">{new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium" }).format(new Date(item.createdAt))}</p>
            </div>
            <div className="flex gap-2">
              {item.href ? <Link href={localizedHref(item.href, locale)} className="button button-light text-xs">{locale === "fr" ? "Ouvrir" : "Open"}</Link> : null}
              {!item.isRead ? (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <button type="submit" className="button button-light text-xs">{locale === "fr" ? "Marquer comme lu" : "Mark read"}</button>
                </form>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
