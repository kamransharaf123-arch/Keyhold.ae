import "server-only";
import { cmsSelect } from "@/lib/cms/rest";
import type {
  CmsAreaRow,
  CmsConstructionUpdateRow,
  CmsDeveloperRow,
  CmsDocumentRow,
  CmsFloorPlanRow,
  CmsPaymentMilestoneRow,
  CmsProjectImageRow,
  CmsProjectRow,
  CmsUnitRow,
} from "@/types/admin";

export async function listAdminProjects(): Promise<CmsProjectRow[]> {
  return cmsSelect<CmsProjectRow>("cms_projects", "select=*&order=updated_at.desc");
}

export async function getAdminProject(id: string): Promise<CmsProjectRow | null> {
  const rows = await cmsSelect<CmsProjectRow>("cms_projects", `select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] ?? null;
}

export async function listDevelopers(): Promise<CmsDeveloperRow[]> {
  return cmsSelect<CmsDeveloperRow>("cms_developers", "select=*&order=name.asc");
}

export async function listAreas(): Promise<CmsAreaRow[]> {
  return cmsSelect<CmsAreaRow>("cms_areas", "select=*&order=name.asc");
}

export async function listProjectUnits(projectId: string): Promise<CmsUnitRow[]> {
  return cmsSelect<CmsUnitRow>("cms_units", `select=*&project_id=eq.${encodeURIComponent(projectId)}&order=sort_order.asc,unit_number.asc`);
}

export async function listPaymentMilestones(projectId: string): Promise<CmsPaymentMilestoneRow[]> {
  return cmsSelect<CmsPaymentMilestoneRow>("cms_payment_milestones", `select=*&project_id=eq.${encodeURIComponent(projectId)}&order=sort_order.asc`);
}

export async function listProjectImages(projectId: string): Promise<CmsProjectImageRow[]> {
  return cmsSelect<CmsProjectImageRow>("cms_project_images", `select=*&project_id=eq.${encodeURIComponent(projectId)}&order=sort_order.asc`);
}

export async function listFloorPlans(projectId: string): Promise<CmsFloorPlanRow[]> {
  return cmsSelect<CmsFloorPlanRow>("cms_floor_plans", `select=*&project_id=eq.${encodeURIComponent(projectId)}&order=sort_order.asc`);
}

export async function listProjectDocuments(projectId: string): Promise<CmsDocumentRow[]> {
  return cmsSelect<CmsDocumentRow>("cms_documents", `select=*&project_id=eq.${encodeURIComponent(projectId)}&order=sort_order.asc`);
}

export async function listConstructionUpdates(): Promise<CmsConstructionUpdateRow[]> {
  return cmsSelect<CmsConstructionUpdateRow>("cms_construction_updates", "select=*&order=published_at.desc");
}

export async function dashboardCounts(): Promise<Record<string, number>> {
  const [projects, developers, areas, units, updates] = await Promise.all([
    cmsSelect<{ id: string }>("cms_projects", "select=id"),
    cmsSelect<{ id: string }>("cms_developers", "select=id"),
    cmsSelect<{ id: string }>("cms_areas", "select=id"),
    cmsSelect<{ id: string }>("cms_units", "select=id"),
    cmsSelect<{ id: string }>("cms_construction_updates", "select=id"),
  ]);
  return {
    projects: projects.length,
    developers: developers.length,
    areas: areas.length,
    units: units.length,
    updates: updates.length,
  };
}

export async function listAuditLog(limit = 100): Promise<Array<{ id: number; user_id: string | null; action: string; entity_type: string; entity_id: string | null; summary: string; created_at: string }>> {
  const safeLimit = Math.max(1, Math.min(250, Math.round(limit)));
  return cmsSelect("cms_audit_log", `select=id,user_id,action,entity_type,entity_id,summary,created_at&order=created_at.desc&limit=${safeLimit}`);
}
