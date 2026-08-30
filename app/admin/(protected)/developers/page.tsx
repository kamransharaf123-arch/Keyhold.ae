import { saveDeveloperAction } from "@/app/admin/actions";
import { AdminCard, AdminNotice, AdminPageHeader, Field, StatusPill, inputClass, selectClass, textareaClass } from "@/components/admin/admin-ui";
import { EntityTranslationPanel } from "@/components/admin/entity-translation-panel";
import { listDevelopers } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";
import { getFrenchTranslation } from "@/lib/i18n/admin-translations";
import { translationFieldProfiles } from "@/lib/i18n/admin-field-profiles";

export default async function DevelopersAdminPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await requireAdmin();
  const [developers, query] = await Promise.all([listDevelopers(), searchParams]);
  const translations = await Promise.all(developers.map((developer) => getFrenchTranslation("developer", developer.slug)));
  return (
    <>
      <AdminPageHeader eyebrow="Taxonomy" title="Developers" description="Developer records connect automatically to project pages, discovery and intelligence." />
      <AdminNotice notice={query.notice} />
      <div className="grid gap-6">
        {developers.map((developer, index) => (
          <AdminCard key={developer.id} title={developer.name} eyebrow="Developer">
            <form action={saveDeveloperAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={developer.id} />
              <Field label="Name"><input className={inputClass} name="name" defaultValue={developer.name} required /></Field>
              <Field label="Slug"><input className={inputClass} name="slug" defaultValue={developer.slug} required /></Field>
              <Field label="Location"><input className={inputClass} name="location" defaultValue={developer.location} required /></Field>
              <Field label="Status"><select className={selectClass} name="status" defaultValue={developer.status}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
              <div className="md:col-span-2"><Field label="Summary"><textarea className={textareaClass} name="summary" defaultValue={developer.summary} required /></Field></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="verified_facts_only" defaultChecked={developer.verified_facts_only} /> Corporate facts verified</label>
              <div className="flex items-center justify-between gap-3"><StatusPill status={developer.status} /><button className="button button-dark">Save</button></div>
            </form>
            <div className="mt-6 border-t border-black/10 pt-6">
              <EntityTranslationPanel
                entityType="developer"
                entityKey={developer.slug}
                current={translations[index]?.data ?? {}}
                status={translations[index]?.status ?? "draft"}
                fields={translationFieldProfiles.developer ?? []}
                returnTo="/admin/developers"
              />
            </div>
          </AdminCard>
        ))}
        <AdminCard title="Add developer" eyebrow="New">
          <form action={saveDeveloperAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Name"><input className={inputClass} name="name" required /></Field><Field label="Slug"><input className={inputClass} name="slug" required /></Field><Field label="Location"><input className={inputClass} name="location" defaultValue="Dubai, UAE" required /></Field><Field label="Status"><select className={selectClass} name="status" defaultValue="draft"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field><div className="md:col-span-2"><Field label="Summary"><textarea className={textareaClass} name="summary" required /></Field></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="verified_facts_only" /> Corporate facts verified</label><div className="text-right"><button className="button button-dark">Add developer</button></div>
          </form>
        </AdminCard>
      </div>
    </>
  );
}
