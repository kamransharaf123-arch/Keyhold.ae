"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAudit } from "@/lib/admin/audit";
import { destroyAdminSession, authenticateAdmin, requireAdmin } from "@/lib/admin/session";
import {
  booleanValue,
  commaList,
  enumValue,
  jsonValue,
  numberList,
  numberValue,
  optionalText,
  requiredText,
  safeId,
  slugValue,
} from "@/lib/admin/validation";
import { getAdminProject, listPaymentMilestones } from "@/lib/admin/queries";
import { csvObjects } from "@/lib/admin/csv";
import { getCmsEnvironment } from "@/lib/cms/config";
import { cmsDelete, cmsInsert, cmsSelect, cmsUpdate, cmsUpsertMany } from "@/lib/cms/rest";
import { deleteCmsFile, uploadCmsFile } from "@/lib/cms/storage";
import type { CmsAreaRow, CmsDeveloperRow, CmsProjectRow } from "@/types/admin";

const PROJECT_CATEGORIES = ["Off-Plan", "Ready", "Short-Term", "Long-Term"] as const;
const COMPLETION = ["pre-launch", "under-construction", "ready"] as const;
const UNIT_AVAILABILITY = ["available", "reserved", "sold", "unknown"] as const;
const IMAGE_CATEGORIES = ["Exterior", "Interior", "Amenities", "Master Plan", "Construction"] as const;
const DOCUMENT_KINDS = ["Brochure", "Floor Plans", "Payment Plan", "Permit", "Other"] as const;
const DOCUMENT_AVAILABILITY = ["available", "request-only", "coming-soon"] as const;

function cleanFormMessage(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 180);
}

export async function signInAction(formData: FormData) {
  const email = requiredText(formData, "email", 320).toLowerCase();
  const password = requiredText(formData, "password", 500);
  try {
    await authenticateAdmin(email, password);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    redirect(`/admin/login?error=${encodeURIComponent(cleanFormMessage(message))}`);
  }
  redirect("/admin");
}

