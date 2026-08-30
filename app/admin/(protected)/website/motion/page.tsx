import { saveWebsiteMotionSettingsAction } from "@/app/admin/motion-actions";
import { AdminCard, AdminNotice, AdminPageHeader, Field, inputClass, selectClass } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/session";
import { cmsSelect } from "@/lib/cms/rest";
import { parseWebsiteMotionConfig } from "@/lib/motion/config";

type Row = { theme: Record<string, unknown> | null };

function Toggle({ name, label, detail, checked }: { name: string; label: string; detail: string; checked: boolean }) {
  return (
    <label className="flex min-h-16 items-start gap-3 border border-black/10 bg-[var(--color-soft-white)] p-4">
      <input className="mt-1" type="checkbox" name={name} defaultChecked={checked} />
      <span>
        <span className="block text-sm font-semibold text-[var(--color-graphite)]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[var(--color-stone)]">{detail}</span>
      </span>
    </label>
  );
}

export default async function WebsiteMotionPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  await requireAdmin(["owner", "admin"]);
  const [query, rows] = await Promise.all([
    searchParams,
    cmsSelect<Row>("cms_website_settings", "select=theme&limit=1"),
  ]);
  const motion = parseWebsiteMotionConfig(rows[0]?.theme ?? {});

  return (
    <>
      <AdminPageHeader
        eyebrow="Website manager"
        title="Motion & Signature Experience"
        description="Control KeyHold's cinematic motion without changing code. System accessibility preferences always win: prefers-reduced-motion cannot be overridden here."
      />
      <AdminNotice notice={query.notice} error={query.error} />
      <AdminCard>
        <form action={saveWebsiteMotionSettingsAction} className="grid gap-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <Toggle name="enabled" label="Motion system" detail="Master switch for public-site motion. Admin pages remain static." checked={motion.enabled} />
            <Field label="Motion intensity" hint="Balanced is the recommended KeyHold default.">
              <select className={selectClass} name="intensity" defaultValue={motion.intensity}>
                <option value="subtle">Subtle</option>
                <option value="balanced">Balanced</option>
                <option value="cinematic">Cinematic</option>
              </select>
            </Field>
            <Field label="Timing scale" hint="0.70 is quicker; 1.25 is slower. Recommended: 1.00.">
              <input className={inputClass} type="number" name="motionScale" min="0.7" max="1.25" step="0.05" defaultValue={motion.motionScale} />
            </Field>
          </div>

          <div className="border-t border-black/10 pt-5">
            <p className="eyebrow">Hero</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Toggle name="heroParallax" label="Hero parallax" detail="Very small scroll-based movement for the hero media." checked={motion.heroParallax} />
              <Toggle name="heroAmbient" label="Ambient hero light" detail="Slow, low-contrast teal/champagne ambience behind hero content." checked={motion.heroAmbient} />
              <Toggle name="heroHeadlineReveal" label="Headline reveal" detail="Word-by-word hero headline entrance with restrained stagger." checked={motion.heroHeadlineReveal} />
            </div>
            <div className="mt-4 max-w-sm">
              <Field label="Maximum hero parallax" hint="Pixels. 24–40px feels premium without becoming distracting.">
                <input className={inputClass} type="number" name="maxParallaxPx" min="0" max="64" step="1" defaultValue={motion.maxParallaxPx} />
              </Field>
            </div>
          </div>

          <div className="border-t border-black/10 pt-5">
            <p className="eyebrow">Discovery & content</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Toggle name="sectionReveal" label="Section reveals" detail="Soft reveal as editorial sections enter the viewport." checked={motion.sectionReveal} />
              <Toggle name="staggerGrids" label="Staggered cards" detail="Project, area, insight and search cards arrive in a quiet sequence." checked={motion.staggerGrids} />
              <Toggle name="imageReveal" label="Image reveals" detail="Images uncover with a subtle mask and scale settle." checked={motion.imageReveal} />
              <Toggle name="pageIntro" label="Page intro" detail="A short entrance on standard page heroes, not a blocking route transition." checked={motion.pageIntro} />
              <Toggle name="cardHover" label="Premium card hover" detail="Desktop-only lift, image zoom and accent line response." checked={motion.cardHover} />
              <Toggle name="buttonMotion" label="Button micro-interactions" detail="Desktop hover and press responses while keeping touch behavior calm." checked={motion.buttonMotion} />
            </div>
          </div>

          <div className="border-t border-black/10 pt-5">
            <p className="eyebrow">Data & intelligence</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Toggle name="metricCountUp" label="Metric count-up" detail="Scores, progress and selected financial headline values animate once into view." checked={motion.metricCountUp} />
              <Toggle name="progressAnimation" label="Progress animation" detail="Construction and payment progress fills smoothly into its verified value." checked={motion.progressAnimation} />
              <Toggle name="chartAnimation" label="Chart draw-in" detail="Risk radar and chart marks animate into place without changing any values." checked={motion.chartAnimation} />
            </div>
          </div>

          <div className="rounded-sm border border-[var(--color-champagne)]/40 bg-[var(--color-champagne-soft)] p-4 text-xs leading-5 text-[var(--color-graphite)]">
            Motion never changes investment calculations, scores, data, URLs, accessibility labels or source-status logic. The browser's reduced-motion preference always disables non-essential motion, even when this page says Motion system = on.
          </div>

          <div className="text-right"><button className="button button-dark">Save motion settings</button></div>
        </form>
      </AdminCard>
    </>
  );
}
