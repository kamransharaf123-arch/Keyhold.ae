import "server-only";
import { cmsInsert, cmsSelect, cmsUpdate } from "@/lib/cms/rest";

type Rule = { id: string; user_id: string; project_id: string | null; rule_type: string; threshold_numeric: number | null; last_triggered_at: string | null; created_at: string };
type Project = { id: string; title: string; slug: string; price_from_aed: number | null; rental_price_from_aed: number | null; construction_progress: number | null; availability_last_verified_at: string };
type Unit = { project_id: string; unit_number: string; created_at: string; last_verified_at: string; availability: string };

export async function evaluateClientWatchlists(): Promise<{ checked: number; created: number }> {
  const rules = await cmsSelect<Rule>("client_watchlist_rules", "select=id,user_id,project_id,rule_type,threshold_numeric,last_triggered_at,created_at&is_active=eq.true&project_id=not.is.null&limit=1000");
  const projectIds = Array.from(new Set(rules.map((r)=>r.project_id).filter((id):id is string=>Boolean(id))));
  if (!projectIds.length) return { checked: rules.length, created: 0 };
  const [projects, units] = await Promise.all([
    cmsSelect<Project>("cms_projects", `select=id,title,slug,price_from_aed,rental_price_from_aed,construction_progress,availability_last_verified_at&id=in.(${projectIds.join(",")})&status=eq.published`),
    cmsSelect<Unit>("cms_units", `select=project_id,unit_number,created_at,last_verified_at,availability&project_id=in.(${projectIds.join(",")})&availability=eq.available&limit=5000`),
  ]);
  const projectMap = new Map(projects.map((p)=>[p.id,p]));
  const unitsByProject = new Map<string, Unit[]>();
  for (const unit of units) unitsByProject.set(unit.project_id, [...(unitsByProject.get(unit.project_id) ?? []), unit]);
  let created = 0;
  for (const rule of rules) {
    if (!rule.project_id) continue;
    const project = projectMap.get(rule.project_id); if (!project) continue;
    const since = new Date(rule.last_triggered_at ?? rule.created_at).getTime();
    let marker = ""; let title = ""; let body = "";
    if (rule.rule_type === "price-below" && rule.threshold_numeric !== null) {
      const price = project.price_from_aed ?? project.rental_price_from_aed;
      if (price !== null && price <= rule.threshold_numeric) {
        marker = `price:${price}`; title = `${project.title} reached your price threshold`; body = `The current catalogue price is AED ${Math.round(price).toLocaleString("en-AE")}. Availability and pricing remain subject to confirmation.`;
      }
    } else if (rule.rule_type === "construction-reaches" && rule.threshold_numeric !== null) {
      const progress = project.construction_progress;
      if (progress !== null && progress >= rule.threshold_numeric) {
        marker = `construction:${Math.floor(progress)}`; title = `${project.title} construction update`; body = `Recorded construction progress is now ${progress}%.`;
      }
    } else if (rule.rule_type === "new-unit") {
      const fresh = (unitsByProject.get(project.id) ?? []).filter((u)=>new Date(u.created_at).getTime() > since);
      if (fresh.length) { marker = `new-unit:${fresh.map((u)=>u.unit_number).sort().join("-")}`.slice(0,180); title = `New availability at ${project.title}`; body = `${fresh.length} newly recorded available unit${fresh.length === 1 ? "" : "s"}. Availability remains subject to developer/seller confirmation.`; }
    }
    if (!marker) continue;
    try {
      await cmsInsert("client_notifications", { user_id: rule.user_id, kind: "watchlist", title, body, href: `/projects/${project.slug}`, severity: "info", dedupe_key: `${rule.id}:${marker}` });
      created += 1;
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("duplicate")) throw error;
    }
    await cmsUpdate("client_watchlist_rules", `id=eq.${rule.id}`, { last_triggered_at: new Date().toISOString() });
  }
  return { checked: rules.length, created };
}
