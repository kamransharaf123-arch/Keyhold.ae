import "server-only";
import { cmsInsert } from "@/lib/cms/rest";
import type { AdminUser } from "@/types/admin";

export async function writeAudit(input: {
  admin: AdminUser;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await cmsInsert("cms_audit_log", {
    user_id: input.admin.id,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    summary: input.summary,
    metadata: input.metadata ?? {},
  });
}
