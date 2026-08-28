import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AUDR_VERSION_TAG } from "../../src/lib/audr-version";

const WASM = "public/wasm/audr.wasm";
const WASM_EXEC = "public/wasm/wasm_exec.js";
const FIXTURE_MCP = "tests/fixtures/dirty-mcp.json";
const FIXTURE_MCP_MEMORY_SERVICE =
  "tests/fixtures/dirty-mcp-memory-service-cve-2026-50027.json";
const FIXTURE_CLAUDE = "tests/fixtures/dirty-claude-settings.json";
const FIXTURE_CURSOR = "tests/fixtures/dirty-cursor-permissions.json";
const FIXTURE_CURSOR_APP = "tests/fixtures/dirty-cursor-app-package.json";
const FIXTURE_CODEX = "tests/fixtures/dirty-codex-config.toml";
const FIXTURE_KIOTA = "tests/fixtures/dirty-kiota-openapi.yaml";
const FIXTURE_LANGFLOW = "tests/fixtures/dirty-langflow-requirements.txt";
const FIXTURE_MRMUSTARD = "tests/fixtures/dirty-mrmustard-init.py";
const FIXTURE_CFGZEN = "tests/fixtures/dirty-cfgzen-native.bin";
const FIXTURE_MLFLOW_OTEL = "tests/fixtures/mlflow-otel-systemd-helper-setup.py";
const FIXTURE_MULTYPROCCESS = "tests/fixtures/multyproccess-hidden-payload-setup.py";
const FIXTURE_SCRAMBLEEER = "tests/fixtures/scrambleeer-reverse-shell.py";
const FIXTURE_SCRAMBLEEEER = "tests/fixtures/scrambleeeer-reverse-shell.py";
const FIXTURE_AMAZON_INSPECTOR = "tests/fixtures/amazon-inspector-npm-malware.js";
const FIXTURE_AMAZON_INSPECTOR_STREAK =
  "tests/fixtures/amazon-inspector-streak-core-math.js";
const FIXTURE_AMAZON_INSPECTOR_STREAK_DAILY =
  "tests/fixtures/amazon-inspector-streak-daily-lib.js";
const FIXTURE_AMAZON_INSPECTOR_STREAK_CORE =
  "tests/fixtures/amazon-inspector-streak-core-lib.js";
const FIXTURE_AMAZON_INSPECTOR_STREAK_DAY =
  "tests/fixtures/amazon-inspector-streak-day-utils.js";
const FIXTURE_AMAZON_INSPECTOR_AGENTCLI =
  "tests/fixtures/amazon-inspector-agentcli.js";
const FIXTURE_AMAZON_INSPECTOR_APP_SODA =
  "tests/fixtures/amazon-inspector-app-soda-layer.js";
const FIXTURE_AMAZON_INSPECTOR_SIGCHAIN =
  "tests/fixtures/amazon-inspector-sigchain-js.js";
const FIXTURE_AMAZON_INSPECTOR_CHAIN_ANALYZE =
  "tests/fixtures/amazon-inspector-chain-analyze.js";
const FIXTURE_AMAZON_INSPECTOR_CLAUDE_REMOTE_AGENT =
  "tests/fixtures/amazon-inspector-claude-remote-agent.js";
const FIXTURE_AMAZON_INSPECTOR_LLM_INTERCEPTOR =
  "tests/fixtures/amazon-inspector-llm-interceptor.json";
const FIXTURE_AMAZON_INSPECTOR_MAP_STREAK =
  "tests/fixtures/amazon-inspector-map-streak-kit.js";
const FIXTURE_AMAZON_INSPECTOR_KIT_VIM_MAP =
  "tests/fixtures/amazon-inspector-kit-vim-map.bin";
const FIXTURE_AMAZON_INSPECTOR_KIT_MAP_VIM =
  "tests/fixtures/amazon-inspector-kit-map-vim.js";
const FIXTURE_AMAZON_INSPECTOR_W_SCREENCTL =
  "tests/fixtures/amazon-inspector-w-screenctl.js";
const FIXTURE_AMAZON_INSPECTOR_ACLADE_AGENT =
  "tests/fixtures/amazon-inspector-aclade-agent.js";
const FIXTURE_AMAZON_INSPECTOR_AGENTHUB_AI =
  "tests/fixtures/amazon-inspector-agenthub-ai.js";
const FIXTURE_AMAZON_INSPECTOR_UIBABAI =
  "tests/fixtures/amazon-inspector-uibabai.js";
const FIXTURE_AMAZON_INSPECTOR_SIMPLE_DATE =
  "tests/fixtures/amazon-inspector-simple-date-formatter.json";
