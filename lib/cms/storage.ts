import "server-only";
import { assertCmsConfigured, cmsStorageUrl } from "@/lib/cms/config";

const SAFE_FILE = /[^a-zA-Z0-9._-]+/g;

export function sanitizeUploadName(name: string): string {
  const cleaned = name.trim().replace(SAFE_FILE, "-").replace(/-+/g, "-");
  return cleaned.slice(-120) || "upload";
}

export async function uploadCmsFile(input: {
  bucket: "keyhold-media" | "keyhold-public-documents" | "keyhold-private-documents";
  folder: string;
  file: File;
}): Promise<{ storagePath: string; publicUrl: string | null }> {
  const env = assertCmsConfigured();
  const safeFolder = input.folder.replace(/[^a-zA-Z0-9/_-]+/g, "-").replace(/^\/+|\/+$/g, "");
  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${sanitizeUploadName(input.file.name)}`;
  const storagePath = `${safeFolder}/${unique}`;
  const body = await input.file.arrayBuffer();

  const response = await fetch(cmsStorageUrl(`object/${input.bucket}/${storagePath}`), {
    method: "POST",
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": input.file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`CMS upload failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const publicUrl = input.bucket === "keyhold-media" || input.bucket === "keyhold-public-documents"
    ? `${env.supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${input.bucket}/${storagePath}`
    : null;

  return { storagePath, publicUrl };
}

export async function deleteCmsFile(bucket: string, storagePath: string): Promise<void> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsStorageUrl(`object/${bucket}`), {
    method: "DELETE",
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [storagePath] }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`CMS file deletion failed (${response.status}): ${detail.slice(0, 500)}`);
  }
}
