import { describe, expect, it } from "vitest";
import { loadCVEs } from "../../src/lib/cves";

// The Hero.astro component templates the H1 from cves.json[0]. This is a
// content-shape test that validates the *data* is in the form the template
// expects, so a malformed cves.json[0] is caught at unit test time rather
// than producing a silently-broken H1 in dist/.
describe("H1 template inputs", () => {
  it("hero CVE has every field the H1 template references", () => {
    const [hero] = loadCVEs();
    expect(hero.product).toMatch(/\S/);
    expect(hero.cve_id).toMatch(/^CVE-/);
    expect(hero.visceral_consequence).toMatch(/\S/);
    expect(hero.scope_phrase).toMatch(/\S/);
  });

  it("H1 must not contain a temporal phrase that decays in days", () => {
    const [hero] = loadCVEs();
    const decayPhrases = [
      /last\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week)/i,
      /\bthis\s+week\b/i,
      /\byesterday\b/i,
      /\btoday\b/i,
    ];
    for (const p of decayPhrases) {
      expect(hero.product, "product").not.toMatch(p);
      expect(hero.visceral_consequence, "visceral_consequence").not.toMatch(p);
      expect(hero.scope_phrase, "scope_phrase").not.toMatch(p);
    }
  });
});
