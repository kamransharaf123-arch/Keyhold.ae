import Link from "next/link";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/session";
import { cmsSelect } from "@/lib/cms/rest";

const tools = [
  ["Global & Brand", "/admin/website/global", "Logo, global CTAs, footer copy, announcement and optional theme tokens."],
  ["Motion & Experience", "/admin/website/motion", "Cinematic motion intensity, hero parallax, reveals and data animation, without code."],
  ["Pages & Sections", "/admin/website/pages", "Every page hero, SEO field, section, image, CTA, order and visibility."],
  ["Navigation", "/admin/website/navigation", "Header, Projects dropdown, footer groups, legal links and mobile extras."],
  ["Media Library", "/admin/website/media", "Upload reusable website images, logos, icons, videos and public documents."],
  ["Team", "/admin/website/people", "Who We Are people, photos, roles and bios."],
  ["Testimonials", "/admin/website/testimonials", "Client proof with optional source provenance."],
  ["FAQs", "/admin/website/faqs", "Global or page-specific questions and answers."],
  ["Forms", "/admin/website/forms", "Labels, placeholders, consent copy and success messages for public forms."],
  ["Languages", "/admin/website/languages", "English default plus French /fr configuration, ready for more locales later."],
  ["Translations", "/admin/website/translations", "Advanced EN/FR translation ledger and recovery editor."],
] as const;

export default async function WebsiteAdminPage() {
  await requireAdmin();
  const [pages, sections, nav, media, people, testimonials, faqs, forms, locales, translations] = await Promise.all([
    cmsSelect<{ id: string }>("cms_pages", "select=id"),
    cmsSelect<{ id: string }>("cms_page_sections", "select=id"),
    cmsSelect<{ id: string }>("cms_navigation_items", "select=id"),
    cmsSelect<{ id: string }>("cms_media_library", "select=id"),
    cmsSelect<{ id: string }>("cms_people", "select=id"),
    cmsSelect<{ id: string }>("cms_testimonials", "select=id"),
    cmsSelect<{ id: string }>("cms_faqs", "select=id"),
    cmsSelect<{ id: string }>("cms_form_copy", "select=id"),
    cmsSelect<{ locale: string }>("cms_locale_settings", "select=locale&enabled=eq.true"),
    cmsSelect<{ id: string }>("cms_translations", "select=id&status=eq.published"),
  ]);
  const metrics = [["Pages", pages.length], ["Sections", sections.length], ["Navigation", nav.length], ["Media", media.length], ["Team", people.length], ["Testimonials", testimonials.length], ["FAQs", faqs.length], ["Forms", forms.length], ["Languages", locales.length], ["Published translations", translations.length]] as const;
  return <><AdminPageHeader eyebrow="Website manager" title="Website Content" description="Everything editorial on the public KeyHold site should be controlled here. Architecture, permissions and financial formulas remain protected in code."/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label,value])=><div key={label} className="border border-black/10 bg-[var(--color-soft-white)] p-5"><p className="eyebrow">{label}</p><p className="font-display mt-2 text-4xl">{value}</p></div>)}</div><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tools.map(([title,href,text])=><AdminCard key={href} title={title}><p className="text-sm leading-7 text-[var(--color-stone)]">{text}</p><Link href={href} className="text-link mt-5 inline-flex">Open manager →</Link></AdminCard>)}</div></>;
}
