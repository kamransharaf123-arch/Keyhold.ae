import { AdminCard, AdminNotice, AdminPageHeader } from "@/components/admin/admin-ui";
import { NavigationForm, type NavigationRow } from "@/components/admin/website-forms";
import { requireAdmin } from "@/lib/admin/session";
import { cmsSelect } from "@/lib/cms/rest";

export default async function NavigationAdmin({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  await requireAdmin();
  const [query, items] = await Promise.all([searchParams, cmsSelect<NavigationRow>("cms_navigation_items", "select=*&order=nav_group.asc,sort_order.asc,label.asc")]);
  const groups = [...new Set(items.map((item)=>item.nav_group))];
  return <><AdminPageHeader eyebrow="Website manager" title="Navigation" description="Header, Projects dropdown, footer columns, legal links and mobile extras. The owner can change labels, order, visibility and destinations without code."/><AdminNotice notice={query.notice} error={query.error}/><div className="grid gap-6">{groups.map((group)=><AdminCard key={group} eyebrow="Navigation group" title={group}><div className="grid gap-4">{items.filter((item)=>item.nav_group===group).map((item)=><div key={item.id} className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0"><NavigationForm item={item}/></div>)}</div></AdminCard>)}<AdminCard eyebrow="Navigation" title="Add link"><NavigationForm/></AdminCard></div></>;
}
