import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "types/client-portal.ts",
  "lib/client/session.ts",
  "lib/client/rest.ts",
  "lib/client/queries.ts",
  "lib/client/documents.ts",
  "lib/client/alerts.ts",
  "app/client-actions.ts",
  "app/admin/client-actions.ts",
  "app/api/client/documents/[id]/route.ts",
  "supabase/migrations/20260830_000003_keyhold_client_portal.sql",
];
const errors = [];
for (const file of required) if (!fs.existsSync(path.join(root, file))) errors.push(`Missing ${file}`);

const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260830_000003_keyhold_client_portal.sql"), "utf8");
for (const table of ["client_profiles","client_saved_projects","client_saved_comparisons","client_portfolio_assets","client_payment_items","client_documents","client_advisor_notes","client_watchlist_rules","client_notifications","client_investment_snapshots","client_reports"]) {
  if (!migration.includes(`public.${table}`)) errors.push(`Migration missing ${table}`);
}
if (!migration.includes("keyhold_client_dashboard_summary")) errors.push("Dashboard summary RPC missing");
if (!migration.includes("enable row level security")) errors.push("RLS missing");
if (!migration.includes("keyhold-private-documents")) errors.push("Private document bucket contract missing");
if (/policy[^\n]+anon/i.test(migration)) errors.push("Client migration must not grant anon policies");

const session = fs.readFileSync(path.join(root, "lib/client/session.ts"), "utf8");
if (!session.includes('httpOnly: true')) errors.push("Client cookies must be httpOnly");
if (!session.includes('sameSite: "lax"')) errors.push("Client cookies must be sameSite=lax");
if (!session.includes('cache(resolveContextUncached)')) errors.push("Per-request auth dedupe missing");

const rest = fs.readFileSync(path.join(root, "lib/client/rest.ts"), "utf8");
if (rest.includes("serviceRoleKey")) errors.push("Client REST must not use service-role key");
if (!rest.includes("env.anonKey")) errors.push("Client REST must use anon key + user bearer token");

const docs = fs.readFileSync(path.join(root, "app/api/client/documents/[id]/route.ts"), "utf8");
if (!docs.includes("client_documents") || !docs.includes("createPrivateDocumentSignedUrl")) errors.push("Secure document ownership + signing flow missing");

for (const localeRoot of ["app/(en)/account", "app/fr/account"]) {
  for (const route of ["login","register","forgot-password","reset-password","(protected)","(protected)/saved","(protected)/watchlist","(protected)/compare","(protected)/portfolio","(protected)/payments","(protected)/construction","(protected)/documents","(protected)/analyses","(protected)/notifications","(protected)/advisor","(protected)/profile"]) {
    const file = route === "(protected)" ? `${localeRoot}/${route}/page.tsx` : `${localeRoot}/${route}/page.tsx`;
    if (!fs.existsSync(path.join(root, file))) errors.push(`Missing account route ${file}`);
  }
}

if (errors.length) {
  console.error("Module 7 verification failed:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("KeyHold Module 7 structural/security verification passed.");