export async function signOutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function saveProjectAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const existing = id ? await getAdminProject(id) : null;

  const category = enumValue(formData, "category", PROJECT_CATEGORIES);
  const rentalPeriod = category === "Short-Term" ? "night" : category === "Long-Term" ? "year" : null;
  const now = new Date().toISOString();
  const payload = {
    slug: slugValue(formData),
    title: requiredText(formData, "title", 180),
    category,
    developer_id: optionalText(formData, "developer_id", 80),
    area_id: optionalText(formData, "area_id", 80),
    location: requiredText(formData, "location", 180),
    short_description: requiredText(formData, "short_description", 500),
    overview: requiredText(formData, "overview", 8000),
    hero_image_url: optionalText(formData, "hero_image_url", 1200) ?? "",
    price_from_aed: numberValue(formData, "price_from_aed", { nullable: true, min: 0, integer: true }),
    rental_price_from_aed: numberValue(formData, "rental_price_from_aed", { nullable: true, min: 0, integer: true }),
    rental_period: rentalPeriod,
    bedrooms_label: requiredText(formData, "bedrooms_label", 120),
    bedrooms: numberList(formData, "bedrooms").map(Math.round),
    bathrooms_label: optionalText(formData, "bathrooms_label", 120),
    property_types: commaList(formData, "property_types"),
    size_from_sqft: numberValue(formData, "size_from_sqft", { nullable: true, min: 0, integer: true }),
    size_to_sqft: numberValue(formData, "size_to_sqft", { nullable: true, min: 0, integer: true }),
    handover_label: requiredText(formData, "handover_label", 120),
    handover_date: optionalText(formData, "handover_date", 20),
    completion_status: enumValue(formData, "completion_status", COMPLETION),
    amenities: commaList(formData, "amenities"),
    regulatory: jsonValue(formData, "regulatory", { registrationStatus: "pending-verification" }),
    availability_last_verified_at: optionalText(formData, "availability_last_verified_at", 40) ?? now,
    featured: booleanValue(formData, "featured"),
    footer_featured: booleanValue(formData, "footer_featured"),
    construction_progress: numberValue(formData, "construction_progress", { nullable: true, min: 0, max: 100 }),
    discovery: jsonValue(formData, "discovery", { investmentGoals: [], lifestyleTags: [], keywords: [] }),
    investment: jsonValue<Record<string, unknown> | null>(formData, "investment", null),
    key_facts: jsonValue<Array<{ label: string; value: string }>>(formData, "key_facts", []),
    seo: jsonValue(formData, "seo", {}),
    updated_at: now,
  };

  let project: CmsProjectRow;
  if (existing) {
    project = await cmsUpdate<CmsProjectRow>("cms_projects", `id=eq.${encodeURIComponent(existing.id)}`, payload);
    await writeAudit({ admin, action: "update", entityType: "project", entityId: project.id, summary: `Updated ${project.title}` });
  } else {
    project = await cmsInsert<CmsProjectRow>("cms_projects", { ...payload, status: "draft", created_at: now });
    await writeAudit({ admin, action: "create", entityType: "project", entityId: project.id, summary: `Created ${project.title}` });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${project.id}`);
  redirect(`/admin/projects/${project.id}?notice=saved`);
}

async function projectPublishProblems(projectId: string): Promise<string[]> {
  const project = await getAdminProject(projectId);
  if (!project) return ["Project was not found."];
  const problems: string[] = [];
  if (!project.developer_id) problems.push("Select a developer.");
  if (!project.area_id) problems.push("Select an area.");
  if (!project.hero_image_url) problems.push("Set a hero image.");
  if (project.property_types.length === 0) problems.push("Add at least one property type.");
  if (project.bedrooms.length === 0) problems.push("Add at least one bedroom value.");
  if ((project.category === "Off-Plan" || project.category === "Ready") && project.price_from_aed === null) {
    problems.push("Set a purchase price for an acquisition project.");
  }
  if ((project.category === "Short-Term" || project.category === "Long-Term") && project.rental_price_from_aed === null) {
    problems.push("Set a rental price for a rental project.");
  }
  const paymentPlan = await listPaymentMilestones(project.id);
  if (project.category === "Off-Plan" && paymentPlan.length > 0) {
    const total = paymentPlan.reduce((sum, item) => sum + Number(item.percentage), 0);
    if (Math.abs(total - 100) > 0.001) problems.push(`Payment plan totals ${total}% instead of 100%.`);
  }
  return problems;
}

export async function setProjectStatusAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  const status = enumValue(formData, "status", ["draft", "published", "archived"] as const);
  if (status === "published") {
    const problems = await projectPublishProblems(id);
    if (problems.length > 0) redirect(`/admin/projects/${id}?error=${encodeURIComponent(problems.join(" "))}`);
  }
  const project = await cmsUpdate<CmsProjectRow>("cms_projects", `id=eq.${encodeURIComponent(id)}`, {
    status,
    published_at: status === "published" ? new Date().toISOString() : undefined,
    updated_at: new Date().toISOString(),
  });
  await writeAudit({ admin, action: status, entityType: "project", entityId: id, summary: `${status}: ${project.title}` });
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${id}?notice=${encodeURIComponent(status)}`);
}

export async function deleteProjectAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin"]);
  const id = safeId(formData, "id");
  const project = await getAdminProject(id);
  if (project?.status === "published") redirect(`/admin/projects/${id}?error=${encodeURIComponent("Archive the project before deleting it.")}`);
  await cmsDelete("cms_projects", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "project", entityId: id, summary: `Deleted ${project?.title ?? id}` });
  revalidatePath("/admin/projects");
  redirect("/admin/projects?notice=deleted");
}

export async function saveDeveloperAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    slug: slugValue(formData),
    name: requiredText(formData, "name", 180),
    status: enumValue(formData, "status", ["draft", "published", "archived"] as const),
    summary: requiredText(formData, "summary", 3000),
    location: requiredText(formData, "location", 180),
    verified_facts_only: booleanValue(formData, "verified_facts_only"),
    updated_at: new Date().toISOString(),
  };
  const record = id
    ? await cmsUpdate<CmsDeveloperRow>("cms_developers", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<CmsDeveloperRow>("cms_developers", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "developer", entityId: record.id, summary: `${id ? "Updated" : "Created"} ${record.name}` });
  revalidatePath("/admin/developers");
  redirect("/admin/developers?notice=saved");
}

