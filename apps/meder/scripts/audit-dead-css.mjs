// Dead-CSS audit: extracts class selectors from globals.css and reports
// selectors never referenced by any TSX/TS/HTML source. Diagnostic only.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const appDir = new URL("..", import.meta.url).pathname;
const css = readFileSync(join(appDir, "app/globals.css"), "utf8");

// Collect every class token used in source files (.tsx/.ts).
const sources = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mjs|js)$/.test(entry)) sources.push(p);
  }
}
walk(appDir);
const used = new Set();
for (const file of sources) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/className=["'{`]([^"'`}]+)/g)) {
    for (const token of m[1].split(/\s+/)) used.add(token);
  }
  // also template-literal fragments
  for (const m of text.matchAll(/[`'"]([a-z0-9 -]*(?:card|badge|btn|orb|chip|strip|help|sheet|field)[a-z0-9 -]*)[`'"]/gi)) {
    for (const token of m[1].split(/\s+/)) if (token) used.add(token);
  }
}

// Extract simple class selectors from CSS (skip combinators/pseudo for now).
const cssClasses = new Set();
for (const m of css.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) cssClasses.add(m[1]);

const dead = [...cssClasses].filter((c) => !used.has(c)).sort();

// Legacy custom properties: which --vars are declared vs consumed.
const declared = new Set([...css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]));
const consumed = new Set([...css.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)].map((m) => m[1]));
// vars consumed in TSX inline styles
for (const file of sources.filter((f) => f.endsWith(".tsx"))) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) consumed.add(m[1]);
}
const unusedVars = [...declared].filter((v) => !consumed.has(v)).sort();

console.log("=== CSS classes with no source reference (candidates) ===");
console.log(dead.join("\n"));
console.log("\n=== Declared custom properties never consumed ===");
console.log(unusedVars.join("\n"));
