import "server-only";
import { clientRest } from "@/lib/client/rest";
import { projectsForLocale, constructionUpdatesForLocale } from "@/data/localized-catalog";
import { clientEnumLabel } from "@/lib/client/locale";
import type { ClientLocale } from "@/types/client-portal";
import type {
  ClientAdvisorNote,
  ClientDashboardSummary,
  ClientDocument,
  ClientInvestmentSnapshot,
  ClientNotification,
  ClientPaymentItem,
  ClientPortfolioAsset,
  ClientSavedComparison,
  ClientSavedProject,
  ClientWatchlistRule,
} from "@/types/client-portal";

const PAGE_LIMIT = 24;

type SavedRow = { project_id: string; created_at: string };
type UnitRow = { id: string; unit_number: string; floor: number; bedrooms: number; size_sqft: number; view_label: string };

type ComparisonRow = { id: string; name: string; project_ids: string[]; created_at: string; updated_at: string };
type PortfolioRow = {
  id: string; project_id: string | null; unit_id: string | null; custom_title: string | null; ownership_status: ClientPortfolioAsset["ownershipStatus"];
  purchase_price_aed: number; paid_to_date_aed: number; estimated_value_aed: number | null; valuation_as_of: string | null;
  acquisition_date: string | null; notes: string | null;
};
type PaymentRow = { id: string; asset_id: string; label: string; due_date: string; amount_aed: number; status: ClientPaymentItem["status"]; paid_at: string | null; source: ClientPaymentItem["source"] };
type DocumentRow = { id: string; asset_id: string | null; label: string; category: ClientDocument["category"]; file_name: string; mime_type: string | null; size_bytes: number | null; created_at: string };
type NoteRow = { id: string; body: string; is_pinned: boolean; created_at: string };
type RuleRow = { id: string; project_id: string | null; area_id: string | null; developer_id: string | null; rule_type: ClientWatchlistRule["ruleType"]; threshold_numeric: number | null; is_active: boolean; channels: string[]; last_triggered_at: string | null; created_at: string };
type NotificationRow = { id: string; kind: ClientNotification["kind"]; title: string; body: string; href: string | null; severity: ClientNotification["severity"]; is_read: boolean; read_at: string | null; created_at: string };
type SnapshotRow = { id: string; project_id: string | null; unit_id: string | null; name: string; locale: "en" | "fr"; scenario_key: string | null; inputs: Record<string, unknown>; outputs: Record<string, unknown>; created_at: string };

function inFilter(ids: string[]): string {
  return ids.map((id) => id.replace(/[^0-9a-f-]/gi, "")).filter(Boolean).join(",");
}

export async function getClientDashboardSummary(token: string): Promise<ClientDashboardSummary> {
  const payload = await clientRest<ClientDashboardSummary>("rpc/keyhold_client_dashboard_summary", {
    token,
    method: "POST",
    body: {},
  });
  return payload;
}

export async function getClientSavedProjects(token: string, locale: ClientLocale = "en", limit = PAGE_LIMIT): Promise<ClientSavedProject[]> {
  const saved = await clientRest<SavedRow[]>(
    `client_saved_projects?select=project_id,created_at&order=created_at.desc&limit=${Math.min(50, Math.max(1, limit))}`,
    { token },
  );
  if (!saved.length) return [];
  const ids = saved.map((row) => row.project_id);
  const projects = await clientRest<Array<{ id: string; slug: string }>>(
    `cms_projects?select=id,slug&id=in.(${inFilter(ids)})&status=eq.published`,
    { token },
  );
  const localized = new Map(projectsForLocale(locale).map((project) => [project.slug, project]));
  const byId = new Map(projects.map((row) => [row.id, { id: row.id, project: localized.get(row.slug) }]));
  return saved.flatMap((row) => {
    const entry = byId.get(row.project_id);
    const project = entry?.project;
    return project && entry ? [{
      projectId: entry.id,
      slug: project.slug,
      title: project.title,
      location: project.location,
      category: clientEnumLabel(locale, project.category),
      heroImageUrl: project.heroImage,
      priceFromAed: project.priceFromAed,
      rentalPriceFromAed: project.rentalPriceFromAed ?? null,
      bedroomsLabel: project.bedroomsLabel,
      handoverLabel: project.handoverLabel,
      savedAt: row.created_at,
    }] : [];
  });
}

