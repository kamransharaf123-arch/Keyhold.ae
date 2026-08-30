import {
  deleteDocumentAction,
  deleteFloorPlanAction,
  deletePaymentMilestoneAction,
  deleteProjectImageAction,
  deleteUnitAction,
  importUnitsCsvAction,
  saveFloorPlanAction,
  savePaymentMilestoneAction,
  saveUnitAction,
  uploadDocumentAction,
  uploadProjectImageAction,
} from "@/app/admin/actions";
import { AdminCard, Field, StatusPill, inputClass, selectClass } from "@/components/admin/admin-ui";
import { EntityTranslationPanel } from "@/components/admin/entity-translation-panel";
import { translationFieldProfiles } from "@/lib/i18n/admin-field-profiles";
import type {
  CmsDocumentRow,
  CmsFloorPlanRow,
  CmsPaymentMilestoneRow,
  CmsProjectImageRow,
  CmsProjectRow,
  CmsUnitRow,
} from "@/types/admin";

type FrenchTranslation = { data: Record<string, unknown>; status: "draft" | "published" } | null;

export function ProjectMediaManager({ project, images }: { project: CmsProjectRow; images: CmsProjectImageRow[] }) {
  return (
    <AdminCard id="media" eyebrow="Media" title="Project gallery">
      <p className="mb-5 text-sm leading-7 text-[var(--color-stone)]">Upload first-party project images. You can set any uploaded image as the project hero.</p>
      <form action={uploadProjectImageAction} className="grid gap-4 border border-black/10 bg-[var(--color-bone)] p-4 md:grid-cols-2">
        <input type="hidden" name="project_id" value={project.id} />
        <input type="hidden" name="project_slug" value={project.slug} />
        <Field label="Images" hint="Select up to 30 images. The first image can be used as the hero."><input className={inputClass} type="file" name="files" accept="image/*" multiple required /></Field>
        <Field label="Alt text / prefix" hint="For multiple uploads the filename is appended automatically."><input className={inputClass} name="alt_text" required /></Field>
        <Field label="Category"><select className={selectClass} name="category"><option>Exterior</option><option>Interior</option><option>Amenities</option><option>Master Plan</option><option>Construction</option></select></Field>
        <Field label="Sort order"><input className={inputClass} type="number" name="sort_order" min="0" defaultValue="0" /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="set_as_hero" /> Set as hero image</label>
        <div className="md:text-right"><button className="button button-dark" type="submit">Upload image(s)</button></div>
      </form>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {images.map((image) => (
          <div key={image.id} className="flex min-w-0 gap-4 border border-black/10 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.public_url} alt={image.alt_text} className="h-20 w-28 shrink-0 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{image.category}</p>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--color-stone)]">{image.alt_text}</p>
              <form action={deleteProjectImageAction} className="mt-2">
                <input type="hidden" name="id" value={image.id} />
                <input type="hidden" name="project_id" value={project.id} />
                <input type="hidden" name="storage_path" value={image.storage_path} />
                <button type="submit" className="text-xs font-semibold text-[var(--color-terracotta-deep)]">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export function PaymentPlanManager({
  project,
  milestones,
  translations = [],
  returnTo = "/admin/content",
}: {
  project: CmsProjectRow;
  milestones: CmsPaymentMilestoneRow[];
  translations?: FrenchTranslation[];
  returnTo?: string;
}) {
  const total = milestones.reduce((sum, item) => sum + Number(item.percentage), 0);
  return (
    <AdminCard id="payment-plan" eyebrow="Commercial" title="Payment plan">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-stone)]">Off-plan payment plans should total exactly 100% before publishing.</p>
        <span className={`text-sm font-semibold ${Math.abs(total - 100) < 0.001 || milestones.length === 0 ? "text-[var(--color-sage-deep)]" : "text-[var(--color-terracotta-deep)]"}`}>Total: {total}%</span>
      </div>
      <div className="grid gap-3">
        {milestones.map((item, index) => (
          <div key={item.id} className="border border-black/10 p-4">
            <form action={savePaymentMilestoneAction} className="grid gap-3 md:grid-cols-[1fr_110px_1fr_90px_auto] md:items-end">
              <input type="hidden" name="id" value={item.id} /><input type="hidden" name="project_id" value={project.id} />
              <Field label="Label"><input className={inputClass} name="label" defaultValue={item.label} required /></Field>
              <Field label="%"><input className={inputClass} type="number" min="0" max="100" step="0.01" name="percentage" defaultValue={item.percentage} required /></Field>
              <Field label="Timing"><input className={inputClass} name="timing" defaultValue={item.timing} required /></Field>
              <Field label="Order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={item.sort_order} /></Field>
              <div className="flex gap-2"><button type="submit" className="button border border-black/10">Save</button></div>
            </form>
            <div className="mt-4 border-t border-black/10 pt-4">
              <EntityTranslationPanel entityType="payment-milestone" entityKey={item.id} current={translations[index]?.data ?? {}} status={translations[index]?.status ?? "draft"} fields={translationFieldProfiles["payment-milestone"] ?? []} returnTo={returnTo} />
            </div>
          </div>
        ))}
        {milestones.map((item) => (
          <form action={deletePaymentMilestoneAction} key={`delete-${item.id}`} className="-mt-2 ml-auto">
            <input type="hidden" name="id" value={item.id} /><input type="hidden" name="project_id" value={project.id} />
            <button className="text-xs font-semibold text-[var(--color-terracotta-deep)]" type="submit">Delete {item.label}</button>
          </form>
        ))}
      </div>
      <form action={savePaymentMilestoneAction} className="mt-6 grid gap-3 border border-dashed border-black/15 bg-[var(--color-bone)] p-4 md:grid-cols-[1fr_110px_1fr_90px_auto] md:items-end">
        <input type="hidden" name="project_id" value={project.id} />
        <Field label="New milestone"><input className={inputClass} name="label" required /></Field>
        <Field label="%"><input className={inputClass} type="number" min="0" max="100" step="0.01" name="percentage" required /></Field>
        <Field label="Timing"><input className={inputClass} name="timing" required /></Field>
        <Field label="Order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={milestones.length} /></Field>
        <button type="submit" className="button button-dark">Add</button>
      </form>
    </AdminCard>
  );
}

export function UnitManager({
  project,
  units,
  translations = [],
  returnTo = "/admin/content",
}: {
  project: CmsProjectRow;
  units: CmsUnitRow[];
  translations?: FrenchTranslation[];
  returnTo?: string;
}) {
  return (
    <AdminCard id="units" eyebrow="Inventory" title="Units">
      <p className="mb-5 text-sm leading-7 text-[var(--color-stone)]">Availability remains subject to current developer/seller confirmation and may change without prior notice.</p>
      <div className="grid gap-3">
        {units.map((unit, index) => (
          <details key={unit.id} className="border border-black/10 bg-white p-4">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <span><strong>{unit.unit_number}</strong><span className="ml-2 text-xs text-[var(--color-stone)]">Floor {unit.floor} · {unit.bedrooms} BR · {unit.size_sqft.toLocaleString("en-US")} sqft · {unit.view_label}</span></span>
              <span className="flex items-center gap-3"><span className="text-sm">{unit.price_aed ? `AED ${unit.price_aed.toLocaleString("en-US")}` : "POA"}</span><StatusPill status={unit.availability} /></span>
            </summary>
            <form action={saveUnitAction} className="mt-4 grid gap-3 border-t border-black/10 pt-4 sm:grid-cols-2 xl:grid-cols-4">
              <input type="hidden" name="id" value={unit.id} /><input type="hidden" name="project_id" value={project.id} />
              <Field label="Unit number"><input className={inputClass} name="unit_number" defaultValue={unit.unit_number} required /></Field>
              <Field label="Floor"><input className={inputClass} type="number" name="floor" defaultValue={unit.floor} required /></Field>
              <Field label="Bedrooms"><input className={inputClass} type="number" min="0" name="bedrooms" defaultValue={unit.bedrooms} required /></Field>
              <Field label="Bathrooms"><input className={inputClass} type="number" min="0" name="bathrooms" defaultValue={unit.bathrooms} required /></Field>
              <Field label="Property type"><input className={inputClass} name="property_type" defaultValue={unit.property_type} required /></Field>
              <Field label="Size sqft"><input className={inputClass} type="number" min="1" name="size_sqft" defaultValue={unit.size_sqft} required /></Field>
              <Field label="View"><input className={inputClass} name="view_label" defaultValue={unit.view_label} required /></Field>
              <Field label="Price AED"><input className={inputClass} type="number" min="0" name="price_aed" defaultValue={unit.price_aed ?? ""} /></Field>
              <Field label="Availability"><select className={selectClass} name="availability" defaultValue={unit.availability}><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option><option value="unknown">Unknown</option></select></Field>
              <Field label="Last verified"><input className={inputClass} type="datetime-local" name="last_verified_at" defaultValue={unit.last_verified_at?.slice(0, 16) ?? ""} /></Field>
              <Field label="Sort order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={unit.sort_order} /></Field>
              <div className="flex items-end gap-3"><button className="button button-dark" type="submit">Save unit</button></div>
            </form>
            <form action={deleteUnitAction} className="mt-3 text-right"><input type="hidden" name="id" value={unit.id} /><input type="hidden" name="project_id" value={project.id} /><button type="submit" className="text-xs font-semibold text-[var(--color-terracotta-deep)]">Delete unit</button></form>
            <div className="mt-4 border-t border-black/10 pt-4">
              <EntityTranslationPanel entityType="unit" entityKey={unit.id} current={translations[index]?.data ?? {}} status={translations[index]?.status ?? "draft"} fields={translationFieldProfiles.unit ?? []} returnTo={returnTo} />
            </div>
          </details>
        ))}
      </div>
      <form action={saveUnitAction} className="mt-6 grid gap-3 border border-dashed border-black/15 bg-[var(--color-bone)] p-4 sm:grid-cols-2 xl:grid-cols-4">
        <input type="hidden" name="project_id" value={project.id} />
        <Field label="Unit number"><input className={inputClass} name="unit_number" required /></Field>
        <Field label="Floor"><input className={inputClass} type="number" name="floor" required /></Field>
        <Field label="Bedrooms"><input className={inputClass} type="number" min="0" name="bedrooms" required /></Field>
        <Field label="Bathrooms"><input className={inputClass} type="number" min="0" name="bathrooms" required /></Field>
        <Field label="Property type"><input className={inputClass} name="property_type" defaultValue="Apartment" required /></Field>
        <Field label="Size sqft"><input className={inputClass} type="number" min="1" name="size_sqft" required /></Field>
        <Field label="View"><input className={inputClass} name="view_label" required /></Field>
        <Field label="Price AED"><input className={inputClass} type="number" min="0" name="price_aed" /></Field>
        <Field label="Availability"><select className={selectClass} name="availability"><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option><option value="unknown">Unknown</option></select></Field>
        <Field label="Last verified"><input className={inputClass} type="datetime-local" name="last_verified_at" /></Field>
        <Field label="Sort order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={units.length} /></Field>
        <div className="self-end"><button className="button button-dark" type="submit">Add unit</button></div>
      </form>
      <form action={importUnitsCsvAction} className="mt-5 grid gap-3 border border-[var(--color-teal)]/25 bg-[var(--color-teal-soft)] p-4 md:grid-cols-[1fr_auto] md:items-end">
        <input type="hidden" name="project_id" value={project.id} />
        <Field label="Bulk import / update units (CSV)" hint="Required columns: unit_number, floor, bedrooms, bathrooms, property_type, size_sqft, view, availability. Optional: price_aed, last_verified_at, sort_order. Existing unit numbers are updated."><input className={inputClass} type="file" name="file" accept=".csv,text/csv" required /></Field>
        <button className="button button-dark" type="submit">Import CSV</button>
      </form>
    </AdminCard>
  );
}

export function FloorPlanManager({
  project,
  plans,
  translations = [],
  returnTo = "/admin/content",
}: {
  project: CmsProjectRow;
  plans: CmsFloorPlanRow[];
  translations?: FrenchTranslation[];
  returnTo?: string;
}) {
  return (
    <AdminCard id="floor-plans" eyebrow="Layouts" title="Floor plans">
      <div className="grid gap-3 md:grid-cols-2">{plans.map((plan, index) => <div key={plan.id} className="border border-black/10 p-3"><div className="flex gap-4">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={plan.image_url} alt={plan.label} className="h-24 w-32 shrink-0 object-contain bg-[var(--color-bone)]" /><div className="min-w-0"><p className="font-semibold">{plan.label}</p><p className="mt-1 text-xs text-[var(--color-stone)]">{plan.bedrooms} BR · {plan.size_from_sqft.toLocaleString("en-US")}{plan.size_to_sqft ? `–${plan.size_to_sqft.toLocaleString("en-US")}` : ""} sqft</p><form action={deleteFloorPlanAction} className="mt-3"><input type="hidden" name="id" value={plan.id} /><input type="hidden" name="project_id" value={project.id} /><input type="hidden" name="storage_path" value={plan.storage_path} /><button className="text-xs font-semibold text-[var(--color-terracotta-deep)]">Delete</button></form></div></div><div className="mt-4 border-t border-black/10 pt-4"><EntityTranslationPanel entityType="floor-plan" entityKey={plan.id} current={translations[index]?.data ?? {}} status={translations[index]?.status ?? "draft"} fields={translationFieldProfiles["floor-plan"] ?? []} returnTo={returnTo} /></div></div>)}</div>
      <form action={saveFloorPlanAction} className="mt-6 grid gap-3 border border-dashed border-black/15 bg-[var(--color-bone)] p-4 sm:grid-cols-2 xl:grid-cols-4">
        <input type="hidden" name="project_id" value={project.id} /><input type="hidden" name="project_slug" value={project.slug} />
        <Field label="Image"><input className={inputClass} type="file" accept="image/*" name="file" required /></Field>
        <Field label="Label"><input className={inputClass} name="label" required /></Field>
        <Field label="Bedrooms"><input className={inputClass} type="number" min="0" name="bedrooms" required /></Field>
        <Field label="Property type"><input className={inputClass} name="property_type" defaultValue="Apartment" required /></Field>
        <Field label="Size from"><input className={inputClass} type="number" min="1" name="size_from_sqft" required /></Field>
        <Field label="Size to"><input className={inputClass} type="number" min="1" name="size_to_sqft" /></Field>
        <Field label="Sort order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={plans.length} /></Field>
        <div className="self-end"><button className="button button-dark">Add floor plan</button></div>
      </form>
    </AdminCard>
  );
}

export function DocumentManager({
  project,
  documents,
  translations = [],
  returnTo = "/admin/content",
}: {
  project: CmsProjectRow;
  documents: CmsDocumentRow[];
  translations?: FrenchTranslation[];
  returnTo?: string;
}) {
  return (
    <AdminCard id="documents" eyebrow="Documents" title="Project files">
      <div className="grid gap-2">{documents.map((doc, index) => <div key={doc.id} className="border border-black/10 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">{doc.label}</p><p className="mt-1 text-xs text-[var(--color-stone)]">{doc.kind} · {doc.availability}</p></div><form action={deleteDocumentAction}><input type="hidden" name="id" value={doc.id} /><input type="hidden" name="project_id" value={project.id} /><input type="hidden" name="storage_path" value={doc.storage_path ?? ""} /><input type="hidden" name="bucket" value={doc.bucket} /><button className="text-xs font-semibold text-[var(--color-terracotta-deep)]">Delete</button></form></div><div className="mt-4 border-t border-black/10 pt-4"><EntityTranslationPanel entityType="document" entityKey={doc.id} current={translations[index]?.data ?? {}} status={translations[index]?.status ?? "draft"} fields={translationFieldProfiles.document ?? []} returnTo={returnTo} /></div></div>)}</div>
      <form action={uploadDocumentAction} className="mt-6 grid gap-3 border border-dashed border-black/15 bg-[var(--color-bone)] p-4 md:grid-cols-2 xl:grid-cols-4">
        <input type="hidden" name="project_id" value={project.id} /><input type="hidden" name="project_slug" value={project.slug} />
        <Field label="File"><input className={inputClass} type="file" name="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*" required /></Field>
        <Field label="Label"><input className={inputClass} name="label" required /></Field>
        <Field label="Kind"><select className={selectClass} name="kind"><option>Brochure</option><option>Floor Plans</option><option>Payment Plan</option><option>Permit</option><option>Other</option></select></Field>
        <Field label="Availability"><select className={selectClass} name="availability"><option value="request-only">Request only</option><option value="available">Available</option><option value="coming-soon">Coming soon</option></select></Field>
        <Field label="Sort order"><input className={inputClass} type="number" min="0" name="sort_order" defaultValue={documents.length} /></Field>
        <div className="self-end"><button className="button button-dark">Upload document</button></div>
      </form>
    </AdminCard>
  );
}
