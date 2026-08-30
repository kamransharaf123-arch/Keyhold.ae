import { notFound } from "next/navigation";
import { AdminCard, AdminPageHeader, StatusPill } from "@/components/admin/admin-ui";
import { getAdminProject, listFloorPlans, listPaymentMilestones, listProjectDocuments, listProjectImages, listProjectUnits } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminProjectPreview({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [project, images, units, milestones, plans, documents] = await Promise.all([getAdminProject(id), listProjectImages(id), listProjectUnits(id), listPaymentMilestones(id), listFloorPlans(id), listProjectDocuments(id)]);
  if (!project) notFound();
  return <section className="site-container py-12"><AdminPageHeader eyebrow="Private preview" title={project.title} description="This preview reads the draft CMS record directly. It is never indexed and does not represent the currently deployed public snapshot." actions={<StatusPill status={project.status} />} /><div className="grid gap-6 lg:grid-cols-2"><AdminCard title="Core"><dl className="grid gap-3 text-sm"><div><dt className="text-xs uppercase text-[var(--color-stone)]">Category</dt><dd>{project.category}</dd></div><div><dt className="text-xs uppercase text-[var(--color-stone)]">Location</dt><dd>{project.location}</dd></div><div><dt className="text-xs uppercase text-[var(--color-stone)]">Price</dt><dd>{project.price_from_aed ? `AED ${project.price_from_aed.toLocaleString("en-US")}` : project.rental_price_from_aed ? `AED ${project.rental_price_from_aed.toLocaleString("en-US")}` : "POA"}</dd></div><div><dt className="text-xs uppercase text-[var(--color-stone)]">Handover</dt><dd>{project.handover_label}</dd></div></dl><p className="mt-5 text-sm leading-7 text-[var(--color-stone)]">{project.overview}</p></AdminCard><AdminCard title="Connected data"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[["Images", images.length], ["Units", units.length], ["Payment", milestones.length], ["Floor plans", plans.length], ["Documents", documents.length]].map(([label, value]) => <div key={String(label)} className="bg-[var(--color-bone)] p-4"><p className="text-xs text-[var(--color-stone)]">{label}</p><p className="font-display mt-1 text-3xl">{value}</p></div>)}</div></AdminCard></div></section>;
}
