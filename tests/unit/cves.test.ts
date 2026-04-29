import { describe, expect, it } from "vitest";
import { daysSince, loadCVEs } from "../../src/lib/cves";

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

  it("hero CVE [0] is critical or high — not stale low-priority filler", () => {
    const [hero] = loadCVEs();
    expect(["critical", "high"]).toContain(hero.severity);
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
