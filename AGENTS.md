# AGENTS.md

Notes for AI coding agents (Claude Code, Cursor, Codex, OpenCode, Aider) working on audr-web.

## What this repo is

Marketing site for [audr](https://github.com/harshmaur/audr). Static, privacy-first, no SSR, no DB. The audr scanner itself lives in a separate repo and is pulled in as a git submodule (`vendor/audr/`).

## Hard rules

1. **No third-party JS or network calls.** The page makes zero third-party requests. No GA, no Segment, no Hotjar, no Sentry, no analytics of any kind without explicit approval.
2. **No path leaks in the polished sample report.** `/home/`, `/Users/`, `/parallels/` must never reach `dist/sample-report.html`. The polish script asserts this and fails the build.
3. **No real credentials anywhere.** This is a security tool's marketing site. Use repeated-character placeholders for fixtures (`ghp_aaaa...`, `sk-ant-api03-cccc...`).
4. **WASM blob ships with the audr commit SHA embedded.** Display it in the demo's chrome bar. Provenance matters — visitors are CISOs.
5. **License consistency.** Code under FSL-1.1-MIT to match audr.

## Build & test

```sh
git submodule update --init
bun install
bun run build:wasm  # requires Go 1.22+
bun run polish      # generates public/sample-report.html
bun run build       # astro build (depends on wasm + polish)
bun run test        # vitest
bun run test:e2e    # playwright
```

## Release sync from audr binary

When the audr binary repo publishes a new release tag (e.g. `v0.14.0`), audr-web
needs a corresponding sync PR. This is a two-layer job: **mechanical** (version
strings, schema bytes) and **judgment** (does the new release add features that
the site should describe?). The mechanical layer is fully scripted; the
judgment layer is a content audit the agent runs against the audr CHANGELOG
entry.

The whole sync is one PR titled `chore(site): sync to audr <tag>` containing
both layers' commits.

### Layer 1 — Mechanical sync (always run, zero judgment)

Single source of truth for audr's version on this site lives at
`src/lib/audr-version.ts`. Six places used to hardcode it independently; they
now all import from there.

```sh
# 1. Update the vendor submodule to the new audr release tag
cd vendor/audr && git fetch && git checkout <tag> && cd ../..
git add vendor/audr

# 2. Bump src/lib/audr-version.ts to match
bun run sync:audr <tag>          # e.g. bun run sync:audr v0.14.0

# 3. Copy any updated JSON Schema files from the binary's go:embed source
bun run sync:audr-schema         # idempotent; no-op when bytes already match

# 4. Verify the build still passes
bun run build && bun run typecheck && bun run test
```

If any step fails, fix root cause before continuing. Never paper over by
hand-editing the constants — that defeats the central-source-of-truth design.

### Layer 2 — Content audit (run after Layer 1, requires judgment)

Read the audr `CHANGELOG.md` entry for the new tag. For each top-level
subsection, walk this audit:

- **Added** items
  - New scanner backend? → `/scanners` needs a new card (use the existing
    4-backend pattern in `src/pages/scanners.astro`; append to the
    `backends` array). Do NOT rewrite the `ORCHESTRATE` pillar wording on
    the homepage — the pillar is evergreen; the list grows.
  - New CLI command or flag? → check whether `AIFixLoop.astro` or
    `PostInstallFlow.astro` describes the workflow it touches. Update IF
    the new command is part of the AI fix loop or post-install flow.
    Leave alone otherwise (most flags are internal).
  - New output format? → `/security` and the homepage subhead mention
    output formats; check both.
  - New page in the audr binary's HTTP server (dashboard route)? → no
    site changes (the dashboard is documented in `audr/DESIGN.md`, not
    on audr.dev).

- **Changed** items
  - Grep audr-web for any term the change renames or repositions.
  - Read context; if the current copy contradicts the new behavior,
    propose an edit. If you're unsure, leave a DRAFT note in the PR and
    request human review.

- **Removed** / **Deprecated** items
  - Grep audr-web for any mention of the removed feature.
  - If found, propose removal or rewrite (never silently keep stale
    capability claims).

- **Security** items
  - `/security` may need an update if the trust posture or signing model
    changes.

Skip the audit entirely if the CHANGELOG entry is a patch release with only
internal/test changes (no Added/Changed/Removed/Security subsections worth
audit). State that explicitly in the PR description so the next agent can
verify.

### Output contract

The PR contains:
- A `chore(site): sync to audr <tag>` commit for Layer 1 (always).
- One `content(site): <one-line>` commit per content change from Layer 2
  (only if any). Mark each non-trivial copy/IA change as DRAFT in the PR
  description body and request human review before merge.
- An empty "Layer 2 audit" note in the PR description when nothing was
  surfaced — silence is a signal, not an oversight.

### Cron skip conditions

Skip the entire sync (and emit nothing) when:
- The new tag is identical to `AUDR_VERSION_TAG` in `src/lib/audr-version.ts`
  (already at this release).
- The audr release is a pre-release / alpha / RC (tag matches `*-alpha*`,
  `*-rc*`, etc.). Site documents stable releases only.

## Style

Match audr's commit style. New deps need a one-line justification in the commit message. Default to no comments — only add one when the *why* is non-obvious.
