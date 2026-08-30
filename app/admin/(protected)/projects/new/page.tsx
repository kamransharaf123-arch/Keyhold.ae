import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { ProjectCoreForm } from "@/components/admin/project-core-form";
import { listAreas, listDevelopers } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";

export default async function NewProjectPage() {
  await requireAdmin();
  const [developers, areas] = await Promise.all([listDevelopers(), listAreas()]);
  return (
    <>
      <AdminPageHeader eyebrow="Projects" title="Create a project" description="Start with the core project record. Once saved, you can upload media and add units, payment milestones, floor plans and documents." />
      <AdminCard><ProjectCoreForm developers={developers} areas={areas} /></AdminCard>
    </>
  );
}
