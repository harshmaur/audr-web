#!/usr/bin/env node
// scripts/sync-audr-schema.mjs
//
// Copies internal/output/schema/*.json from the vendor/audr submodule into
// public/schema/ if the bytes differ. Invoked by the hermes release-sync
// cron after vendor/audr is bumped to a new audr release tag.
//
// Usage:
//   bun run sync:audr-schema
//   node scripts/sync-audr-schema.mjs
//
// The audr binary embeds these schemas via go:embed and stamps the
// schema URL onto every `audr scan -f json` Report. Drift between the
// embedded copy in the binary and the hosted copy at audr.dev/schema/
// would mean an agent fetching the URL gets a different document than
// what the binary advertises. This script keeps them in sync.
//
// Idempotent: rerunning when nothing changed is a no-op (no writes, no
// commit churn).

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, basename } from "node:path";

const SRC_DIR = fileURLToPath(new URL("../vendor/audr/internal/output/schema", import.meta.url));
const DEST_DIR = fileURLToPath(new URL("../public/schema", import.meta.url));

function main() {
  if (!existsSync(SRC_DIR)) {
    console.warn(`sync-audr-schema: source not found at ${SRC_DIR} — skipping`);
    console.warn("(this is expected if vendor/audr predates v0.13.0 schema embedding)");
    process.exit(0);
  }
  mkdirSync(DEST_DIR, { recursive: true });

  let copied = 0;
  let unchanged = 0;
  for (const entry of readdirSync(SRC_DIR)) {
    if (!entry.endsWith(".json")) continue;
    const src = join(SRC_DIR, entry);
    if (!statSync(src).isFile()) continue;
    const dest = join(DEST_DIR, entry);
    const srcBytes = readFileSync(src);
    let same = false;
    if (existsSync(dest)) {
      const destBytes = readFileSync(dest);
      if (srcBytes.length === destBytes.length && srcBytes.equals(destBytes)) {
        same = true;
      }
    }
    if (same) {
      unchanged++;
      continue;
    }
    copyFileSync(src, dest);
    console.log(`copied ${entry} → public/schema/${basename(dest)}`);
    copied++;
  }
  if (copied === 0 && unchanged > 0) {
    console.log(`audr schema: ${unchanged} file(s) already in sync (no-op)`);
  }
}

main();
