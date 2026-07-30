import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AUDR_VERSION_TAG } from "../../src/lib/audr-version";

const WASM = "public/wasm/audr.wasm";
const WASM_EXEC = "public/wasm/wasm_exec.js";
const FIXTURE_MCP = "tests/fixtures/dirty-mcp.json";
const FIXTURE_CLAUDE = "tests/fixtures/dirty-claude-settings.json";
const FIXTURE_CURSOR = "tests/fixtures/dirty-cursor-permissions.json";
const FIXTURE_CURSOR_APP = "tests/fixtures/dirty-cursor-app-package.json";
const FIXTURE_CODEX = "tests/fixtures/dirty-codex-config.toml";
const FIXTURE_KIOTA = "tests/fixtures/dirty-kiota-openapi.yaml";
const FIXTURE_LANGFLOW = "tests/fixtures/dirty-langflow-requirements.txt";
const FIXTURE_MRMUSTARD = "tests/fixtures/dirty-mrmustard-init.py";
const FIXTURE_CFGZEN = "tests/fixtures/dirty-cfgzen-native.bin";
const FIXTURE_AMAZON_INSPECTOR = "tests/fixtures/amazon-inspector-npm-malware.js";
const FIXTURE_AMAZON_INSPECTOR_STREAK =
  "tests/fixtures/amazon-inspector-streak-core-math.js";
const FIXTURE_AMAZON_INSPECTOR_AGENTCLI =
  "tests/fixtures/amazon-inspector-agentcli.js";
const FIXTURE_SIYUAN = "tests/fixtures/dirty-siyuan-conf.json";
const FIXTURE_OPENCLAW_62199 = "tests/fixtures/dirty-openclaw-cve-2026-62199-package.json";

const wasmReady = existsSync(WASM) && existsSync(WASM_EXEC);

// These tests require the WASM blob to have been built via `bun run build:wasm`.
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

  it("flags CVE-2026-50548 from a vulnerable Cursor app manifest", () => {
    const raw = scan(readFileSync(FIXTURE_CURSOR_APP, "utf8"), "cursor-app");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("package-json");
    const sandboxEscape = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "cursor-agent-sandbox-working-directory-escape",
    );
    expect(sandboxEscape).toBeTruthy();
    expect(sandboxEscape.cve_refs).toContain("CVE-2026-50548");
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

  it("flags Kiota plugin template traversal in an OpenAPI description", () => {
    const raw = scan(readFileSync(FIXTURE_KIOTA, "utf8"), "openapi");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("kiota-openapi-spec");
    const traversal = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "kiota-plugin-static-template-traversal",
    );
    expect(traversal).toBeTruthy();
    expect(traversal.cve_refs).toContain("CVE-2026-59864");
  });

  it("flags Langflow ToolGuard code injection from a PyPI requirements manifest", () => {
    const raw = scan(readFileSync(FIXTURE_LANGFLOW, "utf8"), "requirements");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("dependency-manifest");
    const langflow = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "langflow-toolguard-code-injection",
    );
    expect(langflow).toBeTruthy();
    expect(langflow.cve_refs).toContain("CVE-2026-9135");
  });

  it("flags the non-CVE MrMustard package-root credential-stealer markers", () => {
    const raw = scan(readFileSync(FIXTURE_MRMUSTARD, "utf8"), "mrmustard-pypi");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe(["pypi", "malware", "artifact"].join("-"));
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "mrmustard-credential-stealer-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the non-CVE cfgzen package-root infostealer markers", () => {
    const raw = scan(readFileSync(FIXTURE_CFGZEN, "utf8"), "cfgzen-pypi");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe(["pypi", "malware", "artifact"].join("-"));
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "cfgzen-pth-infostealer-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the non-CVE Amazon Inspector npm malware markers", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR, "utf8"),
      "amazon-inspector-npm-malware",
    );
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector streak Startup persistence follow-up", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_STREAK, "utf8"),
      "amazon-inspector-streak-core-math",
    );
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector agentcli Lark credential-stealer follow-up", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_AGENTCLI, "utf8"),
      "amazon-inspector-agentcli",
    );
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags CVE-2026-66012 from anonymous SiYuan Publish configuration", () => {
    const raw = scan(readFileSync(FIXTURE_SIYUAN, "utf8"), "siyuan");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("siyuan-config");
    const bypass = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "siyuan-anonymous-publish-mcp-admin-bypass",
    );
    expect(bypass).toBeTruthy();
    expect(bypass.severity).toBe("critical");
    expect(bypass.cve_refs).toContain("CVE-2026-66012");
  });

  it("flags CVE-2026-62199 from a vulnerable OpenClaw package manifest", () => {
    const raw = scan(readFileSync(FIXTURE_OPENCLAW_62199, "utf8"), "package-json");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("package-json");
    const bypass = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "openclaw-interpreter-startup-env-filtering",
    );
    expect(bypass).toBeTruthy();
    expect(bypass.severity).toBe("high");
    expect(bypass.cve_refs).toContain("CVE-2026-62199");
  });

  it("returns zero findings on clean input without crashing", () => {
    const raw = scan('{"mcpServers": {}}', "mcp");
    const result = JSON.parse(raw);
    expect(result.findings).toEqual([]);
    expect(result.format_detected).toBe("mcp-config");
  });
});
