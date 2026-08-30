"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/session";
import {
  booleanValue,
  commaList,
  enumValue,
  jsonValue,
  numberValue,
  optionalText,
  requiredText,
  safeId,
  slugValue,
} from "@/lib/admin/validation";
import { cmsDelete, cmsInsert, cmsSelect, cmsUpdate } from "@/lib/cms/rest";
import { deleteCmsFile, uploadCmsFile } from "@/lib/cms/storage";

const STATUS = ["draft", "published", "archived"] as const;
const NAV_GROUPS = ["header-primary", "projects-dropdown", "footer-projects", "footer-guides", "footer-services", "footer-company", "legal", "mobile-extra"] as const;
const MEDIA_KINDS = ["image", "video", "logo", "icon", "document"] as const;

function safeHref(formData: FormData, key: string, required = false): string | null {
  const raw = required ? requiredText(formData, key, 1200) : optionalText(formData, key, 1200);
  if (!raw) return null;
  if (raw.startsWith("/") || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return raw;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${key} must be an internal path or a valid HTTPS URL.`);
  }
}

function routeValue(formData: FormData): string {
  const value = requiredText(formData, "route", 300).toLowerCase();
  if (value !== "/" && !/^\/[a-z0-9/_-]*$/.test(value)) throw new Error("route must be a safe internal path.");
  return value;
}

async function optionalPublicUpload(formData: FormData, key: string, folder: string, existingUrl: string | null): Promise<string | null> {
  const file = formData.get(key);
  if (!(file instanceof File) || file.size === 0) return existingUrl;
  if (!file.type.startsWith("image/")) throw new Error(`${key} must be an image file.`);
  if (file.size > 20 * 1024 * 1024) throw new Error(`${key} must be 20 MB or smaller.`);
  const uploaded = await uploadCmsFile({ bucket: "keyhold-media", folder, file });
  if (!uploaded.publicUrl) throw new Error(`${key} upload did not return a public URL.`);
  return uploaded.publicUrl;
}

export async function saveWebsiteSettingsAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin"]);
  const currentLogo = optionalText(formData, "logo_url", 1200);
  const currentLogoMark = optionalText(formData, "logo_mark_url", 1200);
  const currentOg = optionalText(formData, "default_og_image_url", 1200);
  const [logoUrl, logoMarkUrl, ogUrl] = await Promise.all([
    optionalPublicUpload(formData, "logo_file", "website/brand", currentLogo),
    optionalPublicUpload(formData, "logo_mark_file", "website/brand", currentLogoMark),
    optionalPublicUpload(formData, "default_og_image_file", "website/brand", currentOg),
  ]);
  const payload = {
    id: "00000000-0000-0000-0000-000000000061",
    brand_name: requiredText(formData, "brand_name", 160),
    logo_text: requiredText(formData, "logo_text", 160),
    logo_url: logoUrl,
    logo_mark_url: logoMarkUrl,
    logo_alt: requiredText(formData, "logo_alt", 240),
    default_og_image_url: ogUrl,
    projects_menu_label: requiredText(formData, "projects_menu_label", 80),
    header_cta_label: requiredText(formData, "header_cta_label", 100),
    header_cta_href: safeHref(formData, "header_cta_href", true),
    footer_tagline: requiredText(formData, "footer_tagline", 1200),
    footer_disclaimer: requiredText(formData, "footer_disclaimer", 5000),
    copyright_text: requiredText(formData, "copyright_text", 300),
    locations_label: requiredText(formData, "locations_label", 300),
    global_cta: jsonValue(formData, "global_cta", {}),
    announcement: jsonValue(formData, "announcement", { enabled: false, text: "", href: "" }),
    ui_copy: jsonValue(formData, "ui_copy", {}),
    theme: jsonValue(formData, "theme", {}),
    updated_at: new Date().toISOString(),
  };
  const existing = await cmsSelect<{ id: string }>("cms_website_settings", `select=id&id=eq.${payload.id}&limit=1`);
  if (existing[0]) await cmsUpdate("cms_website_settings", `id=eq.${payload.id}`, payload);
  else await cmsInsert("cms_website_settings", payload);
  await writeAudit({ admin, action: "update", entityType: "website-settings", entityId: payload.id, summary: "Updated global website content and brand settings" });
  revalidatePath("/admin/website/global");
  redirect("/admin/website/global?notice=saved");
}

export async function saveWebsitePageAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const currentHero = optionalText(formData, "hero_image_url", 1200);
  const currentOg = optionalText(formData, "og_image_url", 1200);
  const [heroImageUrl, ogImageUrl] = await Promise.all([
    optionalPublicUpload(formData, "hero_image_file", "website/pages", currentHero),
    optionalPublicUpload(formData, "og_image_file", "website/pages", currentOg),
  ]);
  const payload = {
    page_key: slugValue(formData, "page_key"),
    route: routeValue(formData),
    status: enumValue(formData, "status", STATUS),
    nav_title: requiredText(formData, "nav_title", 180),
    eyebrow: optionalText(formData, "eyebrow", 240),
    hero_title: requiredText(formData, "hero_title", 500),
    hero_subtitle: optionalText(formData, "hero_subtitle", 2000),
    hero_image_url: heroImageUrl,
    hero_image_alt: optionalText(formData, "hero_image_alt", 500),
    hero_video_url: optionalText(formData, "hero_video_url", 1200),
    primary_cta_label: optionalText(formData, "primary_cta_label", 120),
    primary_cta_href: safeHref(formData, "primary_cta_href"),
    secondary_cta_label: optionalText(formData, "secondary_cta_label", 120),
    secondary_cta_href: safeHref(formData, "secondary_cta_href"),
    seo_title: optionalText(formData, "seo_title", 180),
    seo_description: optionalText(formData, "seo_description", 500),
    og_image_url: ogImageUrl,
    settings: jsonValue(formData, "settings", {}),
    updated_at: new Date().toISOString(),
  };
  const record = id
    ? await cmsUpdate<{ id: string }>("cms_pages", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_pages", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "website-page", entityId: record.id, summary: `Saved website page ${payload.page_key}` });
  revalidatePath("/admin/website/pages");
  redirect(`/admin/website/pages?notice=${encodeURIComponent(`${payload.nav_title} saved`)}`);
}

export async function saveWebsiteSectionAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const pageId = safeId(formData, "page_id");
  const currentImage = optionalText(formData, "image_url", 1200);
  const imageUrl = await optionalPublicUpload(formData, "image_file", "website/sections", currentImage);
  const payload = {
    page_id: pageId,
    section_key: slugValue(formData, "section_key"),
    section_type: requiredText(formData, "section_type", 120),
    enabled: booleanValue(formData, "enabled"),
    eyebrow: optionalText(formData, "eyebrow", 240),
    title: optionalText(formData, "title", 600),
    body: optionalText(formData, "body", 12000),
    image_url: imageUrl,
    image_alt: optionalText(formData, "image_alt", 500),
    cta_label: optionalText(formData, "cta_label", 120),
    cta_href: safeHref(formData, "cta_href"),
    style_variant: optionalText(formData, "style_variant", 120) ?? "default",
    payload: jsonValue(formData, "payload", {}),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 5000, integer: true }) ?? 0,
    updated_at: new Date().toISOString(),
  };
  const record = id
    ? await cmsUpdate<{ id: string }>("cms_page_sections", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_page_sections", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "website-section", entityId: record.id, summary: `Saved website section ${payload.section_key}` });
  revalidatePath("/admin/website/pages");
  redirect(`/admin/website/pages?notice=${encodeURIComponent(`Section ${payload.section_key} saved`)}`);
}

export async function deleteWebsiteSectionAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  await cmsDelete("cms_page_sections", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "website-section", entityId: id, summary: "Deleted website section" });
  revalidatePath("/admin/website/pages");
  redirect("/admin/website/pages?notice=section-deleted");
}

export async function saveNavigationItemAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    nav_group: enumValue(formData, "nav_group", NAV_GROUPS),
    label: requiredText(formData, "label", 160),
    href: safeHref(formData, "href", true),
    enabled: booleanValue(formData, "enabled"),
    external: booleanValue(formData, "external"),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 5000, integer: true }) ?? 0,
    updated_at: new Date().toISOString(),
  };
  const record = id
    ? await cmsUpdate<{ id: string }>("cms_navigation_items", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_navigation_items", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "navigation-item", entityId: record.id, summary: `Saved navigation item ${payload.label}` });
  revalidatePath("/admin/website/navigation");
  redirect("/admin/website/navigation?notice=saved");
}

export async function deleteNavigationItemAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  await cmsDelete("cms_navigation_items", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "navigation-item", entityId: id, summary: "Deleted navigation item" });
  revalidatePath("/admin/website/navigation");
  redirect("/admin/website/navigation?notice=deleted");
}

export async function uploadGlobalMediaAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Select a file to upload.");
  if (file.size > 30 * 1024 * 1024) throw new Error("Global media must be 30 MB or smaller.");
  const kind = enumValue(formData, "kind", MEDIA_KINDS);
  if (["image", "logo", "icon"].includes(kind) && !file.type.startsWith("image/")) throw new Error("This media kind requires an image file.");
  const bucket = kind === "document" ? "keyhold-public-documents" : "keyhold-media";
  const uploaded = await uploadCmsFile({ bucket, folder: `website/${kind}`, file });
  if (!uploaded.publicUrl) throw new Error("Global media upload did not return a public URL.");
  const record = await cmsInsert<{ id: string }>("cms_media_library", {
    label: requiredText(formData, "label", 240),
    kind,
    bucket,
    storage_path: uploaded.storagePath,
    public_url: uploaded.publicUrl,
    alt_text: optionalText(formData, "alt_text", 500) ?? "",
    tags: commaList(formData, "tags"),
  });
  await writeAudit({ admin, action: "upload", entityType: "global-media", entityId: record.id, summary: `Uploaded website media ${file.name}` });
  revalidatePath("/admin/website/media");
  redirect("/admin/website/media?notice=uploaded");
}

export async function deleteGlobalMediaAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  const bucket = requiredText(formData, "bucket", 120);
  const storagePath = requiredText(formData, "storage_path", 1000);
  if (!(["keyhold-media", "keyhold-public-documents"] as string[]).includes(bucket)) throw new Error("Unsupported media bucket.");
  await cmsDelete("cms_media_library", `id=eq.${encodeURIComponent(id)}`);
  await deleteCmsFile(bucket, storagePath);
  await writeAudit({ admin, action: "delete", entityType: "global-media", entityId: id, summary: "Deleted website media" });
  revalidatePath("/admin/website/media");
  redirect("/admin/website/media?notice=deleted");
}

export async function savePersonAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const currentImage = optionalText(formData, "image_url", 1200);
  const imageUrl = await optionalPublicUpload(formData, "image_file", "website/team", currentImage);
  const payload = {
    slug: slugValue(formData),
    status: enumValue(formData, "status", STATUS),
    name: requiredText(formData, "name", 180),
    role: requiredText(formData, "role", 180),
    bio: optionalText(formData, "bio", 8000) ?? "",
    image_url: imageUrl,
    email: optionalText(formData, "email", 320),
    phone: optionalText(formData, "phone", 100),
    linkedin_url: safeHref(formData, "linkedin_url"),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 5000, integer: true }) ?? 0,
    updated_at: new Date().toISOString(),
  };
  const record = id ? await cmsUpdate<{ id: string }>("cms_people", `id=eq.${encodeURIComponent(id)}`, payload) : await cmsInsert<{ id: string }>("cms_people", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "person", entityId: record.id, summary: `Saved team member ${payload.name}` });
  revalidatePath("/admin/website/people");
  redirect("/admin/website/people?notice=saved");
}

export async function deletePersonAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  await cmsDelete("cms_people", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "person", entityId: id, summary: "Deleted team member" });
  revalidatePath("/admin/website/people");
  redirect("/admin/website/people?notice=deleted");
}

export async function saveTestimonialAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const currentImage = optionalText(formData, "image_url", 1200);
  const imageUrl = await optionalPublicUpload(formData, "image_file", "website/testimonials", currentImage);
  const payload = {
    status: enumValue(formData, "status", STATUS),
    name: requiredText(formData, "name", 180),
    descriptor: optionalText(formData, "descriptor", 300),
    quote: requiredText(formData, "quote", 6000),
    image_url: imageUrl,
    source_label: optionalText(formData, "source_label", 200),
    source_url: safeHref(formData, "source_url"),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 5000, integer: true }) ?? 0,
    updated_at: new Date().toISOString(),
  };
  const record = id ? await cmsUpdate<{ id: string }>("cms_testimonials", `id=eq.${encodeURIComponent(id)}`, payload) : await cmsInsert<{ id: string }>("cms_testimonials", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "testimonial", entityId: record.id, summary: `Saved testimonial ${payload.name}` });
  revalidatePath("/admin/website/testimonials");
  redirect("/admin/website/testimonials?notice=saved");
}

export async function deleteTestimonialAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  await cmsDelete("cms_testimonials", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "testimonial", entityId: id, summary: "Deleted testimonial" });
  revalidatePath("/admin/website/testimonials");
  redirect("/admin/website/testimonials?notice=deleted");
}

export async function saveFaqAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    status: enumValue(formData, "status", STATUS),
    scope: requiredText(formData, "scope", 160),
    category: optionalText(formData, "category", 160),
    question: requiredText(formData, "question", 800),
    answer: requiredText(formData, "answer", 12000),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 5000, integer: true }) ?? 0,
    updated_at: new Date().toISOString(),
  };
  const record = id ? await cmsUpdate<{ id: string }>("cms_faqs", `id=eq.${encodeURIComponent(id)}`, payload) : await cmsInsert<{ id: string }>("cms_faqs", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "faq", entityId: record.id, summary: `Saved FAQ ${payload.question.slice(0, 80)}` });
  revalidatePath("/admin/website/faqs");
  redirect("/admin/website/faqs?notice=saved");
}

export async function deleteFaqAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  await cmsDelete("cms_faqs", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "faq", entityId: id, summary: "Deleted FAQ" });
  revalidatePath("/admin/website/faqs");
  redirect("/admin/website/faqs?notice=deleted");
}
