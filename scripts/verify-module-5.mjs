import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "types/intelligence.ts",
  "data/intelligence.ts",
  "lib/intelligence.ts",
  "components/intelligence/keyhold-intelligence.tsx",
  "components/intelligence/risk-radar.tsx",
  "components/intelligence/price-history-chart.tsx",
  "components/intelligence/status-badge.tsx",
  "app/(en)/intelligence/page.tsx",
  "app/(en)/intelligence-methodology/page.tsx",
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing Module 5 file: ${file}`);
}

const data = fs.readFileSync(path.join(root, "data/intelligence.ts"), "utf8");
const lib = fs.readFileSync(path.join(root, "lib/intelligence.ts"), "utf8");
const component = fs.readFileSync(path.join(root, "components/intelligence/keyhold-intelligence.tsx"), "utf8");
const methodology = fs.readFileSync(path.join(root, "app/(en)/intelligence-methodology/page.tsx"), "utf8");

const expectedSlugs = ["coastal-residences", "downtown-collection", "desert-golf-villas", "creekside-ready-home"];
for (const slug of expectedSlugs) {
  if (!data.includes(`projectSlug: \"${slug}\"`)) throw new Error(`Missing intelligence profile for ${slug}`);
}

const profileCount = (data.match(/projectSlug:/g) ?? []).length;
if (profileCount !== 4) throw new Error(`Expected exactly 4 Module 5 intelligence profiles, found ${profileCount}`);

const demoStatusCount = (data.match(/dataStatus: \"demo-placeholder\"/g) ?? []).length;
if (demoStatusCount !== profileCount) throw new Error("Every Module 5 profile must remain demo-placeholder in this handoff.");

if (/status:\s*\"verified\"/.test(data)) throw new Error("Module 5 demo data must not fabricate verified source status.");
if (/https?:\/\//.test(data)) throw new Error("Module 5 demo intelligence data must not contain fabricated source URLs.");

const weights = [...data.matchAll(/weight:\s*(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
if (weights.length !== profileCount * 6) throw new Error(`Expected ${profileCount * 6} score weights, found ${weights.length}`);
for (let i = 0; i < profileCount; i += 1) {
  const sum = weights.slice(i * 6, i * 6 + 6).reduce((a, b) => a + b, 0);
  if (sum !== 100) throw new Error(`Profile ${i + 1} score weights must total 100, found ${sum}`);
}

const scores = [...data.matchAll(/score:\s*(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
for (const score of scores) if (!Number.isFinite(score) || score < 0 || score > 10) throw new Error(`Invalid score ${score}`);
const risks = [...data.matchAll(/risk:\s*(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
for (const risk of risks) if (!Number.isFinite(risk) || risk < 0 || risk > 10) throw new Error(`Invalid risk ${risk}`);

if (!lib.includes("calculateInvestmentScore") || !lib.includes("calculateMarketPosition") || !lib.includes("getRiskBand")) throw new Error("Core Module 5 intelligence calculations are missing.");
if (!component.includes("KeyHold Investment Score") || !component.includes("KeyHold Verdict") || !component.includes("Source ledger")) throw new Error("Core Module 5 UI sections are missing.");
if (!component.includes("guaranteed return") || !component.includes("not an appraisal")) throw new Error("Required intelligence disclaimers are missing.");
if (!methodology.includes("No source, no claim") || !methodology.includes("Demo placeholder") || !methodology.includes("Pending verification") || !methodology.includes("Verified")) throw new Error("Methodology publication/source-status rules are incomplete.");

console.log(`Module 5 verification passed: ${profileCount} intelligence profiles, ${scores.length} score inputs, ${risks.length} risk inputs, no fabricated verified sources.`);
