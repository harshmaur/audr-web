# audr-web

Marketing site for [audr](https://github.com/harshmaur/audr) — a single static Go binary that scans AI coding agent configs (Claude Code, Cursor, Codex CLI, Windsurf, MCP servers, agent skills, GitHub Actions) for security misconfigurations.

Live at https://audr.dev.

## Stack

- **Astro 5** static site, **React** islands (one: the WASM scan demo)
- **Tailwind** for styling, **IBM Plex Mono / Sans** self-hosted (no Google Fonts)
- **WASM** scan engine compiled from [`harshmaur/audr`](https://github.com/harshmaur/audr) (pinned via git submodule)
- **Vercel** hosting (Git integration), no third-party analytics
- **Vitest** + **Playwright** + **Lighthouse CI** in CI

## Development

```sh
# 1) Pull the audr submodule (pinned to a release tag)
git submodule update --init --recursive

# 2) Install JS deps
npm install

# 3) Build the WASM scan engine (requires Go 1.22+)
npm run build:wasm

# 4) Polish the sample report from the audr submodule
npm run polish

# 5) Dev server
npm run dev
```

## Repo layout

- `src/pages/` — Astro routes (`/`, `/sample-report`, `/security`, `/404`)
- `src/components/` — Astro + React components
- `src/data/cves.json` — content source for H1 + CVE strip (curated)
- `src/wasm/` — Go source for the WASM scan engine wrapper
- `vendor/audr/` — git submodule pinned to the audr release whose rules + parsers are compiled
- `scripts/build-wasm.sh` — builds `public/wasm/audr.wasm` from the submodule
- `scripts/polish-sample-report.mjs` — strips path leaks from `vendor/audr/docs/sample-report.html`
- `public/install.sh` — wrapper that sets `AUDR_INSTALL_FROM=audr.dev` and execs the canonical installer

## Tests

```sh
npm run lint && npm run typecheck
npm run test           # vitest unit + integration
npm run test:e2e       # playwright e2e
npm run lighthouse     # lighthouse ci
```

## License

[FSL-1.1-MIT](LICENSE) — same license as audr. Becomes plain MIT two years after each release.