export async function getClientSavedComparisons(token: string): Promise<ClientSavedComparison[]> {
  const rows = await clientRest<ComparisonRow[]>(
    `client_saved_comparisons?select=id,name,project_ids,created_at,updated_at&order=updated_at.desc&limit=${PAGE_LIMIT}`,
    { token },
  );
  return rows.map((row) => ({ id: row.id, name: row.name, projectIds: row.project_ids, createdAt: row.created_at, updatedAt: row.updated_at }));
}

export async function getClientPortfolio(token: string, locale: ClientLocale = "en"): Promise<ClientPortfolioAsset[]> {
  const assets = await clientRest<PortfolioRow[]>(
    `client_portfolio_assets?select=id,project_id,unit_id,custom_title,ownership_status,purchase_price_aed,paid_to_date_aed,estimated_value_aed,valuation_as_of,acquisition_date,notes&order=created_at.desc&limit=50`,
    { token },
  );
  const projectIds = Array.from(new Set(assets.map((row) => row.project_id).filter((id): id is string => Boolean(id))));
  const unitIds = Array.from(new Set(assets.map((row) => row.unit_id).filter((id): id is string => Boolean(id))));
  const [projects, units] = await Promise.all([
    projectIds.length ? clientRest<Array<{ id: string; slug: string }>>(`cms_projects?select=id,slug&id=in.(${inFilter(projectIds)})`, { token }) : Promise.resolve([]),
    unitIds.length ? clientRest<UnitRow[]>(`cms_units?select=id,unit_number,floor,bedrooms,size_sqft,view_label&id=in.(${inFilter(unitIds)})`, { token }) : Promise.resolve([]),
  ]);
  const localizedProjects = new Map(projectsForLocale(locale).map((project) => [project.slug, project]));
  const projectMap = new Map(projects.map((row) => [row.id, localizedProjects.get(row.slug)]));
  const unitMap = new Map(units.map((row) => [row.id, row]));
  return assets.map((row) => {
    const project = row.project_id ? projectMap.get(row.project_id) : undefined;
    const unit = row.unit_id ? unitMap.get(row.unit_id) : undefined;
    return {
      id: row.id,
      projectId: row.project_id,
      unitId: row.unit_id,
      customTitle: row.custom_title,
      ownershipStatus: row.ownership_status,
      purchasePriceAed: row.purchase_price_aed,
      paidToDateAed: row.paid_to_date_aed,
      estimatedValueAed: row.estimated_value_aed,
      valuationAsOf: row.valuation_as_of,
      acquisitionDate: row.acquisition_date,
      notes: row.notes,
      project: project ? { slug: project.slug, title: project.title, location: project.location, heroImageUrl: project.heroImage, constructionProgress: project.constructionProgress ?? null } : null,
      unit: unit ? { unitNumber: unit.unit_number, floor: unit.floor, bedrooms: unit.bedrooms, sizeSqft: unit.size_sqft, viewLabel: unit.view_label } : null,
    };
  });
}

export async function getClientPayments(token: string): Promise<ClientPaymentItem[]> {
  const rows = await clientRest<PaymentRow[]>(
    `client_payment_items?select=id,asset_id,label,due_date,amount_aed,status,paid_at,source&order=due_date.asc&limit=100`,
    { token },
  );
  return rows.map((r) => ({ id: r.id, assetId: r.asset_id, label: r.label, dueDate: r.due_date, amountAed: r.amount_aed, status: r.status, paidAt: r.paid_at, source: r.source }));
}