const FIXTURE_AMAZON_INSPECTOR_CRYPTOSTOCK =
  "tests/fixtures/amazon-inspector-cryptostock.js";
const FIXTURE_AMAZON_INSPECTOR_NOTAFOLLOWER =
  "tests/fixtures/amazon-inspector-notafollower.json";
const FIXTURE_AMAZON_INSPECTOR_DEPCRUISE =
  "tests/fixtures/amazon-inspector-depcruise.json";
const FIXTURE_AMAZON_INSPECTOR_PFP_FORMS =
  "tests/fixtures/amazon-inspector-pfp-forms-loader.js";
const FIXTURE_AMAZON_INSPECTOR_CHECKOUT_DESKTOP =
  "tests/fixtures/amazon-inspector-checkout-desktop-loader.js";
const FIXTURE_AMAZON_INSPECTOR_GUANGNAO_AGENT_PROXY =
  "tests/fixtures/amazon-inspector-guangnao-agent-proxy.js";
const FIXTURE_AMAZON_INSPECTOR_CORE_TAILWIND =
  "tests/fixtures/amazon-inspector-core-tailwindcss-utility.js";
const FIXTURE_AMAZON_INSPECTOR_BCC_DESIGN =
  "tests/fixtures/amazon-inspector-bcc-design-beacon.js";
const FIXTURE_AMAZON_INSPECTOR_SETUP_CODEX =
  "tests/fixtures/amazon-inspector-setup-codex.js";
const FIXTURE_AMAZON_INSPECTOR_EXPECT_DOTENV =
  "tests/fixtures/amazon-inspector-expect-dotenv.js";
const FIXTURE_AMAZON_INSPECTOR_HTTTTT_MCP_DEMO =
  "tests/fixtures/amazon-inspector-httttt-mcp-demo.js";
const FIXTURE_AMAZON_INSPECTOR_MCP_DEV_TOOLKIT =
  "tests/fixtures/amazon-inspector-mcp-dev-toolkit.js";
const FIXTURE_AMAZON_INSPECTOR_EXPRESS_SESSION_HANDLER =
  "tests/fixtures/amazon-inspector-express-session-handler.js";
const FIXTURE_AMAZON_INSPECTOR_CHAI_AS_OTC =
  "tests/fixtures/amazon-inspector-chai-as-otc.js";
const FIXTURE_AMAZON_INSPECTOR_CHAI_AS_ORG =
  "tests/fixtures/amazon-inspector-chai-as-org.js";
const FIXTURE_AMAZON_INSPECTOR_SPOTIFY_URL_INFOS =
  "tests/fixtures/amazon-inspector-spotify-url-infos.js";
const FIXTURE_AMAZON_INSPECTOR_SPOTIFY_URL_RESOLVERS =
  "tests/fixtures/amazon-inspector-spotify-url-resolvers.js";
const FIXTURE_AMAZON_INSPECTOR_OCTOPUS_ACTION =
  "tests/fixtures/amazon-inspector-octopus-action.js";
const FIXTURE_AMAZON_INSPECTOR_MT_SERVERLESS =
  "tests/fixtures/amazon-inspector-mt-ts-serverless-starter.js";
const FIXTURE_AMAZON_INSPECTOR_GFE_LX_WATCHER =
  "tests/fixtures/amazon-inspector-gfe-lx-watcher.js";
const FIXTURE_AMAZON_INSPECTOR_FUEL_REACT =
  "tests/fixtures/amazon-inspector-fuel-react.js";
const FIXTURE_AMAZON_INSPECTOR_LUMEN_PAGES =
  "tests/fixtures/amazon-inspector-lumen-pages-community.js";
const FIXTURE_TELEKOM_ODS_REACT_UI_KIT =
  "tests/fixtures/telekom-ods-react-ui-kit-malware.json";
