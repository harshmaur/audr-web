import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WASM = "public/wasm/audr.wasm";
const WASM_EXEC = "public/wasm/wasm_exec.js";
const FIXTURE_MCP = "tests/fixtures/dirty-mcp.json";
const FIXTURE_CLAUDE = "tests/fixtures/dirty-claude-settings.json";
const FIXTURE_CURSOR = "tests/fixtures/dirty-cursor-permissions.json";
const FIXTURE_CODEX = "tests/fixtures/dirty-codex-config.toml";

const wasmReady = existsSync(WASM) && existsSync(WASM_EXEC);

// These tests require the WASM blob to have been built via `npm run build:wasm`.
// Skip locally if it's missing — the CI workflow always builds before testing.
describe.skipIf(!wasmReady)("WASM scan() integration (real blob, real fixtures)", () => {
  let scan: (text: string, hint: string) => string;

  beforeAll(async () => {
    // The wasm_exec.js shim mutates globalThis. Run it once, in this process.
    await import(`${process.cwd()}/${WASM_EXEC}`);
    const Go = (globalThis as unknown as { Go: new () => unknown }).Go;
    if (!Go) throw new Error("Go shim did not register on globalThis");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const go = new (Go as any)();
    const bytes = readFileSync(WASM);
    const { instance } = await WebAssembly.instantiate(bytes, go.importObject);
    void go.run(instance);
    for (let i = 0; i < 40; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (globalThis as any).audrScan === "function") break;
      await new Promise((r) => setTimeout(r, 25));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scan = (globalThis as any).audrScan;
    expect(typeof scan).toBe("function");
  });

  it("returns the full WASM API contract for a dirty MCP config", () => {
    const raw = scan(readFileSync(FIXTURE_MCP, "utf8"), "mcp");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("mcp-config");
    expect(result.audr_sha).toMatch(/^[0-9a-f]{40}$/);
    expect(result.audr_tag).toMatch(/^v\d+\.\d+\.\d+/);
    expect(typeof result.scan_ms).toBe("number");
    expect(result.findings.length).toBeGreaterThanOrEqual(3);
    for (const f of result.findings) {
      expect(typeof f.rule_id).toBe("string");
      expect(["critical", "high", "medium", "low"]).toContain(f.severity);
      expect(typeof f.title).toBe("string");
      expect(typeof f.attacker_gets).toBe("string");
      expect(Array.isArray(f.cve_refs)).toBe(true);
    }
  });

  it("flags the Claude hooks RCE on a dirty Claude settings file", () => {
    const raw = scan(readFileSync(FIXTURE_CLAUDE, "utf8"), "claude");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("claude-settings");
    const hookFinding = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "claude-hook-shell-rce",
    );
    expect(hookFinding).toBeTruthy();
    expect(hookFinding.cve_refs).toContain("CVE-2025-59536");
  });

  it("flags wildcard allowlists on a dirty Cursor permissions file", () => {
    const raw = scan(readFileSync(FIXTURE_CURSOR, "utf8"), "cursor");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("cursor-permissions");
    expect(result.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("flags approval-disabled on a dirty Codex config", () => {
    const raw = scan(readFileSync(FIXTURE_CODEX, "utf8"), "codex");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("codex-config");
    const approval = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "codex-approval-disabled",
    );
    expect(approval).toBeTruthy();
  });

  it("returns zero findings on clean input without crashing", () => {
    const raw = scan('{"mcpServers": {}}', "mcp");
    const result = JSON.parse(raw);
    expect(result.findings).toEqual([]);
    expect(result.format_detected).toBe("mcp-config");
  });
});
