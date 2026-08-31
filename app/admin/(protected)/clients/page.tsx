import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { cmsSelect } from "@/lib/cms/rest";
import { evaluateClientWatchlistsAction } from "@/app/admin/client-actions";

export const metadata = { robots: { index: false, follow: false } };

type Row = { user_id: string; email: string; full_name: string; status: string; preferred_locale: string; advisor_user_id: string | null; created_at: string };

export default async function ClientsAdminPage() {
  await requireAdmin();
  const clients = await cmsSelect<Row>("client_profiles", "select=user_id,email,full_name,status,preferred_locale,advisor_user_id,created_at&order=created_at.desc&limit=100");
  return <div><div><p className="text-xs uppercase tracking-[0.18em] text-[var(--color-teal)]">Client Portal</p><h1 className="mt-2 text-3xl font-semibold">Clients</h1><p className="mt-3 text-sm text-[var(--color-stone)]">Private accounts, advisor assignment, portfolio, payments, documents and notes.</p><form action={evaluateClientWatchlistsAction} className="mt-4"><button type="submit" className="button button-light">Evaluate watchlists now</button></form></div><div className="mt-6 overflow-x-auto rounded-[24px] border border-black/8 bg-[var(--color-soft-white)]"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-black/8 text-left text-xs uppercase tracking-[0.12em] text-[var(--color-stone)]"><th className="p-4">Client</th><th className="p-4">Status</th><th className="p-4">Locale</th><th className="p-4">Advisor</th><th className="p-4"></th></tr></thead><tbody>{clients.map((c)=><tr key={c.user_id} className="border-b border-black/6 last:border-0"><td className="p-4"><p className="font-medium">{c.full_name || c.email}</p><p className="mt-1 text-xs text-[var(--color-stone)]">{c.email}</p></td><td className="p-4">{c.status}</td><td className="p-4 uppercase">{c.preferred_locale}</td><td className="p-4">{c.advisor_user_id ? "Assigned" : "—"}</td><td className="p-4 text-right"><Link href={`/admin/clients/${c.user_id}`} className="text-[var(--color-teal)]">Open →</Link></td></tr>)}</tbody></table></div></div>;
}
