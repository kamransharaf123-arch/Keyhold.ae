import { saveConstructionUpdateAction } from "@/app/admin/actions";
import { AdminCard, AdminNotice, AdminPageHeader, Field, StatusPill, inputClass, selectClass, textareaClass } from "@/components/admin/admin-ui";
import { listAdminProjects, listConstructionUpdates } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";

function UpdateForm({ update, projects }: { update?: Awaited<ReturnType<typeof listConstructionUpdates>>[number]; projects: Awaited<ReturnType<typeof listAdminProjects>> }) {
  return (
    <form action={saveConstructionUpdateAction} className="grid gap-4 md:grid-cols-2">
      {update ? <input type="hidden" name="id" value={update.id} /> : null}
      <Field label="Project"><select className={selectClass} name="project_id" required defaultValue={update?.project_id ?? ""}><option value="">Select project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>
      <Field label="Slug"><input className={inputClass} name="slug" placeholder="coastal-residences-august-2026" defaultValue={update?.slug ?? ""} required /></Field>
      <Field label="Status"><select className={selectClass} name="status" defaultValue={update?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
      <Field label="Progress %"><input className={inputClass} type="number" min="0" max="100" step="0.1" name="progress" defaultValue={update?.progress ?? ""} required /></Field>
      <Field label="Status label"><input className={inputClass} name="status_label" placeholder="Structural works advancing" defaultValue={update?.status_label ?? ""} required /></Field>
      <Field label="Display date"><input className={inputClass} name="updated_at_label" placeholder="30 August 2026" defaultValue={update?.updated_at_label ?? ""} required /></Field>
      <Field label="Published at"><input className={inputClass} type="datetime-local" name="published_at" defaultValue={update?.published_at?.slice(0, 16) ?? ""} /></Field>
      <Field label="Image URL"><input className={inputClass} name="image_url" defaultValue={update?.image_url ?? ""} /></Field>
      <div className="md:col-span-2"><Field label="Summary"><textarea className={textareaClass} name="summary" defaultValue={update?.summary ?? ""} required /></Field></div>
      <div className="md:col-span-2"><Field label="Milestones" hint="Comma separated"><input className={inputClass} name="milestones" defaultValue={update?.milestones.join(", ") ?? ""} /></Field></div>
      <div className="md:col-span-2 flex items-center justify-between gap-3">{update ? <StatusPill status={update.status} /> : <span />}<button className="button button-dark">{update ? "Save update" : "Add update"}</button></div>
    </form>
  );
}

export default async function UpdatesAdminPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await requireAdmin();
  const [updates, projects, query] = await Promise.all([listConstructionUpdates(), listAdminProjects(), searchParams]);
  return (
    <>
      <AdminPageHeader eyebrow="Progress" title="Construction Updates" description="Record verified progress, milestones and site imagery. Published updates enter the next CMS snapshot." />
      <AdminNotice notice={query.notice} />
      <div className="grid gap-6">
        {updates.map((update) => <AdminCard key={update.id} eyebrow="Update" title={update.slug}><UpdateForm update={update} projects={projects} /></AdminCard>)}
        <AdminCard eyebrow="New" title="Add construction update"><UpdateForm projects={projects} /></AdminCard>
      </div>
    </>
  );
}