export async function saveAreaAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    slug: slugValue(formData),
    name: requiredText(formData, "name", 180),
    status: enumValue(formData, "status", ["draft", "published", "archived"] as const),
    summary: requiredText(formData, "summary", 3000),
    emirate: requiredText(formData, "emirate", 80),
    highlights: commaList(formData, "highlights"),
    map_x: numberValue(formData, "map_x", { min: 0, max: 100 }) ?? 50,
    map_y: numberValue(formData, "map_y", { min: 0, max: 100 }) ?? 50,
    updated_at: new Date().toISOString(),
  };
  const record = id
    ? await cmsUpdate<CmsAreaRow>("cms_areas", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<CmsAreaRow>("cms_areas", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "area", entityId: record.id, summary: `${id ? "Updated" : "Created"} ${record.name}` });
  revalidatePath("/admin/areas");
  redirect("/admin/areas?notice=saved");
}

export async function saveUnitAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const projectId = safeId(formData, "project_id");
  const payload = {
    project_id: projectId,
    unit_number: requiredText(formData, "unit_number", 80),
    floor: numberValue(formData, "floor", { min: -10, max: 400, integer: true }),
    bedrooms: numberValue(formData, "bedrooms", { min: 0, max: 30, integer: true }),
    bathrooms: numberValue(formData, "bathrooms", { min: 0, max: 30, integer: true }),
    property_type: requiredText(formData, "property_type", 120),
    size_sqft: numberValue(formData, "size_sqft", { min: 1, max: 200000, integer: true }),
    view_label: requiredText(formData, "view_label", 160),
    price_aed: numberValue(formData, "price_aed", { nullable: true, min: 0, integer: true }),
    availability: enumValue(formData, "availability", UNIT_AVAILABILITY),
    last_verified_at: optionalText(formData, "last_verified_at", 40) ?? new Date().toISOString(),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 100000, integer: true }) ?? 0,
  };
  if (id) await cmsUpdate("cms_units", `id=eq.${encodeURIComponent(id)}`, payload);
  else await cmsInsert("cms_units", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "unit", entityId: id || null, summary: `${id ? "Updated" : "Added"} unit ${payload.unit_number}` });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=unit-saved#units`);
}

export async function importUnitsCsvAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const projectId = safeId(formData, "project_id");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Select a CSV file to import.");
  if (file.size > 2 * 1024 * 1024) throw new Error("Unit CSV must be 2 MB or smaller.");
  const objects = csvObjects(await file.text());
  if (objects.length > 5000) throw new Error("A single unit import is limited to 5,000 rows.");
  const required = ["unit_number", "floor", "bedrooms", "bathrooms", "property_type", "size_sqft", "view", "availability"];
  const missing = required.filter((key) => !(key in (objects[0] ?? {})));
  if (missing.length) throw new Error(`Unit CSV is missing required columns: ${missing.join(", ")}.`);
  const allowedAvailability = new Set(UNIT_AVAILABILITY);
  const now = new Date().toISOString();
  const rows = objects.map((item, index) => {
    const rowNumber = index + 2;
    const number = (key: string, nullable = false) => {
      const raw = (item[key] ?? "").trim();
      if (!raw && nullable) return null;
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) throw new Error(`CSV row ${rowNumber}: ${key} must be numeric.`);
      return parsed;
    };
    const availability = (item.availability || "unknown").trim().toLowerCase();
    if (!allowedAvailability.has(availability as (typeof UNIT_AVAILABILITY)[number])) throw new Error(`CSV row ${rowNumber}: invalid availability '${availability}'.`);
    const unitNumber = (item.unit_number || "").trim();
    const propertyType = (item.property_type || "").trim();
    const view = (item.view || "").trim();
    if (!unitNumber || !propertyType || !view) throw new Error(`CSV row ${rowNumber}: unit_number, property_type and view are required.`);
    const floor = number("floor");
    const bedrooms = number("bedrooms");
    const bathrooms = number("bathrooms");
    const sizeSqft = number("size_sqft");
    if (floor! < -10 || floor! > 400 || bedrooms! < 0 || bathrooms! < 0 || sizeSqft! <= 0) throw new Error(`CSV row ${rowNumber}: one or more numeric values are outside allowed ranges.`);
    return {
      project_id: projectId,
      unit_number: unitNumber.slice(0, 80),
      floor: Math.round(floor!),
      bedrooms: Math.round(bedrooms!),
      bathrooms: Math.round(bathrooms!),
      property_type: propertyType.slice(0, 120),
      size_sqft: Math.round(sizeSqft!),
      view_label: view.slice(0, 160),
      price_aed: number("price_aed", true) === null ? null : Math.round(number("price_aed", true)!),
      availability,
      last_verified_at: (item.last_verified_at || "").trim() || now,
      sort_order: Math.round(number("sort_order", true) ?? index),
      updated_at: now,
    };
  });
  await cmsUpsertMany("cms_units", rows, "project_id,unit_number");
  await writeAudit({ admin, action: "bulk-import", entityType: "unit", entityId: projectId, summary: `Imported or updated ${rows.length} units` });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=${encodeURIComponent(`${rows.length} units imported or updated`)}#units`);
}

