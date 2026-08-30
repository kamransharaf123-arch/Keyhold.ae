import Link from "next/link";
import { AdminCard, AdminNotice, AdminPageHeader } from "@/components/admin/admin-ui";
import { dashboardCounts, listAdminProjects } from "@/lib/admin/queries";
import { getCmsEnvironment } from "@/lib/cms/config";
import { requireAdmin } from "@/lib/admin/session";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  await requireAdmin();
  const [counts, projects, query] = await Promise.all([dashboardCounts(), listAdminProjects(), searchParams]);
  const env = getCmsEnvironment();
  const published = projects.filter((item) => item.status === "published").length;
  const drafts = projects.filter((item) => item.status === "draft").length;
  return (
    <>
      <AdminPageHeader eyebrow="Control centre" title="KeyHold Admin" description="The CMS is the source of truth for live inventory. Save changes here, then trigger a production deploy when you are ready to publish them." actions={<Link href="/admin/projects/new" className="button button-dark">Add project</Link>} />
      <AdminNotice notice={query.notice} error={query.error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[["Projects", counts.projects], ["Published", published], ["Drafts", drafts], ["Units", counts.units], ["Updates", counts.updates]].map(([label, value]) => <div key={String(label)} className="border border-black/10 bg-[var(--color-soft-white)] p-5"><p className="text-xs uppercase tracking-[0.12em] text-[var(--color-stone)]">{label}</p><p className="font-display mt-2 text-4xl">{value}</p></div>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminCard eyebrow="Publishing" title="CMS → Netlify workflow">
          <ol className="grid gap-3 text-sm leading-7 text-[var(--color-stone)]">
            <li><strong className="text-[var(--color-graphite)]">1.</strong> Edit and verify content in the CMS.</li>
            <li><strong className="text-[var(--color-graphite)]">2.</strong> Publish individual records when their data is ready.</li>
            <li><strong className="text-[var(--color-graphite)]">3.</strong> Use “Publish site” to trigger a Netlify build.</li>
            <li><strong className="text-[var(--color-graphite)]">4.</strong> The prebuild sync creates the static KeyHold snapshot and preserves fast project pages.</li>
          </ol>
          <p className="mt-4 text-xs text-[var(--color-stone)]">Netlify build hook: {env.netlifyBuildHookUrl ? "Configured" : "Not configured"}</p>
        </AdminCard>
        <AdminCard eyebrow="Safety" title="Publication discipline">
          <ul className="grid gap-2 text-sm leading-7 text-[var(--color-stone)]">
            <li>• Unit availability must always be recently confirmed.</li>
            <li>• Do not mark intelligence evidence as Verified without retained provenance.</li>
            <li>• Regulatory permit / QR information should be checked before public advertising.</li>
            <li>• Investment figures must remain assumptions unless their source is explicitly recorded.</li>
            <li>• Archived projects are excluded from the public snapshot.</li>
          </ul>
        </AdminCard>
      </div>
    </>
  );
}
