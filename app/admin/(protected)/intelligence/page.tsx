import Link from "next/link";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-ui";
import { listAdminProjects } from "@/lib/admin/queries";
import { cmsSelect } from "@/lib/cms/rest";
import { requireAdmin } from "@/lib/admin/session";

export default async function IntelligenceAdminPage() {
  await requireAdmin();
  const [projects, profiles] = await Promise.all([listAdminProjects(), cmsSelect<{ project_id: string; data_status: string; last_reviewed_at: string }>("cms_intelligence_profiles", "select=project_id,data_status,last_reviewed_at")]);
  const profileByProject = new Map(profiles.map((p) => [p.project_id, p]));
  return <><AdminPageHeader eyebrow="Analysis" title="KeyHold Intelligence" description="Manage scoring inputs, risk dimensions, comparables, supply pipeline, view intelligence, verdicts and source provenance." /><div className="grid gap-3">{projects.map((project) => { const profile = profileByProject.get(project.id); return <Link key={project.id} href={`/admin/intelligence/${project.id}`} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-[var(--color-soft-white)] p-4 transition-colors hover:bg-[var(--color-teal-soft)]"><div><p className="font-semibold">{project.title}</p><p className="mt-1 text-xs text-[var(--color-stone)]">{profile ? `Reviewed ${new Date(profile.last_reviewed_at).toLocaleDateString("en-GB")}` : "No intelligence profile yet"}</p></div><StatusPill status={profile?.data_status ?? "not modelled"} /></Link>; })}</div></>;
}