export async function deleteUnitAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  const projectId = safeId(formData, "project_id");
  await cmsDelete("cms_units", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "unit", entityId: id, summary: "Deleted unit" });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=unit-deleted#units`);
}

export async function savePaymentMilestoneAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const projectId = safeId(formData, "project_id");
  const payload = {
    project_id: projectId,
    label: requiredText(formData, "label", 120),
    percentage: numberValue(formData, "percentage", { min: 0, max: 100 }) ?? 0,
    timing: requiredText(formData, "timing", 180),
    note: optionalText(formData, "note", 1000),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 1000, integer: true }) ?? 0,
  };
  if (id) await cmsUpdate("cms_payment_milestones", `id=eq.${encodeURIComponent(id)}`, payload);
  else await cmsInsert("cms_payment_milestones", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "payment-milestone", entityId: id || null, summary: `${payload.label}: ${payload.percentage}%` });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=payment-saved#payment-plan`);
}

export async function deletePaymentMilestoneAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  const projectId = safeId(formData, "project_id");
  await cmsDelete("cms_payment_milestones", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "payment-milestone", entityId: id, summary: "Deleted payment milestone" });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=payment-deleted#payment-plan`);
}

export async function uploadProjectImageAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const projectId = safeId(formData, "project_id");
  const projectSlug = requiredText(formData, "project_slug", 120);
  const selected = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  const fallback = formData.get("file");
  const files = selected.length ? selected : fallback instanceof File && fallback.size > 0 ? [fallback] : [];
  if (files.length === 0) throw new Error("Select at least one image to upload.");
  if (files.length > 30) throw new Error("Upload a maximum of 30 images at a time.");
  const altPrefix = requiredText(formData, "alt_text", 260);
  const category = enumValue(formData, "category", IMAGE_CATEGORIES);
  const baseOrder = numberValue(formData, "sort_order", { min: 0, max: 1000, integer: true }) ?? 0;
  const setAsHero = booleanValue(formData, "set_as_hero");
  let firstPublicUrl = "";
  for (const [index, file] of files.entries()) {
    if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
    if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name} exceeds the 20 MB image limit.`);
    const uploaded = await uploadCmsFile({ bucket: "keyhold-media", folder: `projects/${projectSlug}`, file });
    if (!uploaded.publicUrl) throw new Error("Project media upload did not return a public URL.");
    if (!firstPublicUrl) firstPublicUrl = uploaded.publicUrl;
    const readableName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
    await cmsInsert<{ id: string }>("cms_project_images", {
      project_id: projectId,
      storage_path: uploaded.storagePath,
      public_url: uploaded.publicUrl,
      alt_text: files.length === 1 ? altPrefix : `${altPrefix} — ${readableName || `image ${index + 1}`}`,
      category,
      sort_order: baseOrder + index,
    });
  }
  if (setAsHero && firstPublicUrl) {
    await cmsUpdate("cms_projects", `id=eq.${encodeURIComponent(projectId)}`, { hero_image_url: firstPublicUrl, updated_at: new Date().toISOString() });
  }
  await writeAudit({ admin, action: "upload", entityType: "project-image", entityId: projectId, summary: `Uploaded ${files.length} project image${files.length === 1 ? "" : "s"} for ${projectSlug}` });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=${encodeURIComponent(`${files.length} image${files.length === 1 ? "" : "s"} uploaded`)}#media`);
}

