import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const extensions = new Set([".ts", ".tsx"]);
const ignored = new Set(["node_modules", ".next"]);
const errors = [];
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (extensions.has(path.extname(entry.name))) files.push(fullPath);
  }
}

walk(root);

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  for (const diagnostic of source.parseDiagnostics) {
    const position = diagnostic.start ?? 0;
    const { line, character } = source.getLineAndCharacterOfPosition(position);
    errors.push(`${path.relative(root, file)}:${line + 1}:${character + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
  }
}

const requiredRoutes = [
  "app/page.tsx",
  "app/projects/page.tsx",
  "app/projects/off-plan/page.tsx",
  "app/projects/ready/page.tsx",
  "app/projects/short-term-rentals/page.tsx",
  "app/projects/long-term-rentals/page.tsx",
  "app/discover/page.tsx",
  "app/compare/page.tsx",
  "app/updates/page.tsx",
  "app/insights/page.tsx",
  "app/services/page.tsx",
  "app/who-we-are/page.tsx",
];

for (const route of requiredRoutes) {
  if (!fs.existsSync(path.join(root, route))) errors.push(`Missing required route: ${route}`);
}

if (errors.length) {
  console.error("KeyHold source verification failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`KeyHold source verification passed (${files.length} TypeScript/TSX files parsed).`);