export async function getClientDocuments(token: string): Promise<ClientDocument[]> {
  const rows = await clientRest<DocumentRow[]>(
    `client_documents?select=id,asset_id,label,category,file_name,mime_type,size_bytes,created_at&order=created_at.desc&limit=100`,
    { token },
  );
  return rows.map((r) => ({ id: r.id, assetId: r.asset_id, label: r.label, category: r.category, fileName: r.file_name, mimeType: r.mime_type, sizeBytes: r.size_bytes, createdAt: r.created_at }));
}

export async function getClientAdvisorNotes(token: string): Promise<ClientAdvisorNote[]> {
  const rows = await clientRest<NoteRow[]>(`client_advisor_notes?select=id,body,is_pinned,created_at&visible_to_client=eq.true&order=is_pinned.desc,created_at.desc&limit=30`, { token });
  return rows.map((r) => ({ id: r.id, body: r.body, isPinned: r.is_pinned, createdAt: r.created_at }));
}

export async function getClientWatchlistRules(token: string): Promise<ClientWatchlistRule[]> {
  const rows = await clientRest<RuleRow[]>(`client_watchlist_rules?select=id,project_id,area_id,developer_id,rule_type,threshold_numeric,is_active,channels,last_triggered_at,created_at&order=updated_at.desc&limit=50`, { token });
  return rows.map((r) => ({ id: r.id, projectId: r.project_id, areaId: r.area_id, developerId: r.developer_id, ruleType: r.rule_type, thresholdNumeric: r.threshold_numeric, isActive: r.is_active, channels: r.channels, lastTriggeredAt: r.last_triggered_at, createdAt: r.created_at }));
}

export async function getClientNotifications(token: string, limit = PAGE_LIMIT): Promise<ClientNotification[]> {
  const rows = await clientRest<NotificationRow[]>(`client_notifications?select=id,kind,title,body,href,severity,is_read,read_at,created_at&order=created_at.desc&limit=${Math.min(100, Math.max(1, limit))}`, { token });
  return rows.map((r) => ({ id: r.id, kind: r.kind, title: r.title, body: r.body, href: r.href, severity: r.severity, isRead: r.is_read, readAt: r.read_at, createdAt: r.created_at }));
}

export async function getClientAnalyses(token: string): Promise<ClientInvestmentSnapshot[]> {
  const rows = await clientRest<SnapshotRow[]>(`client_investment_snapshots?select=id,project_id,unit_id,name,locale,scenario_key,inputs,outputs,created_at&order=created_at.desc&limit=30`, { token });
  return rows.map((r) => ({ id: r.id, projectId: r.project_id, unitId: r.unit_id, name: r.name, locale: r.locale, scenarioKey: r.scenario_key, inputs: r.inputs, outputs: r.outputs, createdAt: r.created_at }));
}

export async function getClientConstructionUpdates(token: string, locale: ClientLocale = "en"): Promise<Array<{ slug: string; progress: number; statusLabel: string; updatedAtLabel: string; summary: string; projectId: string }>> {
  const portfolio = await clientRest<Array<{ project_id: string | null }>>(`client_portfolio_assets?select=project_id&ownership_status=neq.sold&limit=50`, { token });
  const projectIds = Array.from(new Set(portfolio.map((row) => row.project_id).filter((id): id is string => Boolean(id))));
  if (!projectIds.length) return [];
  const rows = await clientRest<Array<{ slug: string; progress: number; status_label: string; updated_at_label: string; summary: string; project_id: string }>>(
    `cms_construction_updates?select=slug,progress,status_label,updated_at_label,summary,project_id&project_id=in.(${inFilter(projectIds)})&status=eq.published&order=published_at.desc&limit=50`,
    { token },
  );
  const localized = new Map(constructionUpdatesForLocale(locale).map((update) => [update.slug, update]));
  const seen = new Set<string>();
  return rows.filter((row) => !seen.has(row.project_id) && seen.add(row.project_id)).map((row) => {
    const translated = localized.get(row.slug);
    return { slug: row.slug, progress: row.progress, statusLabel: translated?.status ?? row.status_label, updatedAtLabel: translated?.updatedAt ?? row.updated_at_label, summary: translated?.summary ?? row.summary, projectId: row.project_id };
  });
}
