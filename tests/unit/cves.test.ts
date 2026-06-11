import { describe, expect, it } from "vitest";
import { daysSince, latestCVEs, loadCVEs } from "../../src/lib/cves";

describe("loadCVEs", () => {
  it("returns at least 5 entries shaped like CVE", () => {
    const cves = loadCVEs();
    expect(cves.length).toBeGreaterThanOrEqual(5);
    for (const c of cves) {
      expect(c.cve_id).toMatch(/^CVE-\d{4}-\d{3,7}$/);
      expect(["critical", "high", "medium", "low"]).toContain(c.severity);
      expect(c.audr_rule_id).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(c.product).toBeTruthy();
      expect(c.visceral_consequence).toBeTruthy();
      expect(c.scope_phrase).toBeTruthy();
    }
  });

  it("keeps CVEs sorted by newest published date, then CVE ID descending", () => {
    const cves = loadCVEs();
    const sorted = [...cves].sort((a, b) => {
      const byDate = b.published_date.localeCompare(a.published_date);
      if (byDate !== 0) return byDate;
      return b.cve_id.localeCompare(a.cve_id);
    });
    expect(cves.map((c) => c.cve_id)).toEqual(sorted.map((c) => c.cve_id));
  });

  it("latest five include at least one critical or high advisory — not stale low-priority filler", () => {
    const latest = latestCVEs(loadCVEs(), 5);
    expect(latest.some((advisory) => ["critical", "high"].includes(advisory.severity))).toBe(true);
  });

  it("selects the latest 5 CVEs for the homepage strip", () => {
    const cves = loadCVEs();
    const latest = latestCVEs(cves, 5);

    expect(latest).toHaveLength(5);
    expect(latest.map((c) => c.cve_id)).toEqual(
      cves.slice(0, 5).map((c) => c.cve_id),
    );
  });
});

describe("daysSince", () => {
  it("returns 0 for today", () => {
    const now = new Date("2026-04-29T12:00:00Z");
    expect(daysSince("2026-04-29", now)).toBe(0);
  });

  it("returns positive integer for past dates", () => {
    const now = new Date("2026-04-29T12:00:00Z");
    expect(daysSince("2026-04-19", now)).toBe(10);
  });

  it("returns -1 for unparseable dates", () => {
    expect(daysSince("not-a-date")).toBe(-1);
  });
});
