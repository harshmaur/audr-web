# Reposition Homepage Around AI-Agent Config Posture Implementation Plan

> **For Hermes:** Use gstack review flow before implementation. After approval, implement task-by-task and run verification before commit.

**Goal:** Rework the audr-web homepage so Audr clearly owns AI-agent config posture, with CVEs used as supporting proof instead of the primary category frame.

**Architecture:** This is a copy and layout change in the existing Astro marketing page. Keep the current static Astro/Tailwind structure, the WASM demo, install CTA, sample report CTA, and CVE data pipeline. Update the hero, advisory strip framing, and metadata copy without introducing third-party JS, analytics, new dependencies, or runtime network calls.

**Tech Stack:** Astro 5, Tailwind, React island for ScanDemo, existing Bun project conventions.

---

## Premises

1. Audr should be perceived as an AI-agent-config posture scanner, not a general CVE scanner.
2. The homepage currently over-weights CVE language in the hero and Recent Advisories section.
3. CVEs are still useful as proof that Audr tracks current agent-security issues, but they should support the core category claim.
4. The first implementation should be narrow: homepage copy and section framing only. Buyer CTA, coverage matrix, evidence bundle, baseline governance, and deeper harness model are follow-up work.

## User-facing outcome

A visitor should understand in the first screen:

- Audr scans AI coding agent configs.
- The risk is local agent capability: secrets, shell commands, trusted repos, MCP servers, CI agent paths.
- It runs offline as a single binary and produces a shareable report.
- Recent CVEs prove freshness, but the product category is agent posture.

## NOT in scope for this plan

- Public CVE coverage matrix.
- Design partner / fleet-pilot CTA.
- Evidence bundle in scan reports.
- Baseline and inline suppression workflow.
- New scanner rules or parser changes.
- SaaS telemetry or fleet aggregation.
- Sample report redesign.

## Existing code leverage map

- `src/pages/index.astro`: loads CVEs, sets metadata description, renders LiveTag, Hero, ScanDemo, CVEStrip, SampleReportTeaser.
- `src/components/LiveTag.astro`: above-hero freshness badge. Must be checked because the current copy is CVE-first.
- `src/components/Hero.astro`: current above-the-fold positioning and CTA row.
- `src/components/CVEStrip.astro`: current “Five CVEs…” supporting proof section.
- `src/components/SampleReportTeaser.astro`: existing proof path for local scan → attack chain → shareable report.
- `tests/e2e/home.spec.ts`: currently asserts H1 contains `CVE-`; must change with the new positioning.
- `tests/unit/h1-template.test.ts`: currently validates the old CVE-led hero template; must be updated or replaced.
- `src/lib/cves.ts`: loads and selects CVE data. No expected changes.
- `src/data/cves.json`: source data. No expected changes.

## Claim-to-proof checklist

Before final copy ships, each hero claim must map to product evidence:

| Claim | Evidence source | Copy rule |
|---|---|---|
| Secrets exposure | existing MCP/env/secret findings and sample-report attacker-gets language | Say “flags risky configs such as secrets exposure,” not “guarantees all secrets are found.” |
| Shell commands/hooks | Claude hook/statusLine and shell command rules | Safe to name directly. |
| Trusted workspaces/repos | Codex trusted `$HOME` / workspace trust rules and attack chains | Say “trusted workspaces/repos” rather than broad endpoint-control claims. |
| MCP servers | normalized MCP parsing and MCP rules | Safe to name directly. |
| CI agent paths | GitHub Actions agent-step rules and SARIF path | Safe to name as a scanned surface. |
| Offline evidence | install/demo/security copy and sample report | Keep “offline single binary” and “HTML/SARIF/JSON reports” prominent. |

---

### Task 1: Reframe the hero around agent posture

**Objective:** Replace the dynamic CVE-led H1 with a stable category-led H1 that names the concrete agent risks Audr finds without overclaiming complete coverage.

**Files:**
- Modify: `src/components/Hero.astro`

