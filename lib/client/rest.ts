import "server-only";
import { assertCmsConfigured, cmsRestUrl } from "@/lib/cms/config";

type ClientRestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
  token: string;
};

export async function clientRest<T>(path: string, options: ClientRestOptions): Promise<T> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsRestUrl(path), {
    method: options.method ?? "GET",
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${options.token}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Client data request failed (${response.status}): ${detail.slice(0, 400)}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
