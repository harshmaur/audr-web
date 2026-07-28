import { describe, expect, it } from "vitest";
import cvesJson from "../../src/data/cves.json";
import {
  coverageStats,
  latestCoverageEntries,
  loadCoverageSnapshot,
  publicCoverageEntries,
  selectedTriageEntries,
  shippedCoverageEntries,
  validateCoverageSnapshot,
  type CoverageSnapshot,
} from "../../src/lib/coverage";

const baseSnapshot: CoverageSnapshot = {
  generated_at: "2026-05-12T00:00:00Z",
  source_last_discovery_at: "2026-05-12",
  source_entry_count: 3,
  public_entry_count: 3,
  selected_triage_limit: 12,
  excluded_public_safe_candidate_count: 0,
  excluded_status_counts: {},
  entries: [
    {
      cve_id: "CVE-2026-0002",
      status: "actionable",
      severity: "high",
      vendor: "Example",
      product: "Example Agent",
      published_date: "2026-05-10",
      last_seen_at: "2026-05-12",
      keywords: ["agent"],
      local_signal_category: "dependency manifest",
      nvd_url: "https://nvd.nist.gov/vuln/detail/CVE-2026-0002",
      summary_short: "Example candidate local signal.",
    },
    {
      cve_id: "CVE-2026-0001",
      status: "shipped",
      severity: "critical",
      vendor: "Example",
      product: "Example Agent",
      published_date: "2026-05-11",
      last_seen_at: "2026-05-12",
      keywords: ["agent"],
      local_signal_category: "MCP server config",
      nvd_url: "https://nvd.nist.gov/vuln/detail/CVE-2026-0001",
      summary_short: "Example shipped local check.",
      audr_rule_id: "example-local-check",
    },
    {
      cve_id: "CVE-2026-0003",
      status: "investigating",
      severity: "medium",
      vendor: "Other",
      product: "Other Agent",
      published_date: "2026-05-09",
      last_seen_at: "2026-05-11",
      keywords: ["agent"],
      local_signal_category: "agent config",
      nvd_url: "https://nvd.nist.gov/vuln/detail/CVE-2026-0003",
      summary_short: "Example row under investigation.",
    },
  ],
};

describe("coverage ledger", () => {
  it("loads the committed public snapshot", () => {
    const snapshot = loadCoverageSnapshot();
    expect(snapshot.entries.length).toBeGreaterThanOrEqual(cvesJson.length);
    expect(shippedCoverageEntries(snapshot).length).toBeGreaterThanOrEqual(cvesJson.length);
    expect(selectedTriageEntries(snapshot).length).toBeLessThanOrEqual(snapshot.selected_triage_limit);
  });

  it("keeps every cves.json entry represented as a shipped local check", () => {
    const shippedIds = new Set(shippedCoverageEntries(loadCoverageSnapshot()).map((entry) => entry.cve_id));
    for (const cve of cvesJson) {
      expect(shippedIds.has(cve.cve_id)).toBe(true);
    }
  });

  it("sorts public entries with shipped rows first, then newest published date", () => {
    const entries = publicCoverageEntries(validateCoverageSnapshot(baseSnapshot));
    expect(entries.map((entry) => entry.cve_id)).toEqual([
      "CVE-2026-0001",
      "CVE-2026-0002",
      "CVE-2026-0003",
    ]);
  });

  it("sorts same-status same-date entries by CVE ID descending", () => {
    const snapshot = structuredClone(baseSnapshot);
    snapshot.entries[0].status = "shipped";
    snapshot.entries[0].published_date = "2026-05-11";
    snapshot.entries[0].audr_rule_id = "example-second-local-check";
    const entries = publicCoverageEntries(validateCoverageSnapshot(snapshot));
    expect(entries.slice(0, 2).map((entry) => entry.cve_id)).toEqual([
      "CVE-2026-0002",
      "CVE-2026-0001",
    ]);
  });

  it("computes buyer-safe coverage stats", () => {
    const stats = coverageStats(validateCoverageSnapshot(baseSnapshot));
    expect(stats).toEqual({
      shippedLocalCheckCount: 1,
      latestAdvisoryReviewed: "2026-05-12",
      agentProductsRepresented: 2,
      publicSnapshotUpdated: "2026-05-12",
    });
  });

  it("selects latest entries by reviewed date", () => {
    const entries = latestCoverageEntries(validateCoverageSnapshot(baseSnapshot).entries, 2);
    expect(entries.map((entry) => entry.cve_id)).toEqual(["CVE-2026-0001", "CVE-2026-0002"]);
  });

  it("rejects internal automation fields and strings", () => {
    const bad = structuredClone(baseSnapshot);
    bad.entries[0] = { ...bad.entries[0], next_action: "manual follow-up" } as never;
    expect(() => validateCoverageSnapshot(bad)).toThrow(/forbidden field next_action/);

    const leakedString = structuredClone(baseSnapshot);
    leakedString.entries[0].summary_short = "blocked_pending_origin_issue";
    expect(() => validateCoverageSnapshot(leakedString)).toThrow(/forbidden internal string blocked_/);
  });

  it("requires shipped rows to have rule IDs and candidate rows not to", () => {
    const missingRule = structuredClone(baseSnapshot);
    delete missingRule.entries[1].audr_rule_id;
    expect(() => validateCoverageSnapshot(missingRule)).toThrow(/audr_rule_id/);

    const candidateRule = structuredClone(baseSnapshot);
    candidateRule.entries[0] = { ...candidateRule.entries[0], audr_rule_id: "should-not-render" };
    expect(() => validateCoverageSnapshot(candidateRule)).toThrow(/only allowed on shipped/);
  });

  it("rejects duplicate CVE IDs and unknown statuses", () => {
    const duplicate = structuredClone(baseSnapshot);
    duplicate.entries[1].cve_id = duplicate.entries[0].cve_id;
    expect(() => validateCoverageSnapshot(duplicate)).toThrow(/duplicates/);

    const badStatus = structuredClone(baseSnapshot);
    badStatus.entries[0] = { ...badStatus.entries[0], status: "irrelevant" } as never;
    expect(() => validateCoverageSnapshot(badStatus)).toThrow(/status is invalid/);
  });
});
