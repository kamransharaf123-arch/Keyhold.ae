import { saveInsightAction, saveServiceAction } from "@/app/admin/actions";
import { AdminCard, AdminNotice, AdminPageHeader, Field, StatusPill, inputClass, selectClass, textareaClass } from "@/components/admin/admin-ui";
import { EntityTranslationPanel } from "@/components/admin/entity-translation-panel";
import { cmsSelect } from "@/lib/cms/rest";
import { requireAdmin } from "@/lib/admin/session";
import { getFrenchTranslation } from "@/lib/i18n/admin-translations";
import { translationFieldProfiles } from "@/lib/i18n/admin-field-profiles";

type InsightRow = {
  id: string;
  slug: string;
  status: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url: string | null;
  published_at: string;
};

type ServiceRow = { id: string; slug: string; status: string; title: string; text: string; sort_order: number };

function InsightForm({ item }: { item?: InsightRow }) {
  return (
    <form action={saveInsightAction} className="grid gap-4 md:grid-cols-2">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <Field label="Title"><input className={inputClass} name="title" defaultValue={item?.title ?? ""} required /></Field>
      <Field label="Slug"><input className={inputClass} name="slug" defaultValue={item?.slug ?? ""} required /></Field>
      <Field label="Category"><input className={inputClass} name="category" defaultValue={item?.category ?? ""} required /></Field>
      <Field label="Status"><select className={selectClass} name="status" defaultValue={item?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
      <div className="md:col-span-2"><Field label="Excerpt"><textarea className={textareaClass} name="excerpt" defaultValue={item?.excerpt ?? ""} required /></Field></div>
      <div className="md:col-span-2"><Field label="Body"><textarea className={`${textareaClass} min-h-64`} name="body" defaultValue={item?.body ?? ""} /></Field></div>
      <Field label="Cover image URL"><input className={inputClass} name="cover_image_url" defaultValue={item?.cover_image_url ?? ""} /></Field>
      <Field label="Published at"><input className={inputClass} type="datetime-local" name="published_at" defaultValue={item?.published_at?.slice(0, 16) ?? ""} /></Field>
      <div className="md:col-span-2 flex items-center justify-between gap-3">{item ? <StatusPill status={item.status} /> : <span />}<button className="button button-dark">{item ? "Save insight" : "Add insight"}</button></div>
    </form>
  );
}

function ServiceForm({ item }: { item?: ServiceRow }) {
  return (
    <form action={saveServiceAction} className="grid gap-4 md:grid-cols-2">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <Field label="Title"><input className={inputClass} name="title" defaultValue={item?.title ?? ""} required /></Field>
      <Field label="Slug"><input className={inputClass} name="slug" defaultValue={item?.slug ?? ""} required /></Field>
      <Field label="Status"><select className={selectClass} name="status" defaultValue={item?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
      <Field label="Sort order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={item?.sort_order ?? 0} /></Field>
      <div className="md:col-span-2"><Field label="Description"><textarea className={textareaClass} name="text" defaultValue={item?.text ?? ""} required /></Field></div>
      <div className="md:col-span-2 flex items-center justify-between gap-3">{item ? <StatusPill status={item.status} /> : <span />}<button className="button button-dark">{item ? "Save service" : "Add service"}</button></div>
    </form>
  );
}

export default async function ContentAdminPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await requireAdmin();
  const [query, insights, services] = await Promise.all([
    searchParams,
    cmsSelect<InsightRow>("cms_insights", "select=*&order=published_at.desc"),
    cmsSelect<ServiceRow>("cms_services", "select=*&order=sort_order.asc,title.asc"),
  ]);
  const [insightTranslations, serviceTranslations] = await Promise.all([
    Promise.all(insights.map((item) => getFrenchTranslation("insight", item.slug))),
    Promise.all(services.map((item) => getFrenchTranslation("service", item.slug))),
  ]);
  return (
    <>
      <AdminPageHeader eyebrow="Editorial" title="Content" description="Manage Insights and Services from the same back office as property inventory." />
      <AdminNotice notice={query.notice} />
      <div className="grid gap-6">
        <AdminCard eyebrow="Insights" title="Articles">
          <div className="grid gap-4">
            {insights.map((item, index) => (
              <details key={item.id} className="border border-black/10 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span className="font-semibold">{item.title}</span><StatusPill status={item.status} /></summary>
                <div className="mt-5 border-t border-black/10 pt-5">
                  <InsightForm item={item} />
                  <div className="mt-6 border-t border-black/10 pt-6">
                    <EntityTranslationPanel entityType="insight" entityKey={item.slug} current={insightTranslations[index]?.data ?? {}} status={insightTranslations[index]?.status ?? "draft"} fields={translationFieldProfiles.insight ?? []} returnTo="/admin/content" />
                  </div>
                </div>
              </details>
            ))}
            <details className="border border-dashed border-black/15 bg-[var(--color-bone)] p-4"><summary className="cursor-pointer font-semibold">+ Add insight</summary><div className="mt-5"><InsightForm /></div></details>
          </div>
        </AdminCard>
        <AdminCard eyebrow="Services" title="Service catalogue">
          <div className="grid gap-4">
            {services.map((item, index) => (
              <details key={item.id} className="border border-black/10 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span className="font-semibold">{item.title}</span><StatusPill status={item.status} /></summary>
                <div className="mt-5 border-t border-black/10 pt-5">
                  <ServiceForm item={item} />
                  <div className="mt-6 border-t border-black/10 pt-6">
                    <EntityTranslationPanel entityType="service" entityKey={item.slug} current={serviceTranslations[index]?.data ?? {}} status={serviceTranslations[index]?.status ?? "draft"} fields={translationFieldProfiles.service ?? []} returnTo="/admin/content" />
                  </div>
                </div>
              </details>
            ))}
            <details className="border border-dashed border-black/15 bg-[var(--color-bone)] p-4"><summary className="cursor-pointer font-semibold">+ Add service</summary><div className="mt-5"><ServiceForm /></div></details>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
