// Audr release this site documents.
//
// Bumped by `scripts/sync-audr-version.mjs` (called by the hermes
// release-sync cron after audr publishes a new tag) or manually with
// `bun run sync:audr v0.14.0`.
//
// Every component / page that needs to display or interpolate the audr
// version imports from here. Adding new touch points: import this file
// instead of typing the version inline. See AGENTS.md "Release sync from
// audr binary" for the full contract hermes follows.

/** Semver only, no v-prefix. Used in JSON-LD softwareVersion and similar. */
export const AUDR_VERSION = "0.14.1";

/** With v-prefix to match git tags. Used in header strip, tarball names, etc. */
export const AUDR_VERSION_TAG = "v0.14.1";