**Implementation notes:**
- Remove Hero’s CVE dependency entirely: delete the CVE type import, Props interface, and cve destructure from `src/components/Hero.astro`. Render the stable category-led H1/subhead without any cve interpolation. Update `src/pages/index.astro` to render `<Hero />` instead of `<Hero cve={...} />`.
- Use direct, security-buyer copy grounded in the claim-to-proof checklist:
  - H1: “Your developers installed AI coding agents. Audr scans the local config risk they create.”
  - Subhead: “Find risky agent posture across secrets exposure, shell hooks, trusted workspaces, MCP servers, and CI agent paths. Offline single binary. Shareable HTML, SARIF, and JSON evidence.”
- Do not force hard `<br />` breaks through the long risk-list sentence. Keep the H1 to 2–3 short natural-wrap lines, and put the detailed surface list in the subhead.
- Keep the existing install CTA and sample report CTA.
- Add one short trust/safety line directly under the install CTA row: `Signed release. SHA-256 verified. No telemetry. Inspect install.sh before running.` Keep this as visible text near the command, not only hidden in `/security` or README.
- Add concise hello-world microcopy near the install command: `Then run audr scan — scans $HOME, opens an HTML report, and prints a forensic summary.` Do not add a second large code block unless design requires it.
- Keep the README and `/security` support links.
- Preserve current Tailwind style and responsive behavior.
- Keep “CISO-shaped, dev-deployable” only if it still reads naturally with the new subhead.

**Verification:**
- Build output contains the new H1 text.
- Build output no longer uses the hero H1 as a CVE-specific line.
- A visitor can answer in five seconds: what Audr scans, what risk it exposes, why it is safe to run, and what evidence they get.

### Task 2: Make the homepage metadata match the new category

**Objective:** Update the index page `description` so search/social snippets sell agent posture rather than a single CVE.

**Files:**
- Modify: `src/pages/index.astro`

**Implementation notes:**
- Remove `${hero.cve_id} detected on the first run.` from `description`.
- Use a stable description:
  “audr scans Claude Code, Cursor, Codex CLI, Windsurf, MCP servers, agent skills, and GitHub Actions for risky AI-agent configuration. Offline single binary. HTML, SARIF, and JSON reports.”
- Keep JSON-LD accurate.
- Remove `hero` naming. Use `const latestAdvisory = recentCVEs[0];` or equivalent for LiveTag, and render `<LiveTag cve={latestAdvisory} />`. Render `<Hero />` without props.

**Verification:**
- `dist/index.html` meta description contains agent-config posture language.

### Task 3: Reframe the above-hero freshness badge

**Objective:** Stop the first text on the page from being CVE-first while keeping the freshness signal.

**Files:**
- Modify: `src/components/LiveTag.astro`

**Implementation notes:**
- Reframe `live: CVE-... published Xd ago` into posture/freshness language, preferably:
  `fresh local posture checks · advisory proof: CVE-... · published Xd ago`
- Keep the CVE visible as evidence, but do not make “CVE” the first word after the badge label.
- Preserve existing date logic and severity color treatment unless that conflicts with the new sentence.
- Keep the existing age logic, but include the absolute published date in visible copy or a title/aria-label so the freshness claim remains understandable if the static build is not regenerated.

**Verification:**
- The first visible badge reads as coverage freshness, not a CVE feed headline.

### Task 4: Reframe CVE strip as freshness proof

**Objective:** Keep the latest five CVE cards, but make the section clearly subordinate to the product wedge.

**Files:**
- Modify: `src/components/CVEStrip.astro`

**Implementation notes:**
- Change kicker from `recent advisories · audr v0.3.1 detects every one` to something like:
  `fresh agent-security coverage · local evidence, not vuln-feed noise`
- Change H2 from `Five CVEs your engineering org probably hasn't checked yet.` to preferably:
  `Recent agent-security advisories Audr checks as local-config evidence.`
- Add one short paragraph under the H2 explaining:
  “CVEs are proof of freshness. The product is posture: what your agents can do, what they trust, and which secrets or endpoints they can reach.”
