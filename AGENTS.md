# AGENTS.md

Notes for AI coding agents (Claude Code, Cursor, Codex, OpenCode, Aider) working on audr-web.

## What this repo is

Marketing site for [audr](https://github.com/harshmaur/audr). Static, privacy-first, no SSR, no DB. The audr scanner itself lives in a separate repo and is pulled in as a git submodule (`vendor/audr/`).

## Hard rules

1. **No third-party JS that violates the offline-by-default brand promise.** Pirsch is the only allowed third-party network call. No GA, no Segment, no Hotjar, no Sentry without explicit approval.
2. **No path leaks in the polished sample report.** `/home/`, `/Users/`, `/parallels/` must never reach `dist/sample-report.html`. The polish script asserts this and fails the build.
3. **No real credentials anywhere.** This is a security tool's marketing site. Use repeated-character placeholders for fixtures (`ghp_aaaa...`, `sk-ant-api03-cccc...`).
4. **WASM blob ships with the audr commit SHA embedded.** Display it in the demo's chrome bar. Provenance matters — visitors are CISOs.
5. **License consistency.** Code under FSL-1.1-MIT to match audr.

## Build & test

```sh
git submodule update --init
npm install
npm run build:wasm  # requires Go 1.22+
npm run polish      # generates public/sample-report.html
npm run build       # astro build (depends on wasm + polish)
npm test            # vitest
npm run test:e2e    # playwright
```

## Style

Match audr's commit style. New deps need a one-line justification in the commit message. Default to no comments — only add one when the *why* is non-obvious.