export async function deleteProjectImageAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  const projectId = safeId(formData, "project_id");
  const storagePath = requiredText(formData, "storage_path", 1000);
  await cmsDelete("cms_project_images", `id=eq.${encodeURIComponent(id)}`);
  await deleteCmsFile("keyhold-media", storagePath);
  await writeAudit({ admin, action: "delete", entityType: "project-image", entityId: id, summary: "Deleted project image" });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=image-deleted#media`);
}

export async function uploadDocumentAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const projectId = safeId(formData, "project_id");
  const projectSlug = requiredText(formData, "project_slug", 120);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Select a document to upload.");
  if (file.size > 30 * 1024 * 1024) throw new Error("Documents must be 30 MB or smaller.");
  const availability = enumValue(formData, "availability", DOCUMENT_AVAILABILITY);
  const bucket = availability === "available" ? "keyhold-public-documents" : "keyhold-private-documents";
  const uploaded = await uploadCmsFile({ bucket, folder: `projects/${projectSlug}`, file });
  const record = await cmsInsert<{ id: string }>("cms_documents", {
    project_id: projectId,
    label: requiredText(formData, "label", 180),
    kind: enumValue(formData, "kind", DOCUMENT_KINDS),
    availability,
    bucket,
    storage_path: uploaded.storagePath,
    public_url: uploaded.publicUrl,
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 1000, integer: true }) ?? 0,
  });
  await writeAudit({ admin, action: "upload", entityType: "document", entityId: record.id, summary: `Uploaded ${file.name}` });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=document-uploaded#documents`);
}

export async function deleteDocumentAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  const projectId = safeId(formData, "project_id");
  const storagePath = optionalText(formData, "storage_path", 1000);
  const bucket = optionalText(formData, "bucket", 120) ?? "keyhold-private-documents";
  await cmsDelete("cms_documents", `id=eq.${encodeURIComponent(id)}`);
  if (storagePath) await deleteCmsFile(bucket, storagePath);
  await writeAudit({ admin, action: "delete", entityType: "document", entityId: id, summary: "Deleted project document" });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=document-deleted#documents`);
}

export async function saveFloorPlanAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const projectId = safeId(formData, "project_id");
  const projectSlug = requiredText(formData, "project_slug", 120);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Select a floor plan image.");
  if (!file.type.startsWith("image/")) throw new Error("Floor plans must be uploaded as images.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Floor plan images must be 20 MB or smaller.");
  const uploaded = await uploadCmsFile({ bucket: "keyhold-media", folder: `floor-plans/${projectSlug}`, file });
  if (!uploaded.publicUrl) throw new Error("Floor-plan upload did not return a public URL.");
  const record = await cmsInsert<{ id: string }>("cms_floor_plans", {
    project_id: projectId,
    label: requiredText(formData, "label", 160),
    bedrooms: numberValue(formData, "bedrooms", { min: 0, max: 30, integer: true }),
    property_type: requiredText(formData, "property_type", 120),
    size_from_sqft: numberValue(formData, "size_from_sqft", { min: 1, max: 200000, integer: true }),
    size_to_sqft: numberValue(formData, "size_to_sqft", { nullable: true, min: 1, max: 200000, integer: true }),
    storage_path: uploaded.storagePath,
    image_url: uploaded.publicUrl,
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 1000, integer: true }) ?? 0,
  });
  await writeAudit({ admin, action: "create", entityType: "floor-plan", entityId: record.id, summary: "Added floor plan" });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=floorplan-saved#floor-plans`);
}

