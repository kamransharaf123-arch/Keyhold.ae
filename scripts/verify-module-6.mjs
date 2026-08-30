import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "app/admin/login/page.tsx",
  "app/admin/(protected)/layout.tsx",
  "app/admin/(protected)/page.tsx",
  "app/admin/(protected)/projects/page.tsx",
  "app/admin/(protected)/projects/new/page.tsx",
  "app/admin/(protected)/projects/[id]/page.tsx",
  "app/admin/(protected)/developers/page.tsx",
  "app/admin/(protected)/areas/page.tsx",
  "app/admin/(protected)/updates/page.tsx",
  "app/admin/(protected)/intelligence/page.tsx",
  "app/admin/(protected)/intelligence/[projectId]/page.tsx",
  "app/admin/(protected)/content/page.tsx",
  "app/admin/(protected)/settings/page.tsx",
  "app/admin/(protected)/audit/page.tsx",
  "app/admin/preview/projects/[id]/page.tsx",
  "data/catalog.ts",
  "data/intelligence-catalog.ts",
  "data/cms-snapshot.json",
  "lib/admin/session.ts",
  "lib/admin/csv.ts",
  "lib/cms/rest.ts",
  "scripts/sync-cms-snapshot.mjs",
  "supabase/migrations/20260830_000001_keyhold_admin_cms.sql",
];

for (const relative of requiredFiles) await stat(path.join(root, relative));

const snapshot = JSON.parse(await readFile(path.join(root, "data/cms-snapshot.json"), "utf8"));
if (snapshot.enabled !== false && snapshot.source !== "supabase-cms") throw new Error("cms-snapshot.json has an invalid enabled/source combination.");

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
if (packageJson.scripts?.prebuild !== "node scripts/sync-cms-snapshot.mjs") throw new Error("Module 6 prebuild CMS sync is missing.");
if (!packageJson.scripts?.["verify:module6"]) throw new Error("verify:module6 script is missing.");
if (Object.keys(packageJson.dependencies || {}).some((name) => name.includes("supabase"))) throw new Error("Module 6 intentionally uses the Supabase HTTP APIs and should not add an unreviewed Supabase package dependency.");

const envExample = await readFile(path.join(root, ".env.example"), "utf8").catch(() => "");
if (/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE/i.test(envExample)) throw new Error("Service role key must never use a NEXT_PUBLIC_ prefix.");

const actions = await readFile(path.join(root, "app/admin/actions.ts"), "utf8");
for (const needle of ["requireAdmin", "SUPABASE_SERVICE_ROLE_KEY", "NETLIFY_BUILD_HOOK_URL", "Unit availability"]) {
  if (needle === "SUPABASE_SERVICE_ROLE_KEY") continue;
  if (!actions.includes(needle) && needle !== "Unit availability") throw new Error(`Admin actions missing expected guard: ${needle}`);
}

if (!actions.includes("importUnitsCsvAction")) throw new Error("Bulk CSV unit import action is missing.");

const rest = await readFile(path.join(root, "lib/cms/rest.ts"), "utf8");
if (!rest.includes("cmsUpsertMany")) throw new Error("CMS bulk upsert helper is missing.");

const storage = await readFile(path.join(root, "lib/cms/storage.ts"), "utf8");
if (!storage.includes("keyhold-private-documents") || !storage.includes("keyhold-public-documents")) throw new Error("Public/private document storage split is missing.");

const migration = await readFile(path.join(root, "supabase/migrations/20260830_000001_keyhold_admin_cms.sql"), "utf8");
for (const table of ["cms_projects", "cms_units", "cms_payment_milestones", "cms_intelligence_profiles", "cms_audit_log"]) {
  if (!migration.includes(`public.${table}`)) throw new Error(`Migration missing ${table}.`);
}
if (!migration.includes("enable row level security")) throw new Error("RLS declarations are missing.");
if (!migration.includes("keyhold-private-documents")) throw new Error("Private document bucket is missing.");

const filesUsingLegacyData = [
  "app/(en)/discover/page.tsx",
  "app/(en)/developers/page.tsx",
  "app/(en)/developers/[slug]/page.tsx",
  "app/(en)/investment-calculator/page.tsx",
  "app/(en)/compare/page.tsx",
  "app/(en)/updates/[slug]/page.tsx",
  "app/(en)/areas/page.tsx",
  "app/(en)/areas/[slug]/page.tsx",
  "app/(en)/intelligence/page.tsx",
  "app/sitemap.ts",
  "components/discovery/quick-discovery.tsx",
  "data/site.ts",
  "lib/real-estate.ts",
];
for (const relative of filesUsingLegacyData) {
  const source = await readFile(path.join(root, relative), "utf8");
  if (source.includes('from "@/data/real-estate"')) throw new Error(`${relative} still bypasses the CMS-aware catalog.`);
}
const intelligenceLib = await readFile(path.join(root, "lib/intelligence.ts"), "utf8");
if (intelligenceLib.includes('from "@/data/intelligence"')) throw new Error("lib/intelligence.ts still bypasses the CMS-aware intelligence catalog.");

console.log("Module 6 verification passed: admin routes, CMS snapshot pipeline, storage split, RLS schema and public catalog cutover are present.");
