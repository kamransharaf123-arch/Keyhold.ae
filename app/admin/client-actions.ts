"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/session";
import { writeAudit } from "@/lib/admin/audit";
import { cmsInsert, cmsUpdate } from "@/lib/cms/rest";
import { uploadCmsFile } from "@/lib/cms/storage";
import { evaluateClientWatchlists } from "@/lib/client/alerts";

function text(formData: FormData, key: string, max = 200): string {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}
function uuid(formData: FormData, key: string): string {
  const value = text(formData, key, 64);
  if (!/^[0-9a-f-]{36}$/i.test(value)) throw new Error(`${key} is invalid.`);
  return value;
}
function money(formData: FormData, key: string): number {
  const value = Number(String(formData.get(key) ?? "0"));
  if (!Number.isFinite(value) || value < 0 || value > 10_000_000_000) throw new Error(`${key} is invalid.`);
  return Math.round(value);
}

export async function setClientStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin(["owner","admin"]);
  const userId = uuid(formData, "userId");
  const status = text(formData, "status", 20);
  if (!['active','blocked'].includes(status)) throw new Error("Invalid client status.");
  await cmsUpdate("client_profiles", `user_id=eq.${userId}`, { status });
  await writeAudit({ admin, action: "client.status.update", entityType: "client-profile", entityId: userId, summary: `Client status changed to ${status}.` });
  revalidatePath(`/admin/clients/${userId}`);
}

export async function assignClientAdvisorAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin(["owner","admin"]);
  const userId = uuid(formData, "userId");
  const advisorUserId = text(formData, "advisorUserId", 64) || null;
  if (advisorUserId && !/^[0-9a-f-]{36}$/i.test(advisorUserId)) throw new Error("Advisor ID is invalid.");
  await cmsUpdate("client_profiles", `user_id=eq.${userId}`, { advisor_user_id: advisorUserId });
  await writeAudit({ admin, action: "client.advisor.assign", entityType: "client-profile", entityId: userId, summary: "Client advisor assignment changed." });
  revalidatePath(`/admin/clients/${userId}`);
}

export async function addClientPortfolioAssetAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin(["owner","admin","editor"]);
  const userId = uuid(formData, "userId");
  const projectId = text(formData, "projectId", 64) || null;
  const unitId = text(formData, "unitId", 64) || null;
  await cmsInsert("client_portfolio_assets", {
    user_id: userId,
    project_id: projectId,
    unit_id: unitId,
    custom_title: text(formData, "customTitle", 160) || null,
    ownership_status: text(formData, "ownershipStatus", 30) || "reserved",
    purchase_price_aed: money(formData, "purchasePriceAed"),
    paid_to_date_aed: money(formData, "paidToDateAed"),
    estimated_value_aed: text(formData, "estimatedValueAed", 30) ? money(formData, "estimatedValueAed") : null,
    acquisition_date: text(formData, "acquisitionDate", 20) || null,
  });
  await writeAudit({ admin, action: "client.portfolio.create", entityType: "client-profile", entityId: userId, summary: "Portfolio asset added." });
  revalidatePath(`/admin/clients/${userId}`);
}

export async function addClientPaymentAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin(["owner","admin","editor"]);
  const userId = uuid(formData, "userId");
  const assetId = uuid(formData, "assetId");
  await cmsInsert("client_payment_items", {
    user_id: userId,
    asset_id: assetId,
    label: text(formData, "label", 160),
    due_date: text(formData, "dueDate", 20),
    amount_aed: money(formData, "amountAed"),
    status: text(formData, "status", 20) || "upcoming",
    source: "admin",
  });
  await writeAudit({ admin, action: "client.payment.create", entityType: "client-profile", entityId: userId, summary: "Payment item added." });
  revalidatePath(`/admin/clients/${userId}`);
}

export async function addClientAdvisorNoteAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin(["owner","admin","editor"]);
  const userId = uuid(formData, "userId");
  const body = text(formData, "body", 4000);
  if (!body) throw new Error("Advisor note is empty.");
  await cmsInsert("client_advisor_notes", {
    user_id: userId,
    advisor_user_id: admin.id,
    body,
    is_pinned: formData.get("isPinned") === "on",
    visible_to_client: formData.get("visibleToClient") !== "off",
  });
  await writeAudit({ admin, action: "client.note.create", entityType: "client-profile", entityId: userId, summary: "Advisor note added." });
  revalidatePath(`/admin/clients/${userId}`);
}

export async function addClientNotificationAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin(["owner","admin","editor"]);
  const userId = uuid(formData, "userId");
  await cmsInsert("client_notifications", {
    user_id: userId,
    kind: text(formData, "kind", 30) || "system",
    title: text(formData, "title", 160),
    body: text(formData, "body", 1000),
    href: text(formData, "href", 300) || null,
    severity: text(formData, "severity", 20) || "info",
  });
  await writeAudit({ admin, action: "client.notification.create", entityType: "client-profile", entityId: userId, summary: "Client notification added." });
  revalidatePath(`/admin/clients/${userId}`);
}

export async function uploadClientDocumentAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin(["owner","admin","editor"]);
  const userId = uuid(formData, "userId");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size <= 0) throw new Error("Choose a document.");
  if (file.size > 30 * 1024 * 1024) throw new Error("Document exceeds the 30 MB limit.");
  const uploaded = await uploadCmsFile({ bucket: "keyhold-private-documents", folder: `clients/${userId}`, file });
  await cmsInsert("client_documents", {
    user_id: userId,
    asset_id: text(formData, "assetId", 64) || null,
    label: text(formData, "label", 160) || file.name,
    category: text(formData, "category", 30) || "Other",
    bucket: "keyhold-private-documents",
    storage_path: uploaded.storagePath,
    file_name: file.name.slice(-180),
    mime_type: file.type || null,
    size_bytes: file.size,
  });
  await writeAudit({ admin, action: "client.document.upload", entityType: "client-profile", entityId: userId, summary: `Private client document uploaded: ${file.name.slice(-120)}` });
  revalidatePath(`/admin/clients/${userId}`);
}

export async function evaluateClientWatchlistsAction(): Promise<void> {
  const admin = await requireAdmin(["owner","admin"]);
  const result = await evaluateClientWatchlists();
  await writeAudit({ admin, action: "client.watchlists.evaluate", entityType: "client-watchlists", entityId: null, summary: `Evaluated ${result.checked} rules and created ${result.created} notifications.` });
  revalidatePath("/admin/clients");
}
