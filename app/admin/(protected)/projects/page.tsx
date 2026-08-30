import Link from "next/link";
import { AdminNotice, AdminPageHeader, StatusPill } from "@/components/admin/admin-ui";
import { listAdminProjects } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await requireAdmin();
  const [projects, query] = await Promise.all([listAdminProjects(), searchParams]);
  return (
    <>
      <AdminPageHeader eyebrow="Inventory" title="Projects" description="Create a project once, then connect units, images, floor plans, payment milestones, documents, updates and intelligence to the same record." actions={<Link href="/admin/projects/new" className="button button-dark">Add project</Link>} />
      <AdminNotice notice={query.notice} />
      <div className="overflow-x-auto border border-black/10 bg-[var(--color-soft-white)]">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead><tr className="border-b border-black/10 text-xs uppercase tracking-[0.08em] text-[var(--color-stone)]"><th className="p-4">Project</th><th className="p-4">Category</th><th className="p-4">Location</th><th className="p-4">Status</th><th className="p-4">Updated</th><th className="p-4"></th></tr></thead>
          <tbody>{projects.map((project) => <tr key={project.id} className="border-b border-black/[0.07]"><td className="p-4 font-semibold">{project.title}<span className="mt-1 block text-xs font-normal text-[var(--color-stone)]">/{project.slug}</span></td><td className="p-4">{project.category}</td><td className="p-4">{project.location}</td><td className="p-4"><StatusPill status={project.status} /></td><td className="p-4 text-xs text-[var(--color-stone)]">{new Date(project.updated_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" })}</td><td className="p-4 text-right"><Link href={`/admin/projects/${project.id}`} className="text-link">Edit</Link></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
