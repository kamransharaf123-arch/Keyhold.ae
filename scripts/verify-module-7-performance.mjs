import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const deps = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
for (const forbidden of ["framer-motion","gsap","three","lenis","@supabase/supabase-js"]) {
  if (deps[forbidden]) errors.push(`Performance/dependency budget violation: ${forbidden} added`);
}

const queries = fs.readFileSync(path.join(root, "lib/client/queries.ts"), "utf8");
if (!queries.includes("rpc/keyhold_client_dashboard_summary")) errors.push("Dashboard should use one summary RPC");
if (!queries.includes("Promise.all")) errors.push("Independent portal queries should run in parallel");
if (/limit=([5-9]\d\d|\d{4,})/.test(queries)) errors.push("Unbounded/oversized client page query detected");

for (const tree of ["app/(en)/account/(protected)","app/fr/account/(protected)"]) {
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      else if (entry.name.endsWith(".tsx")) {
        const text = fs.readFileSync(path.join(root, rel), "utf8");
        if (text.startsWith('"use client"') || text.startsWith("'use client'")) errors.push(`Protected route should remain server-first: ${rel}`);
      }
    }
  };
  walk(tree);
}

const capability = fs.readFileSync(path.join(root, "lib/performance/browser-capabilities.ts"), "utf8");
for (const signal of ["saveData","hardwareConcurrency","deviceMemory","pointer: coarse","max-width: 767px"]) if (!capability.includes(signal)) errors.push(`Lite-mode signal missing: ${signal}`);

if (errors.length) {
  console.error("Module 7 performance verification failed:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("KeyHold Module 7 performance-source verification passed.");