const FIXTURE_SIYUAN = "tests/fixtures/dirty-siyuan-conf.json";
const FIXTURE_OPENCLAW_62199 = "tests/fixtures/dirty-openclaw-cve-2026-62199-package.json";
const FIXTURE_OPENCLAW_DASHBOARD =
  "tests/fixtures/dirty-openclaw-dashboard-notifications.html";

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

  it("flags CVE-2026-50027 from an mcp-memory-service HTTP REST configuration", () => {
    const raw = scan(readFileSync(FIXTURE_MCP_MEMORY_SERVICE, "utf8"), "mcp");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("mcp-config");
    const documentAPI = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "mcp-memory-service-document-api-unauth",
    );
    expect(documentAPI).toBeTruthy();
    expect(documentAPI.cve_refs).toContain("CVE-2026-50027");
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

  it("flags the non-CVE mlflow-otel systemd-helper dropper markers", () => {
    const raw = scan(readFileSync(FIXTURE_MLFLOW_OTEL, "utf8"), "mlflow-otel-pypi");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe(["pypi", "malware", "artifact"].join("-"));
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "mlflow-otel-systemd-helper-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
    expect(campaign.excerpt).not.toContain("freestorage-04.bond");

    const guessed = JSON.parse(scan(readFileSync(FIXTURE_MLFLOW_OTEL, "utf8"), ""));
    expect(guessed.findings.some(
      (f: { rule_id: string }) => f.rule_id === "mlflow-otel-systemd-helper-ioc",
    )).toBe(true);
  });

  it("flags the non-CVE multyproccess installer and payload-launch markers", () => {
    const fixture = readFileSync(FIXTURE_MULTYPROCCESS, "utf8");
    const raw = scan(fixture, "multyproccess-pypi");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe(["pypi", "malware", "artifact"].join("-"));
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "multyproccess-hidden-payload-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
    expect(campaign.excerpt).not.toContain("request/.payload");

    const guessed = JSON.parse(scan(fixture, ""));
    expect(
      guessed.findings.some(
        (f: { rule_id: string }) => f.rule_id === "multyproccess-hidden-payload-ioc",
      ),
    ).toBe(true);
  });

  it("flags the non-CVE scrambleeer package-root reverse-shell markers", () => {
    const raw = scan(readFileSync(FIXTURE_SCRAMBLEEER, "utf8"), "scrambleeer-pypi");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe(["pypi", "malware", "artifact"].join("-"));
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "scrambleeer-reverse-shell-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
    expect(campaign.excerpt).not.toContain("bax.h4x.tv");
  });

  it("flags the same-campaign scrambleeeer core.py reverse-shell markers", () => {
    const raw = scan(readFileSync(FIXTURE_SCRAMBLEEEER, "utf8"), "scrambleeeer-pypi");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe(["pypi", "malware", "artifact"].join("-"));
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "scrambleeer-reverse-shell-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
    expect(campaign.excerpt).not.toContain("bax.h4x.tv");
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

  it.each([
    [
      "streak-daily-lib WSL Startup persistence",
      FIXTURE_AMAZON_INSPECTOR_STREAK_DAILY,
      "amazon-inspector-streak-daily-lib",
    ],
    [
      "streak-core-lib embedded PE Startup persistence",
      FIXTURE_AMAZON_INSPECTOR_STREAK_CORE,
      "amazon-inspector-streak-core-lib",
    ],
    [
      "streak-day-utils WSL Startup persistence",
      FIXTURE_AMAZON_INSPECTOR_STREAK_DAY,
      "amazon-inspector-streak-day-utils",
    ],
  ])("flags the Amazon Inspector %s follow-up", (_label, fixture, hint) => {
    const result = JSON.parse(scan(readFileSync(fixture, "utf8"), hint));
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

  it("flags the Amazon Inspector app-soda-layer SSH-persistence follow-up", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_APP_SODA, "utf8"),
      "amazon-inspector-app-soda-layer",
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

  it("flags the Amazon Inspector sigchain-js detached payload loader", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_SIGCHAIN, "utf8"),
      "amazon-inspector-sigchain-js",
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

  it("flags the Amazon Inspector chain-analyze detached payload loader", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_CHAIN_ANALYZE, "utf8"),
      "amazon-inspector-chain-analyze",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector claude-remote-agent remote-control IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_CLAUDE_REMOTE_AGENT, "utf8"),
      "amazon-inspector-claude-remote-agent",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector llm-interceptor transcript-exfiltration IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_LLM_INTERCEPTOR, "utf8"),
      "amazon-inspector-llm-interceptor",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.excerpt).not.toContain("friend-token");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector map-streak-kit RedShell launcher IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_MAP_STREAK, "utf8"),
      "amazon-inspector-map-streak-kit",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector kit-vim-map RedShell implant IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_KIT_VIM_MAP, "utf8"),
      "amazon-inspector-kit-vim-map",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector kit-map-vim RedShell launcher IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_KIT_MAP_VIM, "utf8"),
      "amazon-inspector-kit-map-vim",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Telekom ODS React UI Kit system-file exfiltration IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_TELEKOM_ODS_REACT_UI_KIT, "utf8"),
      "telekom-ods-react-ui-kit",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) =>
        f.rule_id === "telekom-ods-react-ui-kit-system-file-exfil",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("package-json");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector w-screenctl remote-desktop IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_W_SCREENCTL, "utf8"),
      "amazon-inspector-w-screenctl",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector aclade-agent remote-control IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_ACLADE_AGENT, "utf8"),
      "amazon-inspector-aclade-agent",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector agenthub-ai remote-control IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_AGENTHUB_AI, "utf8"),
      "amazon-inspector-agenthub-ai",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector agent-proxy authenticated-session relay IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_GUANGNAO_AGENT_PROXY, "utf8"),
      "amazon-inspector-guangnao-agent-proxy",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.excerpt).not.toContain("gnP2p!7xQ");
    expect(campaign.cve_refs).toEqual([]);
  });

  it.each([
    [
      "core-tailwindcss-utility remote JavaScript loader",
      FIXTURE_AMAZON_INSPECTOR_CORE_TAILWIND,
      "amazon-inspector-core-tailwindcss-utility",
      "31.97.137.157",
    ],
    [
      "bcc-design installer beacon",
      FIXTURE_AMAZON_INSPECTOR_BCC_DESIGN,
      "amazon-inspector-bcc-design",
      "91.201.215.48",
    ],
    [
      "bcc-design-icons installer beacon",
      FIXTURE_AMAZON_INSPECTOR_BCC_DESIGN,
      "amazon-inspector-bcc-design-icons",
      "91.201.215.48",
    ],
    [
      "setup-codex host and file exfiltration",
      FIXTURE_AMAZON_INSPECTOR_SETUP_CODEX,
      "amazon-inspector-setup-codex",
      "hooks.zapier.com",
    ],
    [
      "expect-dotenv remote parser execution",
      FIXTURE_AMAZON_INSPECTOR_EXPECT_DOTENV,
      "amazon-inspector-expect-dotenv",
      "arrayParser",
    ],
    [
      "@httttt/mcp-demo javaagent execution",
      FIXTURE_AMAZON_INSPECTOR_HTTTTT_MCP_DEMO,
      "amazon-inspector-httttt-mcp-demo",
      "myhuaweicloud.com",
    ],
    [
      "mcp-dev-toolkit Git propagation",
      FIXTURE_AMAZON_INSPECTOR_MCP_DEV_TOOLKIT,
      "amazon-inspector-mcp-dev-toolkit",
      "git push",
    ],
    [
      "express-session-handler mutable remote code loader",
      FIXTURE_AMAZON_INSPECTOR_EXPRESS_SESSION_HANDLER,
      "amazon-inspector-express-session-handler",
      "api.jsonbin.io",
    ],
    [
      "chai-as-otc environment theft and remote execution",
      FIXTURE_AMAZON_INSPECTOR_CHAI_AS_OTC,
      "amazon-inspector-chai-as-otc",
      "aHR0cHM6Ly9pcGNoZWNrLWhhc2hlZC52ZXJjZWwuYXBw",
    ],
    [
      "chai-as-org environment theft and remote execution",
      FIXTURE_AMAZON_INSPECTOR_CHAI_AS_ORG,
      "amazon-inspector-chai-as-org",
      "aHR0cHM6Ly9pcGNoZWNrLWhhc2hlZC52ZXJjZWwuYXBw",
    ],
    [
      "spotify-url-infos whole-workspace Telegram archival",
      FIXTURE_AMAZON_INSPECTOR_SPOTIFY_URL_INFOS,
      "amazon-inspector-spotify-url-infos",
      "sendDocument",
    ],
    [
      "spotify-url-resolvers whole-workspace Telegram archival",
      FIXTURE_AMAZON_INSPECTOR_SPOTIFY_URL_RESOLVERS,
      "amazon-inspector-spotify-url-resolvers",
      "sendDocument",
    ],
    [
      "octopus-action install-time host and system-file exfiltration",
      FIXTURE_AMAZON_INSPECTOR_OCTOPUS_ACTION,
      "amazon-inspector-octopus-action",
      "dfwvktnc563cparn1p88c8051w7ovej3.oastify.com",
    ],
    [
      "mt-ts-serverless-starter install-time host and system-file exfiltration",
      FIXTURE_AMAZON_INSPECTOR_MT_SERVERLESS,
      "amazon-inspector-mt-ts-serverless-starter",
      "e4jw9ucdu7sdebgoqqx919p6qxwoke83.oastify.com",
    ],
    [
      "@gfe/lx-watcher installer identity exfiltration",
      FIXTURE_AMAZON_INSPECTOR_GFE_LX_WATCHER,
      "amazon-inspector-gfe-lx-watcher",
      "df384ffa-1094-4bbf-a202-e8b345b3ed18",
    ],
    [
      "fuel-react installer environment exfiltration",
      FIXTURE_AMAZON_INSPECTOR_FUEL_REACT,
      "amazon-inspector-fuel-react",
      "process.env",
    ],
    [
      "lumen-pages-community installer identity exfiltration",
      FIXTURE_AMAZON_INSPECTOR_LUMEN_PAGES,
      "amazon-inspector-lumen-pages-community",
      "b00492c6-27ba-4ea0-a9cb-dd50b3770250",
    ],
  ])("flags the Amazon Inspector %s IOC", (_label, fixture, hint, rawIOC) => {
    const result = JSON.parse(scan(readFileSync(fixture, "utf8"), hint));
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.excerpt).not.toContain(rawIOC);
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector uibabai blockchain loader IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_UIBABAI, "utf8"),
      "amazon-inspector-uibabai",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector simple-date-formatter reverse-shell IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_SIMPLE_DATE, "utf8"),
      "amazon-inspector-simple-date-formatter",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector cryptostock obfuscated remote-control IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_CRYPTOSTOCK, "utf8"),
      "amazon-inspector-cryptostock",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector notafollower IMDS credential-theft IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_NOTAFOLLOWER, "utf8"),
      "amazon-inspector-notafollower",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.excerpt).not.toContain("YOUR_COLLAB");
    expect(campaign.excerpt).not.toContain("real_aws_keys");
    expect(campaign.cve_refs).toEqual([]);
  });

  it("flags the Amazon Inspector depcruise off-registry loader IOC", () => {
    const raw = scan(
      readFileSync(FIXTURE_AMAZON_INSPECTOR_DEPCRUISE, "utf8"),
      "amazon-inspector-depcruise",
    );
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.excerpt).not.toContain("ltidi.storage.googleapis.com");
    expect(campaign.excerpt).not.toContain("ltidisafe");
    expect(campaign.cve_refs).toEqual([]);
  });

  it.each([
    [
      FIXTURE_AMAZON_INSPECTOR_PFP_FORMS,
      "amazon-inspector-pfp-forms",
      "pfp-forms-sme-loan",
    ],
    [
      FIXTURE_AMAZON_INSPECTOR_CHECKOUT_DESKTOP,
      "amazon-inspector-checkout-desktop",
      "checkout-desktop-total",
    ],
  ])("flags the Amazon Inspector %s platform-loader IOC", (fixture, hint) => {
    const raw = scan(readFileSync(fixture, "utf8"), hint);
    const result = JSON.parse(raw);
    const campaign = result.findings.find(
      (f: { rule_id: string }) => f.rule_id === "amazon-inspector-npm-malware-ioc",
    );
    expect(campaign).toBeTruthy();
    expect(result.format_detected).toBe("npm-malware-artifact");
    expect(result.audr_tag).toBe(AUDR_VERSION_TAG);
    expect(campaign.severity).toBe("critical");
    expect(campaign.excerpt).not.toContain("oob-worker");
    expect(campaign.excerpt).not.toContain("wel1.ru");
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

  it("flags CVE-2026-66418 from vulnerable OpenClaw Dashboard source", () => {
    const raw = scan(
      readFileSync(FIXTURE_OPENCLAW_DASHBOARD, "utf8"),
      "openclaw-dashboard",
    );
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("openclaw-dashboard-source");
    const storedXSS = result.findings.find(
      (f: { rule_id: string }) =>
        f.rule_id === "openclaw-dashboard-notification-username-stored-xss",
    );
    expect(storedXSS).toBeTruthy();
    expect(storedXSS.severity).toBe("critical");
    expect(storedXSS.cve_refs).toContain("CVE-2026-66418");
  });

  it("auto-detects vulnerable OpenClaw Dashboard source without a format hint", () => {
    const raw = scan(readFileSync(FIXTURE_OPENCLAW_DASHBOARD, "utf8"), "");
    const result = JSON.parse(raw);
    expect(result.format_detected).toBe("openclaw-dashboard-source");
    expect(
      result.findings.some(
        (f: { rule_id: string }) =>
          f.rule_id === "openclaw-dashboard-notification-username-stored-xss",
      ),
    ).toBe(true);
  });

  it("returns zero findings on clean input without crashing", () => {
    const raw = scan('{"mcpServers": {}}', "mcp");
    const result = JSON.parse(raw);
    expect(result.findings).toEqual([]);
    expect(result.format_detected).toBe("mcp-config");
  });
});
