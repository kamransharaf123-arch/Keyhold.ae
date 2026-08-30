import "server-only";
import { cmsSelect } from "@/lib/cms/rest";
import type { TranslationEntityType } from "@/types/localization";

export async function getFrenchTranslation(entityType: TranslationEntityType, entityKey: string): Promise<{ data: Record<string, unknown>; status: "draft" | "published" } | null> {
  if (!entityKey) return null;
  const rows = await cmsSelect<{ data: Record<string, unknown>; status: "draft" | "published" }>(
    "cms_translations",
    `select=data,status&entity_type=eq.${encodeURIComponent(entityType)}&entity_key=eq.${encodeURIComponent(entityKey)}&locale=eq.fr&limit=1`,
  );
  return rows[0] ?? null;
}
