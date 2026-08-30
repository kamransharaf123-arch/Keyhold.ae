import { AdminPageHeader } from "@/components/admin/admin-ui";
import { listAuditLog } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";

export default async function AuditPage() {
  await requireAdmin();
  const rows = await listAuditLog(150);
  return (
    <>
      <AdminPageHeader eyebrow="Governance" title="Audit Log" description="A read-only trail of CMS edits, uploads, publication changes and deploy triggers. Keep this history intact for accountability." />
      <div className="overflow-x-auto border border-black/10 bg-[var(--color-soft-white)]">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead><tr className="border-b border-black/10 text-xs uppercase tracking-[0.08em] text-[var(--color-stone)]"><th className="p-4">Time</th><th className="p-4">Action</th><th className="p-4">Entity</th><th className="p-4">Summary</th><th className="p-4">User</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id} className="border-b border-black/[0.07]"><td className="p-4 text-xs text-[var(--color-stone)]">{new Date(row.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" })}</td><td className="p-4 font-semibold">{row.action}</td><td className="p-4">{row.entity_type}{row.entity_id ? <span className="mt-1 block max-w-48 truncate text-xs text-[var(--color-stone)]">{row.entity_id}</span> : null}</td><td className="p-4">{row.summary}</td><td className="p-4 max-w-48 truncate text-xs text-[var(--color-stone)]">{row.user_id ?? "system"}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