export async function deleteFloorPlanAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  const projectId = safeId(formData, "project_id");
  const storagePath = requiredText(formData, "storage_path", 1000);
  await cmsDelete("cms_floor_plans", `id=eq.${encodeURIComponent(id)}`);
  await deleteCmsFile("keyhold-media", storagePath);
  await writeAudit({ admin, action: "delete", entityType: "floor-plan", entityId: id, summary: "Deleted floor plan" });
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?notice=floorplan-deleted#floor-plans`);
}

export async function saveConstructionUpdateAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const projectId = safeId(formData, "project_id");
  const payload = {
    slug: slugValue(formData),
    project_id: projectId,
    status: enumValue(formData, "status", ["draft", "published", "archived"] as const),
    progress: numberValue(formData, "progress", { min: 0, max: 100 }) ?? 0,
    status_label: requiredText(formData, "status_label", 160),
    updated_at_label: requiredText(formData, "updated_at_label", 160),
    published_at: optionalText(formData, "published_at", 40) ?? new Date().toISOString(),
    image_url: optionalText(formData, "image_url", 1200) ?? "",
    summary: requiredText(formData, "summary", 3000),
    milestones: commaList(formData, "milestones"),
    updated_at: new Date().toISOString(),
  };
  const record = id
    ? await cmsUpdate<{ id: string }>("cms_construction_updates", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_construction_updates", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "construction-update", entityId: record.id, summary: `Saved construction update ${payload.slug}` });
  revalidatePath("/admin/updates");
  redirect("/admin/updates?notice=saved");
}

export async function saveIntelligenceAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const projectId = safeId(formData, "project_id");
  const projectSlug = requiredText(formData, "project_slug", 120);
  const dataStatus = enumValue(formData, "data_status", ["demo-placeholder", "pending-verification", "verified"] as const);
  const payload = {
    project_id: projectId,
    data_status: dataStatus,
    last_reviewed_at: optionalText(formData, "last_reviewed_at", 40) ?? new Date().toISOString(),
    score_dimensions: jsonValue(formData, "score_dimensions", []),
    risk_dimensions: jsonValue(formData, "risk_dimensions", []),
    developer_delivery_score: numberValue(formData, "developer_delivery_score", { min: 0, max: 10 }) ?? 0,
    developer_delivery_rationale: requiredText(formData, "developer_delivery_rationale", 2000),
    liquidity_score: numberValue(formData, "liquidity_score", { min: 0, max: 10 }) ?? 0,
    liquidity_rationale: requiredText(formData, "liquidity_rationale", 2000),
    price_history: jsonValue(formData, "price_history", []),
    comparables: jsonValue(formData, "comparables", []),
    supply_pipeline: jsonValue(formData, "supply_pipeline", []),
    view_intelligence: jsonValue(formData, "view_intelligence", []),
    verdict: jsonValue(formData, "verdict", { headline: "", summary: "", whyWeLikeIt: [], whatWeWouldWatch: [], bestFor: [] }),
    updated_at: new Date().toISOString(),
  };
  const existing = await cmsSelect<{ id: string }>("cms_intelligence_profiles", `select=id&project_id=eq.${encodeURIComponent(projectId)}&limit=1`);
  const record = existing[0]
    ? await cmsUpdate<{ id: string }>("cms_intelligence_profiles", `id=eq.${encodeURIComponent(existing[0].id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_intelligence_profiles", payload);
  await writeAudit({ admin, action: existing[0] ? "update" : "create", entityType: "intelligence", entityId: record.id, summary: `Saved intelligence for ${projectSlug}` });
  revalidatePath(`/admin/intelligence/${projectId}`);
  redirect(`/admin/intelligence/${projectId}?notice=saved`);
}

export async function saveIntelligenceSourceAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const projectId = safeId(formData, "project_id");
  const payload = {
    project_id: projectId,
    source_key: requiredText(formData, "source_key", 160),
    label: requiredText(formData, "label", 300),
    category: enumValue(formData, "category", ["Developer material", "Public record", "Market evidence", "KeyHold analysis", "User supplied"] as const),
    status: enumValue(formData, "status", ["demo-placeholder", "pending-verification", "verified"] as const),
    last_checked_at: optionalText(formData, "last_checked_at", 40) ?? new Date().toISOString(),
    url: optionalText(formData, "url", 1500),
    note: optionalText(formData, "note", 3000),
  };
  const record = id
    ? await cmsUpdate<{ id: string }>("cms_intelligence_sources", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_intelligence_sources", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "intelligence-source", entityId: record.id, summary: `Saved source ${payload.label}` });
  revalidatePath(`/admin/intelligence/${projectId}`);
  redirect(`/admin/intelligence/${projectId}?notice=source-saved#sources`);
}

