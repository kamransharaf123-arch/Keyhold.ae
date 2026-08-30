import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProjectAction, setProjectStatusAction } from "@/app/admin/actions";
import { AdminCard, AdminNotice, AdminPageHeader, StatusPill } from "@/components/admin/admin-ui";
import { ProjectCoreForm } from "@/components/admin/project-core-form";
import { DocumentManager, FloorPlanManager, PaymentPlanManager, ProjectMediaManager, UnitManager } from "@/components/admin/project-subrecords";
import { getAdminProject, listAreas, listDevelopers, listFloorPlans, listPaymentMilestones, listProjectDocuments, listProjectImages, listProjectUnits } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string; error?: string }> }) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [project, developers, areas, units, milestones, images, plans, documents] = await Promise.all([
    getAdminProject(id), listDevelopers(), listAreas(), listProjectUnits(id), listPaymentMilestones(id), listProjectImages(id), listFloorPlans(id), listProjectDocuments(id),
  ]);
  if (!project) notFound();
  return (
    <>
      <AdminPageHeader eyebrow="Project editor" title={project.title} description="Changes are saved to the CMS first. Public pages update only after the published snapshot is rebuilt." actions={<><StatusPill status={project.status} /><Link href={`/admin/preview/projects/${project.id}`} className="button border border-black/10">Preview draft</Link>{project.status === "published" ? <Link href={`/projects/${project.slug}`} className="button border border-black/10">Public page</Link> : null}</>} />
      <AdminNotice notice={query.notice} error={query.error} />
      <div className="mb-6 flex flex-wrap gap-2">
        {["Core", "Media", "Payment plan", "Units", "Floor plans", "Documents"].map((label) => <a key={label} href={`#${label.toLowerCase().replace(/ /g, "-") === "core" ? "core" : label.toLowerCase().replace(/ /g, "-")}`} className="border border-black/10 bg-[var(--color-soft-white)] px-3 py-2 text-xs">{label}</a>)}
      </div>
      <div className="grid gap-6">
        <AdminCard id="core" eyebrow="Core record" title="Project information"><ProjectCoreForm project={project} developers={developers} areas={areas} /></AdminCard>
        <ProjectMediaManager project={project} images={images} />
        <PaymentPlanManager project={project} milestones={milestones} />
        <UnitManager project={project} units={units} />
        <FloorPlanManager project={project} plans={plans} />
        <DocumentManager project={project} documents={documents} />
        <AdminCard eyebrow="Publication" title="Status & lifecycle">
          <div className="flex flex-wrap gap-3">
            {project.status !== "published" ? <form action={setProjectStatusAction}><input type="hidden" name="id" value={project.id} /><input type="hidden" name="status" value="published" /><button className="button button-dark">Publish record</button></form> : <form action={setProjectStatusAction}><input type="hidden" name="id" value={project.id} /><input type="hidden" name="status" value="draft" /><button className="button border border-black/10">Return to draft</button></form>}
            {project.status !== "archived" ? <form action={setProjectStatusAction}><input type="hidden" name="id" value={project.id} /><input type="hidden" name="status" value="archived" /><button className="button border border-black/10">Archive</button></form> : null}
            {project.status !== "published" ? <form action={deleteProjectAction}><input type="hidden" name="id" value={project.id} /><button className="button border border-[var(--color-terracotta)] text-[var(--color-terracotta-deep)]">Delete project</button></form> : null}
          </div>
          <p className="mt-4 text-xs leading-6 text-[var(--color-stone)]">Publishing a CMS record does not immediately change keyhold.ae. Use the global “Publish site” action when the batch of content changes is ready for deployment.</p>
        </AdminCard>
      </div>
    </>
  );
}
