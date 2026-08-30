import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction, triggerLiveDeployAction } from "@/app/admin/actions";
import type { AdminUser } from "@/types/admin";

const links = [
  ["Dashboard", "/admin"],
  ["Projects", "/admin/projects"],
  ["Developers", "/admin/developers"],
  ["Areas", "/admin/areas"],
  ["Construction Updates", "/admin/updates"],
  ["Intelligence", "/admin/intelligence"],
  ["Content", "/admin/content"],
  ["Site Settings", "/admin/settings"],
  ["Audit Log", "/admin/audit"],
] as const;

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  return (
    <div className="admin-root bg-[var(--color-bone)] py-8 lg:py-12">
      <div className="site-container grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0 self-start border border-black/10 bg-[var(--color-soft-white)] p-4 lg:sticky lg:top-28">
          <div className="border-b border-black/10 pb-4">
            <p className="eyebrow">KeyHold Admin</p>
            <p className="mt-2 truncate text-sm font-semibold">{user.email}</p>
            <p className="mt-1 text-xs capitalize text-[var(--color-stone)]">{user.role}</p>
          </div>
          <nav aria-label="Admin" className="mt-3 grid gap-1">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-sm px-3 py-2.5 text-sm transition-colors hover:bg-[var(--color-teal-soft)] hover:text-[var(--color-teal-deep)]">
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 grid gap-2 border-t border-black/10 pt-4">
            {user.role === "owner" || user.role === "admin" ? (
              <form action={triggerLiveDeployAction}>
                <button type="submit" className="button button-dark w-full text-xs">Publish site</button>
              </form>
            ) : null}
            <Link href="/" className="button w-full border border-black/10 text-xs">View public site</Link>
            <form action={signOutAction}>
              <button type="submit" className="w-full px-3 py-2 text-left text-xs text-[var(--color-stone)] hover:text-[var(--color-graphite)]">Sign out</button>
            </form>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
