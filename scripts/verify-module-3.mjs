import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const requiredFiles = [
  "lib/discovery.ts",
  "components/discovery/discovery-explorer.tsx",
  "components/discovery/discovery-project-card.tsx",
  "components/discovery/area-explorer-map.tsx",
  "components/discovery/smart-finder.tsx",
  "components/discovery/project-comparison.tsx",
  "components/discovery/quick-discovery.tsx",
  "app/(en)/discover/page.tsx",
  "app/(en)/compare/page.tsx",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing Module 3 file: ${file}`);
}

const data = fs.readFileSync(path.join(root, "data/real-estate.ts"), "utf8");
const types = fs.readFileSync(path.join(root, "types/real-estate.ts"), "utf8");
const explorer = fs.readFileSync(path.join(root, "components/discovery/discovery-explorer.tsx"), "utf8");
const compare = fs.readFileSync(path.join(root, "components/discovery/project-comparison.tsx"), "utf8");
const discoveryLib = fs.readFileSync(path.join(root, "lib/discovery.ts"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
const header = fs.readFileSync(path.join(root, "components/site-header.tsx"), "utf8");
const siteData = fs.readFileSync(path.join(root, "data/site.ts"), "utf8");

const disclaimer = "Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice.";
if (!explorer.includes(disclaimer)) errors.push("Discovery availability disclaimer is missing or altered.");
if (!compare.includes(disclaimer)) errors.push("Comparison availability disclaimer is missing or altered.");

if (!types.includes("ProjectDiscoveryProfile") || !types.includes("mapPosition")) {
  errors.push("Module 3 discovery types are incomplete.");
}

const projectSectionStart = data.indexOf("export const projects");
const projectSectionEnd = data.indexOf("export const constructionUpdates");
const projectSection = data.slice(projectSectionStart, projectSectionEnd);
const projectCount = [...projectSection.matchAll(/\n\s{4}slug:\s*"[^"]+"/g)].length;
const discoveryCount = [...projectSection.matchAll(/\n\s{4}discovery:\s*\{/g)].length;
const publishedCount = [...projectSection.matchAll(/\n\s{4}publishedAt:\s*"[^"]+"/g)].length;
if (projectCount === 0) errors.push("Could not find Module 3 project records.");
if (discoveryCount !== projectCount) errors.push(`Every project needs discovery metadata: found ${discoveryCount} discovery blocks for ${projectCount} projects.`);
if (publishedCount !== projectCount) errors.push(`Every project needs a KeyHold publication timestamp for newest sorting: found ${publishedCount} for ${projectCount} projects.`);

const areaSectionStart = data.indexOf("export const areas");
const areaSectionEnd = data.indexOf("const commonDocuments");
const areaSection = data.slice(areaSectionStart, areaSectionEnd);
const areaCount = [...areaSection.matchAll(/\n\s{4}slug:\s*"[^"]+"/g)].length;
const mapPositions = [...areaSection.matchAll(/mapPosition:\s*\{\s*x:\s*(\d+(?:\.\d+)?),\s*y:\s*(\d+(?:\.\d+)?)\s*\}/g)];
if (mapPositions.length !== areaCount) errors.push(`Every area needs a schematic map position: found ${mapPositions.length} positions for ${areaCount} areas.`);
for (const [, xValue, yValue] of mapPositions) {
  const x = Number(xValue);
  const y = Number(yValue);
  if (x < 0 || x > 100 || y < 0 || y > 100) errors.push(`Area map position outside 0–100: x=${x}, y=${y}`);
}

for (const route of ["/discover", "/compare"]) {
  if (!sitemap.includes(`"${route}"`)) errors.push(`Sitemap is missing ${route}.`);
}

const requiredCapabilities = [
  "maxInitialCashAed",
  "investmentGoals",
  "lifestyleTags",
  "paymentPlanSignatures",
  "availableOnly",
  "getSearchScore",
  "filterAndSortProjects",
  "filtersToSearchParams",
  "filtersFromSearchParams",
];
for (const capability of requiredCapabilities) {
  if (!discoveryLib.includes(capability)) errors.push(`Discovery engine is missing capability: ${capability}`);
}

if (!explorer.includes("keyhold_saved_searches_v1")) errors.push("Saved-search local persistence is missing.");
if (!explorer.includes("keyhold_compare_v1")) errors.push("Compare selection persistence is missing.");
if (!explorer.includes("Cash available today")) errors.push("Cash-available-today discovery control is missing.");
if (!explorer.includes("Guided finder")) errors.push("Guided property finder entry point is missing.");
if (!explorer.includes('value="newest"')) errors.push("Newest-on-KeyHold sort is missing.");
const smartFinder = fs.readFileSync(path.join(root, "components/discovery/smart-finder.tsx"), "utf8");
if (!smartFinder.includes("Golden Visa planning") || !smartFinder.includes("eligibility always require")) {
  errors.push("Golden Visa planning search must stay non-guaranteed and explicitly require eligibility confirmation.");
}
if (!explorer.includes("Schematic / not to scale") && !fs.readFileSync(path.join(root, "components/discovery/area-explorer-map.tsx"), "utf8").includes("Schematic / not to scale")) {
  errors.push("Schematic map disclaimer is missing.");
}

// Preserve the exact public header contract from Modules 1 and 2.
const primaryNavMatch = siteData.match(/export const primaryNav:[\s\S]*?= \[([\s\S]*?)\];/);
const navLabels = primaryNavMatch ? [...primaryNavMatch[1].matchAll(/label: "([^"]+)"/g)].map((match) => match[1]) : [];
const expectedPrimaryNav = ["Home", "Updates", "Insights", "Services", "Who We Are"];
if (JSON.stringify(navLabels) !== JSON.stringify(expectedPrimaryNav)) {
  errors.push(`Primary navigation contract changed: ${JSON.stringify(navLabels)}`);
}
if (!header.includes('>Projects<') && !header.includes('Projects')) errors.push("Projects dropdown is missing from header.");
const projectNavMatch = siteData.match(/export const projectNav:[\s\S]*?= \[([\s\S]*?)\];/);
const projectNavLabels = projectNavMatch ? [...projectNavMatch[1].matchAll(/label: "([^"]+)"/g)].map((match) => match[1]) : [];
const expectedProjectNav = ["Off-Plan", "Ready", "Short-Term Rentals", "Long-Term Rentals"];
if (JSON.stringify(projectNavLabels) !== JSON.stringify(expectedProjectNav)) {
  errors.push(`Projects dropdown contract changed: ${JSON.stringify(projectNavLabels)}`);
}

// Module 3 intentionally must not invent yield/ROI figures before Module 4.
const module3Files = requiredFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const fabricatedFinancialPattern = /(?:estimated|projected)\s+(?:gross\s+|net\s+)?(?:yield|roi)\s*[:=]\s*["']?\d/i;
if (fabricatedFinancialPattern.test(module3Files)) errors.push("Module 3 must not hard-code fabricated yield/ROI figures; Module 4 owns financial modelling.");

if (errors.length > 0) {
  console.error("KeyHold Module 3 verification failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`KeyHold Module 3 verification passed: ${projectCount} projects have discovery metadata, ${areaCount} areas have schematic map positions, discovery + compare routes verified.`);