- Render the explanatory paragraph using the same section-header style as SampleReportTeaser: `font-sans text-base text-text-muted mt-2 max-w-narrow`.
- Add stable non-visual test hooks: `data-section="advisory-proof"` on the CVEStrip section and `data-cve-card` on each CVE article.
- Keep the five-card grid and latest-five behavior intact.
- Because the latest five are currently OpenClaw-heavy, avoid implying this strip is the full coverage matrix.

**Verification:**
- `dist/index.html` has exactly 5 CVE cards in the section.
- The section includes the phrase `local config` or equivalent.

### Task 5: Add the above-demo bridge sentence

**Objective:** Make the in-browser scan demo feel connected to the new positioning.

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/ScanDemo.tsx`

**Implementation notes:**
- Keep the current demo H2 “Same engine the binary ships. Compiled to WASM. Runs in your tab.”
- Change the demo kicker from `in-browser scan · no install · paste anything` to safer copy such as `in-browser scan · no install · runs locally in your tab`.
- Add one sentence under it:
  “Paste a redacted config and see the same agent-posture checks Audr runs locally.”
- Update only the visible demo safety copy in `ScanDemo.tsx`, not behavior: change `Paste your own config above or pick a sample tab.` to `Paste a redacted config or pick a sample tab.` Keep `Nothing is uploaded — the scanner runs entirely in this tab.`
- Do not modify ScanDemo behavior in this plan.

**Verification:**
- Demo still renders and tests pass.

### Task 6: Update tests that encoded the old CVE-led hero

**Objective:** Keep automated checks aligned with the new category-led positioning.

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Modify or replace: `tests/unit/h1-template.test.ts`
- Modify: `tests/unit/cves.test.ts`, only to rename old “hero CVE” wording to “latest advisory” or “freshness advisory” if Hero no longer consumes `cves[0]`.

**Implementation notes:**
- Replace the e2e H1 assertion that expects `CVE-` with assertions for the new category-led language.
- Rename the e2e test from “CVE strip shows the full CVE store” to “CVE strip shows latest five advisory proof cards” and assert count 5, not cveCount.
- Update the e2e count assertion to use `page.locator('[data-section="advisory-proof"] [data-cve-card]')` and expect count 5.
- Keep or add e2e assertions for: H1 contains “AI coding agents” / “local config risk” and does not contain `CVE-`; meta description contains “AI-agent configuration” and does not contain “detected on the first run”; LiveTag contains “fresh local posture checks” and does not start as “live: CVE-”; demo bridge sentence is visible; CVE proof card count is exactly 5.
- Keep or add an e2e assertion that the CVE strip still renders the latest five cards.
- Replace `h1-template.test.ts` with a test that checks the hero source no longer requires CVE interpolation, or rename it to a category-positioning test if that is cleaner.

**Verification:**
- `bun run test` passes.
- `bun run test:e2e` passes or the relevant homepage spec passes if running the full suite is too slow.

### Task 7: Verify and ship this slice

**Objective:** Prove the copy change is safe and the static site still builds.

**Commands:**
- `bun run test`
- `bun run build`
- `bun run test:e2e` if Playwright is available in the local environment; otherwise run the targeted homepage spec or document the blocker.
- Inspect `dist/index.html` for:
  - category-led hero copy
  - updated meta description
  - above-hero freshness badge is posture-first
  - latest-five CVE section still showing 5 cards

**Commit:**
- `git add src/components/Hero.astro src/components/LiveTag.astro src/components/CVEStrip.astro src/components/ScanDemo.tsx src/pages/index.astro tests/e2e/home.spec.ts tests/unit/h1-template.test.ts tests/unit/cves.test.ts .hermes/plans/2026-05-09-reposition-homepage-agent-posture.md`
- `git commit -m "feat: reposition homepage around agent posture"`

---

## Acceptance criteria

- Homepage hero no longer positions Audr primarily through one CVE.
- Homepage clearly says Audr scans AI agent configs for local capability risks.
- CVEs remain visible but are framed as freshness proof.
- Latest-five CVE limit remains unchanged.
- No new dependencies.
- No third-party JS or network calls.
- Tests and build pass.
