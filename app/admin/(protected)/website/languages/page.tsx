import { saveLocaleAction } from "@/app/admin/localization-actions";
import { AdminCard, AdminNotice, AdminPageHeader, Field, inputClass, selectClass } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/session";
import { cmsSelect } from "@/lib/cms/rest";

type LocaleRow = { locale:string; label:string; native_label:string; enabled:boolean; is_default:boolean; route_prefix:string; hreflang:string; direction:string; fallback_locale:string|null; sort_order:number };

function LocaleForm({ item }: { item: LocaleRow }) {
  return <form action={saveLocaleAction} className="grid gap-4 md:grid-cols-2"><Field label="Locale code"><input className={inputClass} name="locale" value={item.locale} readOnly /></Field><Field label="Label"><input className={inputClass} name="label" defaultValue={item.label} required /></Field><Field label="Native label"><input className={inputClass} name="native_label" defaultValue={item.native_label} required /></Field><Field label="Route prefix"><input className={inputClass} name="route_prefix" defaultValue={item.route_prefix} /></Field><Field label="hreflang"><input className={inputClass} name="hreflang" defaultValue={item.hreflang} required /></Field><Field label="Fallback locale"><input className={inputClass} name="fallback_locale" defaultValue={item.fallback_locale ?? ""} /></Field><Field label="Direction"><select className={selectClass} name="direction" defaultValue={item.direction}><option value="ltr">LTR</option><option value="rtl">RTL</option></select></Field><Field label="Order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={item.sort_order} /></Field><label className="flex min-h-11 items-center gap-3 border border-black/10 px-3 text-sm"><input type="checkbox" name="enabled" defaultChecked={item.enabled} /> Enabled</label><label className="flex min-h-11 items-center gap-3 border border-black/10 px-3 text-sm"><input type="checkbox" name="is_default" defaultChecked={item.is_default} /> Default language</label><div className="md:col-span-2 text-right"><button className="button button-dark">Save language</button></div></form>;
}

export default async function WebsiteLanguagesPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  await requireAdmin(["owner","admin"]);
  const [query, rows] = await Promise.all([searchParams, cmsSelect<LocaleRow>("cms_locale_settings", "select=*&order=sort_order.asc,locale.asc")]);
  return <><AdminPageHeader eyebrow="Website manager" title="Languages" description="English remains the default at root URLs. French uses /fr. The schema is extensible to more locales later without redesigning the CMS."/><AdminNotice notice={query.notice} error={query.error}/><div className="grid gap-5">{rows.map((row)=><AdminCard key={row.locale} eyebrow={row.is_default?"Default locale":"Locale"} title={`${row.native_label} (${row.locale})`}><LocaleForm item={row}/></AdminCard>)}</div></>;
}