export async function saveSiteSettingsAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin"]);
  const payload = {
    id: "00000000-0000-0000-0000-000000000001",
    company_name: requiredText(formData, "company_name", 180),
    legal_name: requiredText(formData, "legal_name", 240),
    email: requiredText(formData, "email", 320),
    phone: optionalText(formData, "phone", 80),
    location: requiredText(formData, "location", 240),
    address_line: optionalText(formData, "address_line", 500),
    orn: optionalText(formData, "orn", 120),
    trade_license: optionalText(formData, "trade_license", 120),
    socials: jsonValue(formData, "socials", []),
    google_reviews: jsonValue(formData, "google_reviews", { rating: null, reviewCount: null, href: "" }),
    languages: commaList(formData, "languages"),
    updated_at: new Date().toISOString(),
  };
  const existing = await cmsSelect<{ id: string }>("cms_site_settings", `select=id&id=eq.${payload.id}&limit=1`);
  if (existing[0]) await cmsUpdate("cms_site_settings", `id=eq.${payload.id}`, payload);
  else await cmsInsert("cms_site_settings", payload);
  await writeAudit({ admin, action: "update", entityType: "site-settings", entityId: payload.id, summary: "Updated KeyHold site settings" });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?notice=saved");
}

export async function saveInsightAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    slug: slugValue(formData),
    status: enumValue(formData, "status", ["draft", "published", "archived"] as const),
    category: requiredText(formData, "category", 120),
    title: requiredText(formData, "title", 240),
    excerpt: requiredText(formData, "excerpt", 600),
    body: optionalText(formData, "body", 40000) ?? "",
    cover_image_url: optionalText(formData, "cover_image_url", 1200),
    published_at: optionalText(formData, "published_at", 40) ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const record = id ? await cmsUpdate<{ id: string }>("cms_insights", `id=eq.${encodeURIComponent(id)}`, payload) : await cmsInsert<{ id: string }>("cms_insights", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "insight", entityId: record.id, summary: `Saved insight ${payload.title}` });
  revalidatePath("/admin/content");
  redirect("/admin/content?notice=insight-saved");
}

export async function saveServiceAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    slug: slugValue(formData),
    status: enumValue(formData, "status", ["draft", "published", "archived"] as const),
    title: requiredText(formData, "title", 180),
    text: requiredText(formData, "text", 3000),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 1000, integer: true }) ?? 0,
    updated_at: new Date().toISOString(),
  };
  const record = id ? await cmsUpdate<{ id: string }>("cms_services", `id=eq.${encodeURIComponent(id)}`, payload) : await cmsInsert<{ id: string }>("cms_services", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "service", entityId: record.id, summary: `Saved service ${payload.title}` });
  revalidatePath("/admin/content");
  redirect("/admin/content?notice=service-saved");
}

export async function triggerLiveDeployAction() {
  const admin = await requireAdmin(["owner", "admin"]);
  const env = getCmsEnvironment();
  if (!env.netlifyBuildHookUrl) redirect("/admin?error=NETLIFY_BUILD_HOOK_URL%20is%20not%20configured");
  const response = await fetch(env.netlifyBuildHookUrl, { method: "POST", cache: "no-store" });
  if (!response.ok) redirect(`/admin?error=${encodeURIComponent(`Netlify build hook returned ${response.status}`)}`);
  await writeAudit({ admin, action: "deploy", entityType: "site", summary: "Triggered Netlify production build from KeyHold Admin" });
  redirect("/admin?notice=deploy-triggered");
}
