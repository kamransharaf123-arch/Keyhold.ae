import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const globals = read("app/globals.css");
const requiredTokens = [
  "--color-teal: #497c78;",
  "--color-teal-deep: #35645f;",
  "--color-teal-soft: #e4efed;",
  "--color-sage: #7f9275;",
  "--color-sage-deep: #65795e;",
  "--color-sage-soft: #eaf0e6;",
  "--color-champagne: #b99a68;",
  "--color-champagne-ink: #896c46;",
  "--color-champagne-soft: #f2ebdd;",
  "--color-terracotta: #c78368;",
  "--color-terracotta-deep: #9b5f49;",
  "--color-terracotta-soft: #f5e8e2;",
  "--color-stone: #71726f;",
];
for (const token of requiredTokens) {
  if (!globals.includes(token)) errors.push(`Missing design token: ${token}`);
}

if (!globals.includes(".button-dark") || !globals.includes("background: var(--color-teal);")) {
  errors.push("Primary button is not using the KeyHold teal token.");
}
if (!globals.includes("outline: 2px solid var(--color-teal);")) {
  errors.push("Focus treatment is not using the positive teal focus color.");
}

const home = read("app/page.tsx");
if (!home.includes("rgba(25,52,49,0.82)")) errors.push("Home hero does not use the warm deep-teal overlay.");
if (!home.includes("bg-[var(--color-teal-soft)]")) errors.push("Home is missing the positive teal-soft discovery surface.");
if (!home.includes("bg-[var(--color-champagne-soft)]")) errors.push("Home is missing the warm champagne services surface.");

const header = read("components/site-header.tsx");
const requiredNavLabels = ["Home", "Projects"];
for (const label of requiredNavLabels) {
  if (!header.includes(label)) errors.push(`Header contract changed: missing ${label}.`);
}

const data = read("data/site.ts");
for (const label of ["Updates", "Insights", "Services", "Who We Are"]) {
  if (!data.includes(`label: "${label}"`)) errors.push(`Primary navigation data is missing ${label}.`);
}
for (const label of ["Off-Plan", "Ready", "Short-Term Rentals", "Long-Term Rentals"]) {
  if (!data.includes(`label: "${label}"`)) errors.push(`Projects dropdown data is missing ${label}.`);
}

const interactiveFiles = [
  "components/discovery/discovery-explorer.tsx",
  "components/discovery/discovery-project-card.tsx",
  "components/discovery/area-explorer-map.tsx",
  "components/real-estate/unit-selector.tsx",
  "components/investment/investment-simulator.tsx",
];
for (const rel of interactiveFiles) {
  const text = read(rel);
  if (text.includes("bg-[var(--color-graphite)]")) {
    errors.push(`${rel} still uses graphite as a selected/interactive fill; use the positive action palette.`);
  }
}

const investment = read("components/investment/investment-simulator.tsx");
if (investment.includes("text-red-700")) errors.push("Investment simulator still uses harsh red utility text instead of terracotta risk styling.");
if (!investment.includes("var(--color-sage-deep)")) errors.push("Investment simulator is missing positive sage output styling.");

const status = read("components/intelligence/status-badge.tsx");
for (const token of ["color-sage-soft", "color-champagne-soft", "color-teal-soft"]) {
  if (!status.includes(token)) errors.push(`Intelligence status badges are missing ${token}.`);
}

if (errors.length) {
  console.error("KeyHold design refresh verification failed:\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}

console.log("KeyHold Warm Luxury + Positive Intelligence design checks passed.");
