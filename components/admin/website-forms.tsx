import {
  deleteFaqAction,
  deleteNavigationItemAction,
  deletePersonAction,
  deleteTestimonialAction,
  deleteWebsiteSectionAction,
  saveFaqAction,
  saveNavigationItemAction,
  savePersonAction,
  saveTestimonialAction,
  saveWebsitePageAction,
  saveWebsiteSectionAction,
} from "@/app/admin/website-actions";
import { Field, StatusPill, inputClass, selectClass, textareaClass } from "@/components/admin/admin-ui";

export type PageRow = {
  id: string;
  page_key: string;
  route: string;
  status: string;
  nav_title: string;
  eyebrow: string | null;
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  hero_video_url: string | null;
  primary_cta_label: string | null;
  primary_cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  settings: Record<string, unknown> | null;
};

export type SectionRow = {
  id: string;
  page_id: string;
  section_key: string;
  section_type: string;
  enabled: boolean;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  image_url: string | null;
  image_alt: string | null;
  cta_label: string | null;
  cta_href: string | null;
  style_variant: string;
  payload: Record<string, unknown> | null;
  sort_order: number;
};

export function PageForm({ item }: { item?: PageRow }) {
  return (
    <form action={saveWebsitePageAction} className="grid gap-4 md:grid-cols-2">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <Field label="Page key" hint="Stable internal key, lowercase with hyphens."><input className={inputClass} name="page_key" defaultValue={item?.page_key ?? ""} required /></Field>
      <Field label="Route" hint="Internal route, for example /services or /."><input className={inputClass} name="route" defaultValue={item?.route ?? ""} required /></Field>
      <Field label="Navigation title"><input className={inputClass} name="nav_title" defaultValue={item?.nav_title ?? ""} required /></Field>
      <Field label="Status"><select className={selectClass} name="status" defaultValue={item?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
      <Field label="Eyebrow"><input className={inputClass} name="eyebrow" defaultValue={item?.eyebrow ?? ""} /></Field>
      <Field label="Hero title"><input className={inputClass} name="hero_title" defaultValue={item?.hero_title ?? ""} required /></Field>
      <div className="md:col-span-2"><Field label="Hero subtitle"><textarea className={textareaClass} name="hero_subtitle" defaultValue={item?.hero_subtitle ?? ""} /></Field></div>
      <Field label="Hero image URL"><input className={inputClass} name="hero_image_url" defaultValue={item?.hero_image_url ?? ""} /></Field>
      <Field label="Or upload hero image" hint="New upload replaces the URL above."><input className={inputClass} type="file" accept="image/*" name="hero_image_file" /></Field>
      <Field label="Hero image alt text"><input className={inputClass} name="hero_image_alt" defaultValue={item?.hero_image_alt ?? ""} /></Field>
      <Field label="Hero video URL" hint="Optional HTTPS video URL."><input className={inputClass} name="hero_video_url" defaultValue={item?.hero_video_url ?? ""} /></Field>
      <span />
      <Field label="Primary CTA label"><input className={inputClass} name="primary_cta_label" defaultValue={item?.primary_cta_label ?? ""} /></Field>
      <Field label="Primary CTA href"><input className={inputClass} name="primary_cta_href" defaultValue={item?.primary_cta_href ?? ""} /></Field>
      <Field label="Secondary CTA label"><input className={inputClass} name="secondary_cta_label" defaultValue={item?.secondary_cta_label ?? ""} /></Field>
      <Field label="Secondary CTA href"><input className={inputClass} name="secondary_cta_href" defaultValue={item?.secondary_cta_href ?? ""} /></Field>
      <Field label="SEO title"><input className={inputClass} name="seo_title" defaultValue={item?.seo_title ?? ""} /></Field>
      <Field label="OG image URL"><input className={inputClass} name="og_image_url" defaultValue={item?.og_image_url ?? ""} /></Field>
      <Field label="Or upload OG image"><input className={inputClass} type="file" accept="image/*" name="og_image_file" /></Field>
      <div className="md:col-span-2"><Field label="SEO description"><textarea className={textareaClass} name="seo_description" defaultValue={item?.seo_description ?? ""} /></Field></div>
      <div className="md:col-span-2"><Field label="Advanced page settings (JSON)" hint="Optional. Keep {} unless a page-specific feature needs structured settings."><textarea className={`${textareaClass} min-h-40 font-mono text-xs`} name="settings" defaultValue={JSON.stringify(item?.settings ?? {}, null, 2)} /></Field></div>
      <div className="md:col-span-2 flex items-center justify-between gap-3">{item ? <StatusPill status={item.status} /> : <span />}<button className="button button-dark">{item ? "Save page" : "Add page"}</button></div>
    </form>
  );
}

export function SectionForm({ pageId, item }: { pageId: string; item?: SectionRow }) {
  return (
    <form action={saveWebsiteSectionAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="page_id" value={pageId} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <Field label="Section key"><input className={inputClass} name="section_key" defaultValue={item?.section_key ?? ""} required /></Field>
      <Field label="Section type" hint="Examples: content, project-grid, link-grid, faq, people, testimonials, global-cta."><input className={inputClass} name="section_type" defaultValue={item?.section_type ?? "content"} required /></Field>
      <Field label="Order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={item?.sort_order ?? 0} /></Field>
      <Field label="Style variant"><input className={inputClass} name="style_variant" defaultValue={item?.style_variant ?? "default"} /></Field>
      <label className="flex min-h-11 items-center gap-3 border border-black/10 bg-[var(--color-bone)] px-3 text-sm"><input type="checkbox" name="enabled" defaultChecked={item?.enabled ?? true} /> Enabled on public page</label>
      <span />
      <Field label="Eyebrow"><input className={inputClass} name="eyebrow" defaultValue={item?.eyebrow ?? ""} /></Field>
      <Field label="Title"><input className={inputClass} name="title" defaultValue={item?.title ?? ""} /></Field>
      <div className="md:col-span-2"><Field label="Body"><textarea className={`${textareaClass} min-h-40`} name="body" defaultValue={item?.body ?? ""} /></Field></div>
      <Field label="Image URL"><input className={inputClass} name="image_url" defaultValue={item?.image_url ?? ""} /></Field>
      <Field label="Or upload image" hint="New upload replaces the URL above."><input className={inputClass} type="file" accept="image/*" name="image_file" /></Field>
      <Field label="Image alt text"><input className={inputClass} name="image_alt" defaultValue={item?.image_alt ?? ""} /></Field>
      <Field label="CTA label"><input className={inputClass} name="cta_label" defaultValue={item?.cta_label ?? ""} /></Field>
      <Field label="CTA href"><input className={inputClass} name="cta_href" defaultValue={item?.cta_href ?? ""} /></Field>
      <div className="md:col-span-2"><Field label="Structured section content (JSON)" hint="Lists, featured slugs, stats, cards or other structured content live here. The common title/body/image fields above remain easy to edit."><textarea className={`${textareaClass} min-h-52 font-mono text-xs`} name="payload" defaultValue={JSON.stringify(item?.payload ?? {}, null, 2)} /></Field></div>
      <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
        {item ? <button className="button border border-[var(--color-terracotta)] text-[var(--color-terracotta-deep)]" formAction={deleteWebsiteSectionAction} name="id" value={item.id} formNoValidate>Delete section</button> : null}
        <button className="button button-dark">{item ? "Save section" : "Add section"}</button>
      </div>
    </form>
  );
}

export type NavigationRow = { id: string; nav_group: string; label: string; href: string; enabled: boolean; external: boolean; sort_order: number };
export function NavigationForm({ item }: { item?: NavigationRow }) {
  return <form action={saveNavigationItemAction} className="grid gap-3 md:grid-cols-6">{item ? <input type="hidden" name="id" value={item.id} /> : null}<Field label="Group"><select className={selectClass} name="nav_group" defaultValue={item?.nav_group ?? "header-primary"}>{["header-primary","projects-dropdown","footer-projects","footer-guides","footer-services","footer-company","legal","mobile-extra"].map((group)=><option key={group} value={group}>{group}</option>)}</select></Field><Field label="Label"><input className={inputClass} name="label" defaultValue={item?.label ?? ""} required /></Field><Field label="Href"><input className={inputClass} name="href" defaultValue={item?.href ?? ""} required /></Field><Field label="Order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={item?.sort_order ?? 0} /></Field><label className="flex min-h-11 items-center gap-2 self-end border border-black/10 px-3 text-sm"><input type="checkbox" name="enabled" defaultChecked={item?.enabled ?? true}/> Enabled</label><div className="flex flex-wrap items-end gap-2"><label className="flex min-h-11 items-center gap-2 border border-black/10 px-3 text-sm"><input type="checkbox" name="external" defaultChecked={item?.external ?? false}/> External</label><button className="button button-dark">Save</button>{item ? <button className="button border border-black/10" formAction={deleteNavigationItemAction} name="id" value={item.id} formNoValidate>Delete</button> : null}</div></form>;
}

export type PersonRow = { id:string; slug:string; status:string; name:string; role:string; bio:string; image_url:string|null; email:string|null; phone:string|null; linkedin_url:string|null; sort_order:number };
export function PersonForm({ item }: { item?: PersonRow }) {
  return <form action={savePersonAction} className="grid gap-4 md:grid-cols-2">{item ? <input type="hidden" name="id" value={item.id}/> : null}<Field label="Name"><input className={inputClass} name="name" defaultValue={item?.name ?? ""} required /></Field><Field label="Slug"><input className={inputClass} name="slug" defaultValue={item?.slug ?? ""} required /></Field><Field label="Role"><input className={inputClass} name="role" defaultValue={item?.role ?? ""} required /></Field><Field label="Status"><select className={selectClass} name="status" defaultValue={item?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field><div className="md:col-span-2"><Field label="Bio"><textarea className={textareaClass} name="bio" defaultValue={item?.bio ?? ""}/></Field></div><Field label="Image URL"><input className={inputClass} name="image_url" defaultValue={item?.image_url ?? ""}/></Field><Field label="Or upload image"><input className={inputClass} type="file" accept="image/*" name="image_file" /></Field><Field label="LinkedIn URL"><input className={inputClass} name="linkedin_url" defaultValue={item?.linkedin_url ?? ""}/></Field><Field label="Email"><input className={inputClass} name="email" type="email" defaultValue={item?.email ?? ""}/></Field><Field label="Phone"><input className={inputClass} name="phone" defaultValue={item?.phone ?? ""}/></Field><Field label="Order"><input className={inputClass} name="sort_order" type="number" min="0" defaultValue={item?.sort_order ?? 0}/></Field><div className="flex flex-wrap items-end justify-end gap-2">{item ? <button className="button border border-black/10" formAction={deletePersonAction} name="id" value={item.id} formNoValidate>Delete</button> : null}<button className="button button-dark">Save</button></div></form>;
}

export type TestimonialRow = { id:string; status:string; name:string; descriptor:string|null; quote:string; image_url:string|null; source_label:string|null; source_url:string|null; sort_order:number };
export function TestimonialForm({ item }: { item?: TestimonialRow }) {
  return <form action={saveTestimonialAction} className="grid gap-4 md:grid-cols-2">{item ? <input type="hidden" name="id" value={item.id}/> : null}<Field label="Name"><input className={inputClass} name="name" defaultValue={item?.name ?? ""} required/></Field><Field label="Descriptor"><input className={inputClass} name="descriptor" defaultValue={item?.descriptor ?? ""}/></Field><Field label="Status"><select className={selectClass} name="status" defaultValue={item?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field><Field label="Order"><input className={inputClass} name="sort_order" type="number" min="0" defaultValue={item?.sort_order ?? 0}/></Field><div className="md:col-span-2"><Field label="Quote"><textarea className={textareaClass} name="quote" defaultValue={item?.quote ?? ""} required/></Field></div><Field label="Image URL"><input className={inputClass} name="image_url" defaultValue={item?.image_url ?? ""}/></Field><Field label="Or upload image"><input className={inputClass} type="file" accept="image/*" name="image_file" /></Field><Field label="Source label"><input className={inputClass} name="source_label" defaultValue={item?.source_label ?? ""}/></Field><div className="md:col-span-2"><Field label="Source URL"><input className={inputClass} name="source_url" defaultValue={item?.source_url ?? ""}/></Field></div><div className="md:col-span-2 flex justify-end gap-2">{item ? <button className="button border border-black/10" formAction={deleteTestimonialAction} name="id" value={item.id} formNoValidate>Delete</button>:null}<button className="button button-dark">Save</button></div></form>;
}

export type FaqRow = { id:string; status:string; scope:string; category:string|null; question:string; answer:string; sort_order:number };
export function FaqForm({ item }: { item?: FaqRow }) {
  return <form action={saveFaqAction} className="grid gap-4 md:grid-cols-2">{item ? <input type="hidden" name="id" value={item.id}/> : null}<Field label="Scope" hint="Use global or a page key such as home, services, who-we-are."><input className={inputClass} name="scope" defaultValue={item?.scope ?? "global"} required/></Field><Field label="Category"><input className={inputClass} name="category" defaultValue={item?.category ?? ""}/></Field><Field label="Status"><select className={selectClass} name="status" defaultValue={item?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field><Field label="Order"><input className={inputClass} name="sort_order" type="number" min="0" defaultValue={item?.sort_order ?? 0}/></Field><div className="md:col-span-2"><Field label="Question"><input className={inputClass} name="question" defaultValue={item?.question ?? ""} required/></Field></div><div className="md:col-span-2"><Field label="Answer"><textarea className={textareaClass} name="answer" defaultValue={item?.answer ?? ""} required/></Field></div><div className="md:col-span-2 flex justify-end gap-2">{item ? <button className="button border border-black/10" formAction={deleteFaqAction} name="id" value={item.id} formNoValidate>Delete</button>:null}<button className="button button-dark">Save</button></div></form>;
}
