#!/usr/bin/env node
// scripts/sync-audr-version.mjs
//
// Bumps src/lib/audr-version.ts to the supplied audr release tag.
// Invoked by the hermes release-sync cron post-tag-push, or manually
// during /ship to align the site with an audr release.
//
// Usage:
//   bun run sync:audr v0.14.0
//   node scripts/sync-audr-version.mjs v0.14.0
//
// The argument MUST start with `v` followed by `MAJOR.MINOR.PATCH`. We
// reject anything else so a typo in the cron contract surfaces loudly
// instead of writing a malformed constant.
//
// Idempotent: rerunning with the same tag is a no-op. Exit 0 always
// unless the input is invalid.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const TAG_RE = /^v(\d+\.\d+\.\d+)$/;
const VERSION_FILE = new URL("../src/lib/audr-version.ts", import.meta.url);

function main() {
  const raw = process.argv[2];
  if (!raw) {
    console.error("usage: sync-audr-version.mjs v<MAJOR>.<MINOR>.<PATCH>");
    console.error("example: sync-audr-version.mjs v0.14.0");
    process.exit(2);
  }
  const match = raw.match(TAG_RE);
  if (!match) {
    console.error(`error: ${JSON.stringify(raw)} does not match vX.Y.Z form (e.g. v0.14.0)`);
    process.exit(2);
  }
  const tag = raw; // "v0.14.0"
  const semver = match[1]; // "0.14.0"

  const filePath = fileURLToPath(VERSION_FILE);
  const current = readFileSync(filePath, "utf8");

  const updated = current
    .replace(/export const AUDR_VERSION = "[^"]+";/, `export const AUDR_VERSION = "${semver}";`)
    .replace(/export const AUDR_VERSION_TAG = "[^"]+";/, `export const AUDR_VERSION_TAG = "${tag}";`);

  if (updated === current) {
    // Either already at target (no-op) or the regex didn't match (file
    // schema drifted — surface loudly).
    if (current.includes(`"${semver}"`) && current.includes(`"${tag}"`)) {
      console.log(`audr-version.ts already at ${tag} (no-op)`);
      return;
    }
    console.error("error: could not find expected constants in audr-version.ts");
    console.error("file may have been edited; verify the export shape and re-run");
    process.exit(1);
  }

  writeFileSync(filePath, updated);
  console.log(`bumped audr-version.ts: AUDR_VERSION=${semver}, AUDR_VERSION_TAG=${tag}`);
}

main();
