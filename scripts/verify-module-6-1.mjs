import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const required = [
  "supabase/migrations/20260830_000002_keyhold_website_content_manager.sql",
  "app/admin/website-actions.ts",
  "app/admin/localization-actions.ts",
  "app/admin/(protected)/website/page.tsx",
  "app/admin/(protected)/website/global/page.tsx",
  "app/admin/(protected)/website/pages/page.tsx",
  "app/admin/(protected)/website/navigation/page.tsx",
  "app/admin/(protected)/website/media/page.tsx",
  "app/admin/(protected)/website/people/page.tsx",
  "app/admin/(protected)/website/testimonials/page.tsx",
  "app/admin/(protected)/website/faqs/page.tsx",
  "app/admin/(protected)/website/forms/page.tsx",
  "app/admin/(protected)/website/languages/page.tsx",
  "app/admin/(protected)/website/translations/page.tsx",
  "components/admin/website-forms.tsx",
  "components/admin/entity-translation-panel.tsx",
  "components/website/language-switcher.tsx",
  "scripts/cms-website-snapshot.mjs",
  "types/website-cms.ts",
  "types/localization.ts",
  "data/website-content.ts",
  "data/localized-catalog.ts",
  "lib/i18n/locale.ts",
  "lib/i18n/translations.ts",
  "lib/i18n/admin-field-profiles.ts",
  "lib/cms/website-theme.ts",
  "lib/cms/website-metadata.ts",
];

for (const file of required) await access(path.join(root, file));

const migration = await readFile(path.join(root, required[0]), "utf8");
for (const table of [
  "cms_website_settings","cms_pages","cms_page_sections","cms_navigation_items","cms_media_library","cms_people","cms_testimonials","cms_faqs","cms_form_copy","cms_locale_settings","cms_translations",
]) {
  if (!migration.includes(`public.${table}`)) throw new Error(`Migration missing ${table}`);
}
for (const trigger of [
  "cms_website_settings_touch","cms_pages_touch","cms_page_sections_touch","cms_navigation_items_touch","cms_media_library_touch","cms_people_touch","cms_testimonials_touch","cms_faqs_touch","cms_form_copy_touch","cms_locale_settings_touch","cms_translations_touch",
]) {
  if (!migration.includes(`drop trigger if exists ${trigger}`)) throw new Error(`${trigger} is not idempotent`);
}
if (!migration.includes("('en','English','English',true,true")) throw new Error("English locale seed missing.");
if (!migration.includes("('fr','French','Français',true,false")) throw new Error("French locale seed missing.");
if (!migration.includes("'website-page', page_key, 'fr'")) throw new Error("French page translations seed missing.");
if (/sb_secret_[A-Za-z0-9_-]+/.test(migration) || /service_role\s*[:=]\s*["'][A-Za-z0-9._-]{20,}/i.test(migration)) throw new Error("Possible secret in migration.");

const actions = await readFile(path.join(root, "app/admin/website-actions.ts"), "utf8");
if (!actions.includes("requireAdmin")) throw new Error("Website actions must enforce admin authorization.");
if (!actions.includes("uploadGlobalMediaAction")) throw new Error("Global media upload action missing.");
if (!actions.includes("optionalPublicUpload")) throw new Error("Direct website image upload helper missing.");

const localizationActions = await readFile(path.join(root, "app/admin/localization-actions.ts"), "utf8");
if (!localizationActions.includes("saveFriendlyTranslationAction")) throw new Error("Friendly translation action missing.");
if (!localizationActions.includes("returnTo.startsWith(\"/admin/\")")) throw new Error("Translation return path safety check missing.");

const localeHelper = await readFile(path.join(root, "lib/i18n/locale.ts"), "utf8");
if (!localeHelper.includes('return base === "/" ? "/fr" : `/fr${base}`')) throw new Error("French URL prefix helper missing.");

const websiteData = await readFile(path.join(root, "data/website-content.ts"), "utf8");
if (!websiteData.includes('locale === "en"')) throw new Error("English canonical fallback missing.");
if (!websiteData.includes('"website-section", `${section.pageKey}:${section.sectionKey}`')) throw new Error("Stable section translation key missing.");

const switcher = await readFile(path.join(root, "components/website/language-switcher.tsx"), "utf8");
if (!switcher.includes("EN") || !switcher.includes("FR")) throw new Error("EN/FR language switcher labels missing.");

for (const file of required.filter((file) => /\.(?:ts|tsx|mjs)$/.test(file))) {
  const text = await readFile(path.join(root, file), "utf8");
  if (/sb_secret_[A-Za-z0-9_-]+/.test(text) || /service_role\s*[:=]\s*["'][A-Za-z0-9._-]{20,}/i.test(text)) throw new Error(`Possible secret embedded in ${file}`);
}

for (const page of [
  "app/admin/(protected)/website/page.tsx",
  "app/admin/(protected)/website/languages/page.tsx",
  "app/admin/(protected)/website/translations/page.tsx",
  "app/admin/(protected)/website/forms/page.tsx",
]) {
  const source = await readFile(path.join(root, page), "utf8");
  if (!source.includes("await requireAdmin")) throw new Error(`${page} lacks explicit page-level guard.`);
}

console.log("[module6.1] Website Studio + EN/FR foundation verification passed.");
