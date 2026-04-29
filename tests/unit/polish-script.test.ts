import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const POLISHED = "public/sample-report.html";

describe("polish-sample-report.mjs output", () => {
  it("runs without error", () => {
    execSync("node scripts/polish-sample-report.mjs", { stdio: "inherit" });
    expect(existsSync(POLISHED)).toBe(true);
  });

  it("strips every disallowed path leak", () => {
    const html = readFileSync(POLISHED, "utf8");
    expect(html).not.toMatch(/\/home\//);
    expect(html).not.toMatch(/\/Users\//);
    expect(html).not.toMatch(/\/parallels\//);
    expect(html).not.toMatch(/testdata\//);
    expect(html).not.toMatch(/\bfixture\b/i);
    expect(html).not.toMatch(/laptops\/dirty/);
  });

  it("retains the report's load-bearing structure", () => {
    const html = readFileSync(POLISHED, "utf8");
    expect(html).toMatch(/<html[^>]*lang="en"/);
    expect(html).toMatch(/class="verdict-lead"/);
    expect(html).toMatch(/class="metrics"/);
    expect(html).toMatch(/<details class="path-group"/);
  });

  it("contains the redacted-excerpt note linking to the canonical install command", () => {
    const html = readFileSync(POLISHED, "utf8");
    expect(html).toMatch(/redacted excerpt/i);
    expect(html).toMatch(/curl -fsSL https:\/\/audr\.dev\/install\.sh/);
  });
});
