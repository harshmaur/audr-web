# audr-web

Marketing site for [audr](https://github.com/harshmaur/audr) — a single static Go binary that scans AI coding agent configs (Claude Code, Cursor, Codex CLI, Windsurf, MCP servers, agent skills, GitHub Actions), package vulnerabilities, local compromise IOCs, and optional secret exposure for developer-machine risk.

Live at https://audr.dev.

## Stack

- **Astro 5** static site, **React** islands (one: the WASM scan demo)
- **Tailwind** for styling, **IBM Plex Mono / Sans** self-hosted (no Google Fonts)
- **WASM** scan engine compiled from [`harshmaur/audr`](https://github.com/harshmaur/audr) (pinned via git submodule)
- Public advisory coverage at `/coverage`, generated from shipped CVEs plus public-safe ledger rows
- **Vercel** hosting (Git integration), no third-party analytics
- **Vitest** + **Playwright** + **Lighthouse CI** in CI

## Development

```sh
# 1) Pull the audr submodule (pinned to a release tag)
git submodule update --init --recursive

# 2) Install JS deps
bun install --frozen-lockfile

# 3) Build the WASM scan engine (requires Go 1.22+)
bun run build:wasm

# 4) Polish the sample report from the audr submodule
bun run polish

# 5) Dev server
bun run dev
```

## Repo layout

- `src/pages/` — Astro routes (`/`, `/coverage`, `/sample-report`, `/security`, `/404`)
- `src/components/` — Astro + React components
- `src/data/cves.json` — durable shipped advisory/CVE store; homepage renders the latest proof cards, not the whole history
- `src/data/coverage-ledger.json` — generated public-safe advisory ledger for `/coverage`
- `src/wasm/` — Go source for the WASM scan engine wrapper
- `vendor/audr/` — git submodule pinned to the audr release whose rules + parsers are compiled
- `scripts/build-wasm.sh` — builds `public/wasm/audr.wasm` from the submodule
- `scripts/generate-coverage-ledger.mjs` — regenerates the public coverage snapshot from audr/audr-web data
- `scripts/polish-sample-report.mjs` — strips path leaks from `vendor/audr/docs/sample-report.html`
- `public/install.sh` — wrapper that sets `AUDR_INSTALL_FROM=audr.dev` and execs the canonical installer

## Coverage/content updates

When the audr submodule changes, rebuild the browser scanner and verify the public report surfaces the same product story:

```sh
bun run build:wasm
bun run generate:coverage-ledger
bun run polish
bun run check
bun run test
bun run build
```

For supply-chain campaigns such as Mini Shai-Hulud, audr-web should describe both layers honestly:

- OSV-Scanner supplies broad package vulnerability evidence when available.
- Audr-native checks add local developer-machine evidence OSV cannot see: agent persistence hooks, workflow exfiltration, token-monitor services, and bounded payload-file IOCs.
- Candidate/advisory rows on `/coverage` must not imply shipped coverage unless a real audr rule or OSV-backed finding exists.

## Tests

```sh
bun run check         # astro/type checks
bun run test          # vitest unit + integration
bun run build         # polish + static build
bun run test:e2e      # playwright e2e
bun run lighthouse    # lighthouse ci, when needed
```

## License

[FSL-1.1-MIT](LICENSE) — same license as audr. Becomes plain MIT two years after each release.
