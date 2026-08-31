import "server-only";
import { assertCmsConfigured, cmsStorageUrl } from "@/lib/cms/config";

function encodeStoragePath(path: string): string {
  return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

export async function createPrivateDocumentSignedUrl(storagePath: string, expiresIn = 90): Promise<string> {
  const env = assertCmsConfigured();
  const safeExpiry = Math.min(300, Math.max(30, Math.round(expiresIn)));
  const response = await fetch(cmsStorageUrl(`object/sign/keyhold-private-documents/${encodeStoragePath(storagePath)}`), {
    method: "POST",
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: safeExpiry }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to create a secure document link.");
  const payload = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const relative = payload.signedURL ?? payload.signedUrl;
  if (!relative) throw new Error("Supabase did not return a signed document URL.");
  if (relative.startsWith("http")) return relative;
  if (relative.startsWith("/storage/v1/")) return `${env.supabaseUrl.replace(/\/$/, "")}${relative}`;
  return `${env.supabaseUrl.replace(/\/$/, "")}/storage/v1${relative.startsWith("/") ? "" : "/"}${relative}`;
}
