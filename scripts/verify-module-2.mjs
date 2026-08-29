import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const dataPath = path.join(root, "data", "real-estate.ts");
const data = fs.readFileSync(dataPath, "utf8");

const requiredFiles = [
  "types/real-estate.ts",
  "data/real-estate.ts",
  "lib/real-estate.ts",
  "app/projects/[slug]/page.tsx",
  "app/developers/[slug]/page.tsx",
  "app/areas/[slug]/page.tsx",
  "app/updates/[slug]/page.tsx",
  "components/real-estate/unit-selector.tsx",
  "components/real-estate/payment-plan.tsx",
  "components/real-estate/regulatory-card.tsx",
  "public/images/floor-plan-demo.svg",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing Module 2 file: ${file}`);
}

if (!data.includes("MODULE 2 DEMO DATA ONLY")) {
  errors.push("Demo-data warning is missing from data/real-estate.ts");
}

const unitSelector = fs.readFileSync(path.join(root, "components/real-estate/unit-selector.tsx"), "utf8");
const requiredDisclaimer = "Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice.";
if (!unitSelector.includes(requiredDisclaimer)) {
  errors.push("Required Unit Selector availability disclaimer is missing or altered.");
}

function sectionBetween(start, end) {
  const startIndex = data.indexOf(start);
  const endIndex = data.indexOf(end, startIndex + start.length);
  if (startIndex === -1 || endIndex === -1) return "";
  return data.slice(startIndex, endIndex);
}

function values(source, field) {
  return [...source.matchAll(new RegExp(`\\b${field}: \\"([^\\"]+)\\"`, "g"))].map((match) => match[1]);
}

const developerSection = sectionBetween("export const developers", "export const areas");
const areaSection = sectionBetween("export const areas", "const commonDocuments");
const projectSection = sectionBetween("export const projects", "export const constructionUpdates");
const updateSection = data.slice(data.indexOf("export const constructionUpdates"));

const developerSlugs = new Set(values(developerSection, "slug"));
const areaSlugs = new Set(values(areaSection, "slug"));
const projectSlugs = values(projectSection, "slug");
const projectSlugSet = new Set(projectSlugs);

if (projectSlugSet.size !== projectSlugs.length) errors.push("Duplicate project slug detected.");

for (const developerSlug of values(projectSection, "developerSlug")) {
  if (!developerSlugs.has(developerSlug)) errors.push(`Unknown developerSlug referenced by project: ${developerSlug}`);
}
for (const areaSlug of values(projectSection, "areaSlug")) {
  if (!areaSlugs.has(areaSlug)) errors.push(`Unknown areaSlug referenced by project: ${areaSlug}`);
}
for (const projectSlug of values(updateSection, "projectSlug")) {
  if (!projectSlugSet.has(projectSlug)) errors.push(`Construction update references unknown projectSlug: ${projectSlug}`);
}

const paymentBlocks = [...projectSection.matchAll(/paymentPlan:\s*\[(.*?)\]\s*,\n\s*floorPlans:/gs)];
for (const [index, match] of paymentBlocks.entries()) {
  const percentages = [...match[1].matchAll(/percentage:\s*(\d+(?:\.\d+)?)/g)].map((item) => Number(item[1]));
  if (percentages.length > 0) {
    const total = percentages.reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 100) > 0.0001) errors.push(`Payment plan #${index + 1} totals ${total}% instead of 100%.`);
  }
}

for (const match of updateSection.matchAll(/progress:\s*(\d+(?:\.\d+)?)/g)) {
  const progress = Number(match[1]);
  if (progress < 0 || progress > 100) errors.push(`Construction progress outside 0–100: ${progress}`);
}

if (/registrationStatus:\s*"verified"/.test(projectSection)) {
  errors.push("Demo inventory must not claim regulatory verification. Replace demo records with verified production data first.");
}

const codeFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", ".next"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\.(ts|tsx)$/.test(entry.name)) codeFiles.push(fullPath);
  }
}
walk(root);

const referencedImages = new Set();
for (const file of codeFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/["'](\/images\/[^"']+)["']/g)) referencedImages.add(match[1]);
}
for (const image of referencedImages) {
  if (!fs.existsSync(path.join(root, "public", image.replace(/^\//, "")))) errors.push(`Missing local image referenced in source: ${image}`);
}

if (errors.length > 0) {
  console.error("KeyHold Module 2 verification failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`KeyHold Module 2 verification passed: ${projectSlugs.length} projects, ${developerSlugs.size} developers, ${areaSlugs.size} areas, ${values(updateSection, "slug").length} updates, ${referencedImages.size} local images checked.`);
