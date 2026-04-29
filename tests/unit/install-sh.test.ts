import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const installSh = readFileSync("public/install.sh", "utf8");

describe("public/install.sh wrapper", () => {
  it("references the canonical audr installer", () => {
    expect(installSh).toMatch(/raw\.githubusercontent\.com\/harshmaur\/audr\/main\/install\.sh/);
  });

  it("sets AUDR_INSTALL_FROM=audr.dev by default", () => {
    expect(installSh).toMatch(/AUDR_INSTALL_FROM="audr\.dev"/);
    expect(installSh).toMatch(/export\s+AUDR_INSTALL_FROM/);
  });

  it("respects AUDR_NO_REFERRER=1 opt-out", () => {
    expect(installSh).toMatch(/AUDR_NO_REFERRER:?-?[^=]*"\s*\]\s*;\s*then|AUDR_NO_REFERRER:-/);
    expect(installSh).toMatch(/AUDR_NO_REFERRER/);
    // Must guard the export inside an if-then block, not unconditionally set.
    const lines = installSh.split("\n");
    const idxIf = lines.findIndex((l) => l.includes("AUDR_NO_REFERRER"));
    const idxExport = lines.findIndex((l) => /export\s+AUDR_INSTALL_FROM/.test(l));
    expect(idxIf).toBeGreaterThanOrEqual(0);
    expect(idxExport).toBeGreaterThan(idxIf);
  });

  it("starts with #!/usr/bin/env sh and uses set -eu", () => {
    expect(installSh.startsWith("#!/usr/bin/env sh")).toBe(true);
    expect(installSh).toMatch(/^set -eu$/m);
  });
});
