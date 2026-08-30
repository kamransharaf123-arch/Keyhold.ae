import { saveAreaAction } from "@/app/admin/actions";
import { AdminCard, AdminNotice, AdminPageHeader, Field, inputClass, selectClass, textareaClass } from "@/components/admin/admin-ui";
import { listAreas } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";

function AreaForm({ area }: { area?: Awaited<ReturnType<typeof listAreas>>[number] }) {
  return <form action={saveAreaAction} className="grid gap-4 md:grid-cols-2">{area ? <input type="hidden" name="id" value={area.id} /> : null}<Field label="Name"><input className={inputClass} name="name" defaultValue={area?.name ?? ""} required /></Field><Field label="Slug"><input className={inputClass} name="slug" defaultValue={area?.slug ?? ""} required /></Field><Field label="Emirate"><input className={inputClass} name="emirate" defaultValue={area?.emirate ?? "Dubai"} required /></Field><Field label="Status"><select className={selectClass} name="status" defaultValue={area?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field><div className="md:col-span-2"><Field label="Summary"><textarea className={textareaClass} name="summary" defaultValue={area?.summary ?? ""} required /></Field></div><div className="md:col-span-2"><Field label="Highlights" hint="Comma separated"><input className={inputClass} name="highlights" defaultValue={area?.highlights.join(", ") ?? ""} /></Field></div><Field label="Schematic map X" hint="0–100"><input className={inputClass} type="number" min="0" max="100" step="0.1" name="map_x" defaultValue={area?.map_x ?? 50} required /></Field><Field label="Schematic map Y" hint="0–100"><input className={inputClass} type="number" min="0" max="100" step="0.1" name="map_y" defaultValue={area?.map_y ?? 50} required /></Field><div className="md:col-span-2 text-right"><button className="button button-dark">{area ? "Save area" : "Add area"}</button></div></form>;
}

export default async function AreasAdminPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await requireAdmin();
  const [areas, query] = await Promise.all([listAreas(), searchParams]);
  return <><AdminPageHeader eyebrow="Taxonomy" title="Areas" description="Areas drive community landing pages, discovery filters and the schematic explorer." /><AdminNotice notice={query.notice} /><div className="grid gap-6">{areas.map((area) => <AdminCard key={area.id} eyebrow="Area" title={area.name}><AreaForm area={area} /></AdminCard>)}<AdminCard eyebrow="New" title="Add area"><AreaForm /></AdminCard></div></>;
}
