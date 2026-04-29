#!/usr/bin/env node
// Polishes audr's docs/sample-report.html (canonical, in vendor/audr/) into
// public/sample-report.html for the marketing site.
//
// Polishing scope (per office-hours design):
//   - Remove any `/home/parallels/` or `/Users/...` absolute paths
//   - Remove `testdata/laptops/dirty/` prefix on every path (becomes
//     `~/laptops/dev-machine-12/`)
//   - Rewrite the page <title> + verdict-lead eyebrow to "Sample fleet scan"
//   - Insert a redacted-excerpt note at the top
//
// Hard assertions (build fails if any fire):
//   - Output contains zero matches for `/home/`, `/Users/`, `/parallels/`,
//     `testdata/`, or "fixture"
//   - Output still contains the verdict-lead, metrics, and at least one
//     path-group <details>

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const SOURCE = join(root, "vendor/audr/docs/sample-report.html");
const TARGET = join(root, "public/sample-report.html");

if (!existsSync(SOURCE)) {
  console.error(
    `polish: source missing at ${SOURCE}\n` +
      `  Run \`git submodule update --init --recursive\` first.`,
  );
  process.exit(2);
}

let html = readFileSync(SOURCE, "utf8");
const before = html.length;

// --- 1. Replace absolute paths anyone forgot to redact at audr's release time.
html = html.replace(/\/home\/parallels\/[^\s"<>'`]+/g, "~/laptops/dev-machine-12");
html = html.replace(/\/home\/[a-z0-9_-]+\/[^\s"<>'`]+/g, "~/laptops/dev-machine-12");
html = html.replace(/\/Users\/[a-z0-9_-]+\/[^\s"<>'`]+/g, "~/laptops/dev-machine-12");

// --- 2. Replace test-fixture path prefix.
html = html.replace(/testdata\/laptops\/dirty/g, "~/laptops/dev-machine-12");
html = html.replace(/path-testdata-laptops-dirty/g, "path-laptop-dev-machine-12");

// --- 3. Rewrite the page <title>.
html = html.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>Audr — Sample fleet scan (redacted excerpt) · 200-laptop dev fleet</title>",
);

// --- 4. Rewrite the eyebrow + verdict tag-version banner.
html = html.replace(
  /<div class="eyebrow">[\s\S]*?<\/div>/,
  `<div class="eyebrow">
    <span><strong>AUDR</strong> · sample fleet scan · redacted excerpt</span>
    <span class="tag-version">200-laptop dev fleet</span>
  </div>`,
);

// --- 5. Inject the redacted-excerpt note immediately after <body> opens, so
//        a visitor lands on it before reading findings.
const banner = `
  <aside style="border:1px solid var(--audr-border,#e5e5e0);padding:14px 16px;margin:20px auto;max-width:980px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13.5px;line-height:1.55;background:var(--audr-surface-2,#f7f7f2);">
    <strong>Note —</strong> this is a redacted excerpt of a real audr scan against a
    development machine. Paths and identifiers are normalized so this artifact can be
    safely linked. To run audr against your own machine:
    <code style="display:inline-block;padding:2px 6px;background:#0e0e0c;color:#f5f5f0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">curl -fsSL https://audr.dev/install.sh | sh</code>
  </aside>
`;
if (html.includes("<body")) {
  html = html.replace(/<body([^>]*)>/, `<body$1>${banner}`);
}

// --- 6. Hard assertions on the polished output.
const violations = [];
const FORBIDDEN = [
  { pattern: /\/home\//, label: "/home/" },
  { pattern: /\/Users\//, label: "/Users/" },
  { pattern: /\/parallels\//, label: "/parallels/" },
  { pattern: /testdata\//, label: "testdata/" },
  { pattern: /\bfixture\b/i, label: '"fixture"' },
  { pattern: /laptops\/dirty/, label: "laptops/dirty" },
];
for (const { pattern, label } of FORBIDDEN) {
  if (pattern.test(html)) {
    violations.push(label);
  }
}
const REQUIRED = [
  { pattern: /class="verdict-lead"/, label: "verdict-lead" },
  { pattern: /class="metrics"/, label: "metrics block" },
  { pattern: /<details class="path-group"/, label: "at least one path-group" },
];
for (const { pattern, label } of REQUIRED) {
  if (!pattern.test(html)) {
    violations.push(`missing ${label}`);
  }
}

if (violations.length > 0) {
  console.error(`polish: BUILD FAIL — assertions violated:\n  - ${violations.join("\n  - ")}`);
  process.exit(2);
}

mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, html);

const after = html.length;
console.log(
  `polish: ok — wrote ${TARGET} (${after.toLocaleString()} bytes, delta ${after - before})`,
);
