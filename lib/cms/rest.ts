import "server-only";
import { assertCmsConfigured, cmsRestUrl } from "@/lib/cms/config";

export type RestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
  token?: string;
};

export async function cmsRest<T>(path: string, options: RestOptions = {}): Promise<T> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsRestUrl(path), {
    method: options.method ?? "GET",
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${options.token ?? env.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`CMS request failed (${response.status}) ${path}: ${detail.slice(0, 600)}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function cmsSelect<T>(table: string, query = "select=*"): Promise<T[]> {
  return cmsRest<T[]>(`${table}?${query}`);
}

export async function cmsInsert<T>(table: string, value: unknown): Promise<T> {
  const rows = await cmsRest<T[]>(table, {
    method: "POST",
    body: value,
    prefer: "return=representation",
  });
  if (!rows[0]) throw new Error(`CMS insert into ${table} returned no row.`);
  return rows[0];
}

export async function cmsUpdate<T>(table: string, filter: string, value: unknown): Promise<T> {
  const rows = await cmsRest<T[]>(`${table}?${filter}`, {
    method: "PATCH",
    body: value,
    prefer: "return=representation",
  });
  if (!rows[0]) throw new Error(`CMS update on ${table} returned no row.`);
  return rows[0];
}

export async function cmsDelete(table: string, filter: string): Promise<void> {
  await cmsRest<void>(`${table}?${filter}`, { method: "DELETE", prefer: "return=minimal" });
}

export async function cmsUpsertMany<T>(table: string, values: unknown[], conflictColumns: string): Promise<T[]> {
  if (values.length === 0) return [];
  return cmsRest<T[]>(`${table}?on_conflict=${encodeURIComponent(conflictColumns)}`, {
    method: "POST",
    body: values,
    prefer: "resolution=merge-duplicates,return=representation",
  });
}
