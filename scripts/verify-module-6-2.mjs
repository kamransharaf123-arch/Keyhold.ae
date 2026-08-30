#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const notes = [];

function fail(message) { failures.push(message); }
function note(message) { notes.push(message); }
function exists(file) { return fs.existsSync(path.join(root, file)); }
function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}
function requireFile(file) { if (!exists(file)) fail(`Missing required Module 6.2 file: ${file}`); }
function requireContains(file, needle, label = needle) {
  const source = read(file);
  if (!source.includes(needle)) fail(`${file} is missing ${label}`);
}
function oneOf(files, needles, label) {
  const haystack = files.map(read).join("\n");
  if (!needles.some((needle) => haystack.includes(needle))) fail(`Missing integration: ${label}`);
}

const required = [
  "types/motion.ts",
  "lib/motion/config.ts",
  "components/motion/use-motion-preference.ts",
  "components/motion/reveal.tsx",
  "components/motion/stagger-reveal.tsx",
  "components/motion/animated-headline.tsx",
  "components/motion/hero-parallax.tsx",
  "components/motion/count-up.tsx",
  "components/motion/animated-progress.tsx",
  "components/motion/image-reveal.tsx",
  "components/motion/chart-reveal.tsx",
  "components/motion/motion-header.tsx",
  "components/motion/scroll-cue.tsx",
  "app/motion.css",
  "app/admin/motion-actions.ts",
  "app/admin/(protected)/website/motion/page.tsx",
];
required.forEach(requireFile);

requireContains("app/motion.css", "prefers-reduced-motion: reduce", "reduced-motion override");
requireContains("app/motion.css", "@media (hover: hover) and (pointer: fine)", "hover-capable pointer guard");
requireContains("app/motion.css", "data-motion-ready=\"true\"", "progressive reveal guard");
requireContains("lib/motion/config.ts", "DEFAULT_WEBSITE_MOTION", "default motion configuration");
requireContains("lib/motion/config.ts", "maxParallaxPx", "bounded hero parallax configuration");
requireContains("components/motion/hero-parallax.tsx", "requestAnimationFrame", "RAF-throttled parallax");
requireContains("components/motion/hero-parallax.tsx", "passive: true", "passive scroll listener");
requireContains("components/motion/reveal.tsx", "IntersectionObserver", "IntersectionObserver reveal");
requireContains("components/motion/stagger-reveal.tsx", "IntersectionObserver", "IntersectionObserver stagger");
requireContains("components/motion/count-up.tsx", "Number.isFinite", "finite-value guard");
requireContains("components/motion/animated-progress.tsx", "aria-valuenow", "accessible progress value");
requireContains("app/admin/motion-actions.ts", "requireAdmin([\"owner\", \"admin\"])", "owner/admin authorization");
requireContains("app/admin/motion-actions.ts", "theme: { ...currentTheme, motion }", "non-destructive theme merge");

const packageJson = read("package.json");
if (packageJson) {
  for (const banned of ["framer-motion", "gsap", "three", "locomotive-scroll", "lenis"]) {
    if (packageJson.includes(`\"${banned}\"`)) fail(`Module 6.2 must not introduce heavy motion dependency: ${banned}`);
  }
}

for (const layout of ["app/(en)/layout.tsx", "app/fr/layout.tsx"]) {
  if (exists(layout)) {
    requireContains(layout, "motion.css", `${layout} motion stylesheet import`);
    requireContains(layout, "websiteMotionBodyAttributes", `${layout} motion CMS body attributes`);
    requireContains(layout, "websiteMotionStyle", `${layout} motion CSS timing variables`);
  }
}

oneOf(["components/site-header.tsx", "components/website/site-header.tsx"], ["MotionHeader", "kh-site-header"], "scrolled header polish");
oneOf(["app/(en)/page.tsx", "components/home/home-sections.tsx", "components/website/home-page.tsx", "components/website/page-renderer.tsx"], ["HeroParallax", "AnimatedHeadline"], "cinematic Home hero integration");
oneOf(["app/(en)/page.tsx", "components/home/home-sections.tsx", "components/website/home-page.tsx", "components/website/page-renderer.tsx"], ["StaggerReveal", "kh-stagger"], "Home/editorial stagger integration");
oneOf(["components/project-card.tsx", "components/discovery/discovery-project-card.tsx"], ["kh-motion-card"], "project-card motion class");
oneOf(["components/update-card.tsx", "components/website/update-card.tsx"], ["kh-motion-card", "StaggerReveal"], "update-card motion integration");
oneOf(["components/intelligence/risk-radar.tsx", "components/intelligence/keyhold-intelligence.tsx"], ["ChartReveal", "data-kh-chart"], "Intelligence chart reveal");
oneOf(["components/real-estate/payment-plan.tsx", "components/real-estate/construction-timeline.tsx", "components/update-card.tsx", "components/investment/investment-simulator.tsx"], ["AnimatedProgress", "kh-progress", "progressAnimation"], "data/progress motion integration");

const adminNavSources = ["components/admin/admin-shell.tsx", "app/admin/(protected)/website/page.tsx"].map(read).join("\n");
if (adminNavSources && !adminNavSources.includes("/admin/website/motion")) {
  fail("Admin navigation/Website Studio must link to /admin/website/motion");
}

const css = read("app/motion.css");
if (/\.kh-reveal\s*\{[^}]*opacity:\s*0/s.test(css)) {
  fail("Reveal content must not be hidden by default; opacity 0 must be gated by data-motion-ready=true.");
}
if (/scroll-behavior:\s*none|overflow:\s*hidden\s*;[^}]*body/s.test(css)) {
  fail("Do not hijack scrolling or globally hide page overflow.");
}

note("Module 6.2 verifier checks additive motion primitives, accessibility guards, no heavy motion dependency, and semantic integration markers.");

if (failures.length) {
  console.error("\nModule 6.2 verification FAILED:\n");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("Module 6.2 verification passed.");
notes.forEach((message) => console.log(`- ${message}`));
