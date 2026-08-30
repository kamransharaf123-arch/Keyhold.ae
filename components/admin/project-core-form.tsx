import { saveProjectAction } from "@/app/admin/actions";
import { Field, inputClass, selectClass, textareaClass } from "@/components/admin/admin-ui";
import type { CmsAreaRow, CmsDeveloperRow, CmsProjectRow } from "@/types/admin";

const EMPTY_REGULATORY = JSON.stringify({ registrationStatus: "pending-verification" }, null, 2);
const EMPTY_DISCOVERY = JSON.stringify({ investmentGoals: [], lifestyleTags: [], keywords: [] }, null, 2);

export function ProjectCoreForm({ project, developers, areas }: { project?: CmsProjectRow | null; developers: CmsDeveloperRow[]; areas: CmsAreaRow[] }) {
  return (
    <form action={saveProjectAction} className="grid gap-7">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Project name"><input className={inputClass} name="title" required defaultValue={project?.title ?? ""} /></Field>
        <Field label="Slug" hint="Example: the-oasis-villas"><input className={inputClass} name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={project?.slug ?? ""} /></Field>
        <Field label="Category"><select className={selectClass} name="category" defaultValue={project?.category ?? "Off-Plan"}><option>Off-Plan</option><option>Ready</option><option value="Short-Term">Short-Term</option><option value="Long-Term">Long-Term</option></select></Field>
        <Field label="Completion status"><select className={selectClass} name="completion_status" defaultValue={project?.completion_status ?? "under-construction"}><option value="pre-launch">Pre-launch</option><option value="under-construction">Under construction</option><option value="ready">Ready</option></select></Field>
        <Field label="Developer"><select className={selectClass} name="developer_id" defaultValue={project?.developer_id ?? ""}><option value="">Select developer</option>{developers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="Area"><select className={selectClass} name="area_id" defaultValue={project?.area_id ?? ""}><option value="">Select area</option>{areas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="Location"><input className={inputClass} name="location" required defaultValue={project?.location ?? ""} /></Field>
        <Field label="Handover label"><input className={inputClass} name="handover_label" required placeholder="Q4 2028 / Ready now" defaultValue={project?.handover_label ?? ""} /></Field>
        <Field label="Handover date"><input className={inputClass} type="date" name="handover_date" defaultValue={project?.handover_date?.slice(0, 10) ?? ""} /></Field>
        <Field label="Construction progress" hint="0–100, leave blank if not applicable"><input className={inputClass} type="number" min="0" max="100" step="0.1" name="construction_progress" defaultValue={project?.construction_progress ?? ""} /></Field>
      </div>

      <Field label="Short description"><textarea className={textareaClass} name="short_description" required maxLength={500} defaultValue={project?.short_description ?? ""} /></Field>
      <Field label="Overview"><textarea className={`${textareaClass} min-h-48`} name="overview" required defaultValue={project?.overview ?? ""} /></Field>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Purchase price from (AED)"><input className={inputClass} type="number" min="0" step="1" name="price_from_aed" defaultValue={project?.price_from_aed ?? ""} /></Field>
        <Field label="Rental price from (AED)"><input className={inputClass} type="number" min="0" step="1" name="rental_price_from_aed" defaultValue={project?.rental_price_from_aed ?? ""} /></Field>
        <Field label="Bedrooms label"><input className={inputClass} name="bedrooms_label" required placeholder="1–3 bedrooms" defaultValue={project?.bedrooms_label ?? ""} /></Field>
        <Field label="Bedrooms" hint="Comma separated: 1, 2, 3"><input className={inputClass} name="bedrooms" defaultValue={project?.bedrooms.join(", ") ?? ""} /></Field>
        <Field label="Bathrooms label"><input className={inputClass} name="bathrooms_label" defaultValue={project?.bathrooms_label ?? ""} /></Field>
        <Field label="Property types" hint="Comma separated"><input className={inputClass} name="property_types" defaultValue={project?.property_types.join(", ") ?? "Apartment"} /></Field>
        <Field label="Size from (sqft)"><input className={inputClass} type="number" min="0" step="1" name="size_from_sqft" defaultValue={project?.size_from_sqft ?? ""} /></Field>
        <Field label="Size to (sqft)"><input className={inputClass} type="number" min="0" step="1" name="size_to_sqft" defaultValue={project?.size_to_sqft ?? ""} /></Field>
        <Field label="Availability verified at"><input className={inputClass} type="datetime-local" name="availability_last_verified_at" defaultValue={project?.availability_last_verified_at?.slice(0, 16) ?? ""} /></Field>
      </div>

      <Field label="Amenities" hint="Comma separated"><textarea className={textareaClass} name="amenities" defaultValue={project?.amenities.join(", ") ?? ""} /></Field>
      <Field label="Hero image URL" hint="Use the Media section below to upload and set a hero image after the project is created."><input className={inputClass} name="hero_image_url" defaultValue={project?.hero_image_url ?? ""} /></Field>

      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Discovery metadata (JSON)" hint="Investment goals, lifestyle tags and search keywords."><textarea className={`${textareaClass} font-mono text-xs`} name="discovery" defaultValue={JSON.stringify(project?.discovery ?? JSON.parse(EMPTY_DISCOVERY), null, 2)} /></Field>
        <Field label="Regulatory data (JSON)" hint="Permit number, QR code, verification URL and registrationStatus."><textarea className={`${textareaClass} font-mono text-xs`} name="regulatory" defaultValue={JSON.stringify(project?.regulatory ?? JSON.parse(EMPTY_REGULATORY), null, 2)} /></Field>
        <Field label="Investment profile (JSON)" hint="Leave blank until verified assumptions are ready. Module 4 reads this object."><textarea className={`${textareaClass} min-h-48 font-mono text-xs`} name="investment" defaultValue={project?.investment ? JSON.stringify(project.investment, null, 2) : ""} /></Field>
        <Field label="Key facts (JSON array)" hint='Example: [{"label":"Handover","value":"Q4 2028"}]'><textarea className={`${textareaClass} min-h-48 font-mono text-xs`} name="key_facts" defaultValue={JSON.stringify(project?.key_facts ?? [], null, 2)} /></Field>
      </div>
      <Field label="SEO overrides (JSON)" hint="Optional title, description, canonical and social-image overrides."><textarea className={`${textareaClass} font-mono text-xs`} name="seo" defaultValue={JSON.stringify(project?.seo ?? {}, null, 2)} /></Field>

      <div className="flex flex-wrap gap-5 border-t border-black/10 pt-5">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} /> Featured project</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="footer_featured" defaultChecked={project?.footer_featured ?? false} /> Feature in footer</label>
      </div>

      <div><button type="submit" className="button button-dark">{project ? "Save project" : "Create draft project"}</button></div>
    </form>
  );
}
