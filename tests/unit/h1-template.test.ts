import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const heroSource = readFileSync("src/components/Hero.astro", "utf8");

describe("homepage category positioning", () => {
  it("uses a stable agent-posture H1 instead of a CVE-fed template", () => {
    expect(heroSource).toContain("Your developers installed AI coding agents");
    expect(heroSource).toContain("Audr scans the local config risk they create");
    expect(heroSource).not.toContain("{cve.");
    expect(heroSource).not.toContain("import type { CVE }");
  });

  it("keeps first-screen trust and hello-world copy near the install CTA", () => {
    expect(heroSource).toContain("Signed release. SHA-256 verified. No telemetry.");
    expect(heroSource).toContain("Then run <code>audr scan</code>");
  });
});
