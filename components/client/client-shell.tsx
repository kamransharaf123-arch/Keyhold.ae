import Link from "next/link";
import type { ReactNode } from "react";
import { clientCopy, clientPath } from "@/lib/client/locale";
import type { ClientLocale, ClientUser } from "@/types/client-portal";
import { logoutClientAction } from "@/app/client-actions";

export function ClientShell({ locale, user, children }: { locale: ClientLocale; user: ClientUser; children: ReactNode }) {
  const copy = clientCopy[locale];
  const items = [
    ["", copy.overview], ["/saved", copy.saved], ["/watchlist", copy.watchlist], ["/compare", copy.comparisons],
    ["/portfolio", copy.portfolio], ["/payments", copy.payments], ["/construction", copy.construction], ["/documents", copy.documents],
    ["/analyses", copy.analyses], ["/notifications", copy.notifications], ["/advisor", copy.advisor], ["/profile", copy.profile],
  ] as const;

  return (
    <div className="site-container py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="self-start rounded-[28px] border border-black/8 bg-[var(--color-soft-white)] p-4 lg:sticky lg:top-28">
          <div className="px-2 pb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-teal)]">{copy.portal}</p>
            <p className="mt-2 truncate text-sm font-medium text-[var(--color-graphite)]">{user.fullName || user.email}</p>
          </div>
          <nav aria-label={copy.portal} className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {items.map(([path, label]) => (
              <Link key={path} href={clientPath(locale, path)} className="rounded-xl px-3 py-2.5 text-sm text-[var(--color-graphite)] transition-colors hover:bg-[var(--color-teal-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)]">
                {label}
              </Link>
            ))}
          </nav>
          <form action={logoutClientAction} className="mt-4 border-t border-black/8 pt-4">
            <input type="hidden" name="locale" value={locale} />
            <button className="min-h-11 w-full rounded-xl px-3 text-left text-sm text-[var(--color-stone)] hover:bg-[var(--color-warm-ivory)]" type="submit">{copy.signOut}</button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
