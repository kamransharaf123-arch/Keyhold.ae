"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/session";
import { booleanValue, jsonValue, numberValue, optionalText, requiredText, safeId } from "@/lib/admin/validation";
import { cmsDelete, cmsInsert, cmsSelect, cmsUpdate } from "@/lib/cms/rest";
import type { TranslationEntityType } from "@/types/localization";

const ENTITY_TYPES: TranslationEntityType[] = [
  "website-settings","website-page","website-section","navigation-item","person","testimonial","faq","form",
  "project","developer","area","unit","payment-milestone","floor-plan","document","construction-update",
  "intelligence-profile","intelligence-source","insight","service",
];

function localeValue(formData: FormData): string {
  const value = requiredText(formData, "locale", 12).toLowerCase();
  if (!/^[a-z]{2}(?:-[a-z]{2})?$/.test(value)) throw new Error("Invalid locale code.");
  return value;
}

function entityTypeValue(formData: FormData): TranslationEntityType {
  const value = requiredText(formData, "entity_type", 80) as TranslationEntityType;
  if (!ENTITY_TYPES.includes(value)) throw new Error("Unsupported translation entity type.");
  return value;
}

function entityKeyValue(formData: FormData): string {
  const value = requiredText(formData, "entity_key", 500);
  if (!/^[A-Za-z0-9/_:.[\]-]+$/.test(value)) throw new Error("Entity key contains unsupported characters.");
  return value;
}

export async function saveLocaleAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin"]);
  const locale = localeValue(formData);
  const payload = {
    locale,
    label: requiredText(formData, "label", 80),
    native_label: requiredText(formData, "native_label", 80),
    enabled: booleanValue(formData, "enabled"),
    is_default: booleanValue(formData, "is_default"),
    route_prefix: optionalText(formData, "route_prefix", 40) ?? "",
    hreflang: requiredText(formData, "hreflang", 20),
    direction: requiredText(formData, "direction", 3) === "rtl" ? "rtl" : "ltr",
    fallback_locale: optionalText(formData, "fallback_locale", 12),
    sort_order: numberValue(formData, "sort_order", { min: 0, max: 1000, integer: true }) ?? 0,
    updated_at: new Date().toISOString(),
  };
  if (payload.is_default) {
    const existingDefaults = await cmsSelect<{ locale: string }>("cms_locale_settings", "select=locale&is_default=eq.true");
    await Promise.all(existingDefaults.filter((row) => row.locale !== locale).map((row) => cmsUpdate("cms_locale_settings", `locale=eq.${encodeURIComponent(row.locale)}`, { is_default: false })));
  }
  const existing = await cmsSelect<{ locale: string }>("cms_locale_settings", `select=locale&locale=eq.${encodeURIComponent(locale)}&limit=1`);
  if (existing[0]) await cmsUpdate("cms_locale_settings", `locale=eq.${encodeURIComponent(locale)}`, payload);
  else await cmsInsert("cms_locale_settings", payload);
  await writeAudit({ admin, action: existing[0] ? "update" : "create", entityType: "locale", entityId: locale, summary: `Saved website locale ${locale}` });
  revalidatePath("/admin/website/languages");
  redirect("/admin/website/languages?notice=saved");
}

export async function saveTranslationAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    entity_type: entityTypeValue(formData),
    entity_key: entityKeyValue(formData),
    locale: localeValue(formData),
    status: requiredText(formData, "status", 20) === "published" ? "published" : "draft",
    data: jsonValue(formData, "data", {}),
    updated_at: new Date().toISOString(),
  };
  const record = id
    ? await cmsUpdate<{ id: string }>("cms_translations", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_translations", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "translation", entityId: record.id, summary: `Saved ${payload.locale} translation for ${payload.entity_type}:${payload.entity_key}` });
  revalidatePath("/admin/website/translations");
  redirect("/admin/website/translations?notice=saved");
}

export async function deleteTranslationAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = safeId(formData, "id");
  await cmsDelete("cms_translations", `id=eq.${encodeURIComponent(id)}`);
  await writeAudit({ admin, action: "delete", entityType: "translation", entityId: id, summary: "Deleted translation" });
  revalidatePath("/admin/website/translations");
  redirect("/admin/website/translations?notice=deleted");
}


export async function saveFriendlyTranslationAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const entityType = entityTypeValue(formData);
  const entityKey = entityKeyValue(formData);
  const locale = localeValue(formData);
  const status = requiredText(formData, "status", 20) === "published" ? "published" : "draft";
  const returnTo = requiredText(formData, "return_to", 500);
  if (!returnTo.startsWith("/admin/")) throw new Error("Unsafe translation return path.");
  const schema = jsonValue(formData, "field_schema", []) as Array<{ key?: unknown; kind?: unknown }>;
  if (!Array.isArray(schema) || schema.length > 80) throw new Error("Invalid translation schema.");
  const data: Record<string, unknown> = {};
  for (const field of schema) {
    const key = typeof field.key === "string" ? field.key : "";
    const kind = typeof field.kind === "string" ? field.kind : "text";
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(key)) throw new Error("Invalid translation field key.");
    const raw = String(formData.get(`tr__${key}`) ?? "").trim();
    if (!raw) continue;
    if (kind === "array") {
      data[key] = raw.split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean);
    } else if (kind === "json") {
      try { data[key] = JSON.parse(raw); } catch { throw new Error(`${key} must contain valid JSON.`); }
    } else {
      data[key] = raw;
    }
  }
  const existing = await cmsSelect<{ id: string }>("cms_translations", `select=id&entity_type=eq.${encodeURIComponent(entityType)}&entity_key=eq.${encodeURIComponent(entityKey)}&locale=eq.${encodeURIComponent(locale)}&limit=1`);
  const payload = { entity_type: entityType, entity_key: entityKey, locale, status, data, updated_at: new Date().toISOString() };
  const record = existing[0]
    ? await cmsUpdate<{ id: string }>("cms_translations", `id=eq.${encodeURIComponent(existing[0].id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_translations", payload);
  await writeAudit({ admin, action: existing[0] ? "update" : "create", entityType: "translation", entityId: record.id, summary: `Saved ${locale} translation for ${entityType}:${entityKey}` });
  revalidatePath(returnTo);
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}notice=translation-saved`);
}

export async function saveFormCopyAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();
  const formKey = requiredText(formData, "form_key", 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formKey)) throw new Error("Invalid form key.");
  const payload = {
    form_key: formKey,
    enabled: booleanValue(formData, "enabled"),
    title: optionalText(formData, "title", 400) ?? "",
    intro: optionalText(formData, "intro", 4000) ?? "",
    submit_label: requiredText(formData, "submit_label", 160),
    success_message: requiredText(formData, "success_message", 1200),
    consent_text: optionalText(formData, "consent_text", 3000) ?? "",
    privacy_label: optionalText(formData, "privacy_label", 200) ?? "Privacy Policy",
    fields: jsonValue(formData, "fields", {}),
    settings: jsonValue(formData, "settings", {}),
    updated_at: new Date().toISOString(),
  };
  const record = id
    ? await cmsUpdate<{ id: string }>("cms_form_copy", `id=eq.${encodeURIComponent(id)}`, payload)
    : await cmsInsert<{ id: string }>("cms_form_copy", payload);
  await writeAudit({ admin, action: id ? "update" : "create", entityType: "form-copy", entityId: record.id, summary: `Saved form copy ${formKey}` });
  revalidatePath("/admin/website/forms");
  redirect("/admin/website/forms?notice=saved");
}
