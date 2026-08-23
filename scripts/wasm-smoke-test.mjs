#!/usr/bin/env node
// Boots audr.wasm in Node, runs it against a known-bad fixture, and asserts
// the WASM API contract from the office-hours spec is honored.
//
// Runs in CI before deploy. Failure preserves the last-good wasm and opens
// a GH issue (per the test plan).

import { webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const wasmPath = join(root, "public/wasm/audr.wasm");
const wasmExecPath = join(root, "public/wasm/wasm_exec.js");
const fixturePath = join(root, "tests/fixtures/dirty-mcp.json");
const amazonInspectorFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-npm-malware.js",
);
const amazonInspectorStreakFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-streak-core-math.js",
);
const amazonInspectorStreakDailyFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-streak-daily-lib.js",
);
const amazonInspectorStreakCoreFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-streak-core-lib.js",
);
const amazonInspectorStreakDayFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-streak-day-utils.js",
);
const amazonInspectorAgentCLIFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-agentcli.js",
);
const amazonInspectorAppSodaFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-app-soda-layer.js",
);
const amazonInspectorSigchainFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-sigchain-js.js",
);
const amazonInspectorChainAnalyzeFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-chain-analyze.js",
);
const amazonInspectorClaudeRemoteAgentFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-claude-remote-agent.js",
);
const amazonInspectorLLMInterceptorFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-llm-interceptor.json",
);
const amazonInspectorMapStreakFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-map-streak-kit.js",
);
const amazonInspectorKitVimMapFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-kit-vim-map.bin",
);
const amazonInspectorKitMapVimFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-kit-map-vim.js",
);
const amazonInspectorWScreenctlFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-w-screenctl.js",
);
const amazonInspectorAcladeAgentFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-aclade-agent.js",
);
const amazonInspectorAgentHubAIFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-agenthub-ai.js",
);
const amazonInspectorUibabaiFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-uibabai.js",
);
const amazonInspectorSimpleDateFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-simple-date-formatter.json",
);
const amazonInspectorCryptostockFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-cryptostock.js",
);
const amazonInspectorNotafollowerFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-notafollower.json",
);
const amazonInspectorDepcruiseFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-depcruise.json",
);
const amazonInspectorPFPFormsFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-pfp-forms-loader.js",
);
const amazonInspectorCheckoutDesktopFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-checkout-desktop-loader.js",
);
const amazonInspectorGuangnaoAgentProxyFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-guangnao-agent-proxy.js",
);
const amazonInspectorCoreTailwindFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-core-tailwindcss-utility.js",
);
const amazonInspectorBCCDesignFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-bcc-design-beacon.js",
);
const amazonInspectorSetupCodexFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-setup-codex.js",
);
const amazonInspectorExpectDotenvFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-expect-dotenv.js",
);
const amazonInspectorHtttttMCPDemoFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-httttt-mcp-demo.js",
);
const amazonInspectorMCPDevToolkitFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-mcp-dev-toolkit.js",
);
const amazonInspectorExpressSessionHandlerFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-express-session-handler.js",
);
const amazonInspectorChaiAsSoulFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-chai-as-soul.js",
);
const amazonInspectorGFELXWatcherFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-gfe-lx-watcher.js",
);
const amazonInspectorFuelReactFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-fuel-react.js",
);
const amazonInspectorLumenPagesFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-lumen-pages-community.js",
);
const telekomODSReactUIKitFixturePath = join(
  root,
  "tests/fixtures/telekom-ods-react-ui-kit-malware.json",
);
const scrambleeerFixturePath = join(
  root,
  "tests/fixtures/scrambleeer-reverse-shell.py",
);
const scrambleeeerFixturePath = join(
  root,
  "tests/fixtures/scrambleeeer-reverse-shell.py",
);

// Load Go's wasm_exec runtime shim. It registers itself on globalThis.
await import(`file://${wasmExecPath}`);
const Go = globalThis.Go;
if (!Go) {
  console.error("smoke: wasm_exec.js did not register globalThis.Go");
  process.exit(2);
}

const go = new Go();
const bytes = readFileSync(wasmPath);
const { instance } = await WebAssembly.instantiate(bytes, go.importObject);
go.run(instance);

// Give the WASM main() a tick to register `audrScan` on globalThis.
await new Promise((r) => setTimeout(r, 50));

if (typeof globalThis.audrScan !== "function") {
  console.error("smoke: globalThis.audrScan was not registered");
  process.exit(2);
}

const fixtureText = readFileSync(fixturePath, "utf8");
const raw = globalThis.audrScan(fixtureText, "mcp");
const result = JSON.parse(raw);

const required = ["findings", "format_detected", "audr_sha", "scan_ms"];
for (const key of required) {
  if (!(key in result)) {
    console.error(`smoke: result is missing required key: ${key}`);
    process.exit(2);
  }
}

if (!Array.isArray(result.findings) || result.findings.length < 3) {
  console.error(
    `smoke: expected ≥3 findings against the dirty fixture, got ${result.findings?.length ?? 0}`,
  );
  console.error(JSON.stringify(result, null, 2));
  process.exit(2);
}

for (const f of result.findings) {
  for (const k of ["rule_id", "severity", "title", "attacker_gets"]) {
    if (typeof f[k] !== "string" || f[k] === "") {
      console.error(`smoke: finding missing or empty ${k}: ${JSON.stringify(f)}`);
      process.exit(2);
    }
  }
}

const amazonInspectorText = readFileSync(amazonInspectorFixturePath, "utf8");
const amazonInspectorResult = JSON.parse(
  globalThis.audrScan(amazonInspectorText, "amazon-inspector-npm-malware"),
);
if (
  !amazonInspectorResult.findings?.some(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  )
) {
  console.error(
    `smoke: Amazon Inspector npm malware fixture did not fire through real WASM: ${JSON.stringify(amazonInspectorResult)}`,
  );
  process.exit(2);
}

const amazonInspectorStreakText = readFileSync(
  amazonInspectorStreakFixturePath,
  "utf8",
);
const amazonInspectorStreakResult = JSON.parse(
  globalThis.audrScan(
    amazonInspectorStreakText,
    "amazon-inspector-streak-core-math",
  ),
);
if (
  !amazonInspectorStreakResult.findings?.some(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  )
) {
  console.error(
    `smoke: Amazon Inspector streak follow-up fixture did not fire through real WASM: ${JSON.stringify(amazonInspectorStreakResult)}`,
  );
  process.exit(2);
}

for (const [fixture, hint, label] of [
  [
    amazonInspectorStreakDailyFixturePath,
    "amazon-inspector-streak-daily-lib",
    "streak-daily-lib WSL Startup",
  ],
  [
    amazonInspectorStreakCoreFixturePath,
    "amazon-inspector-streak-core-lib",
    "streak-core-lib embedded PE Startup",
  ],
  [
    amazonInspectorStreakDayFixturePath,
    "amazon-inspector-streak-day-utils",
    "streak-day-utils WSL Startup",
  ],
]) {
  const campaignResult = JSON.parse(
    globalThis.audrScan(readFileSync(fixture, "utf8"), hint),
  );
  if (
    !campaignResult.findings?.some(
      (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
    )
  ) {
    console.error(
      `smoke: Amazon Inspector ${label} fixture did not fire through real WASM: ${JSON.stringify(campaignResult)}`,
    );
    process.exit(2);
  }
}

const amazonInspectorAgentCLIText = readFileSync(
  amazonInspectorAgentCLIFixturePath,
  "utf8",
);
const amazonInspectorAgentCLIResult = JSON.parse(
  globalThis.audrScan(
    amazonInspectorAgentCLIText,
    "amazon-inspector-agentcli",
  ),
);
if (
  !amazonInspectorAgentCLIResult.findings?.some(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  )
) {
  console.error(
    `smoke: Amazon Inspector agentcli follow-up fixture did not fire through real WASM: ${JSON.stringify(amazonInspectorAgentCLIResult)}`,
  );
  process.exit(2);
}

const amazonInspectorAppSodaResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorAppSodaFixturePath, "utf8"),
    "amazon-inspector-app-soda-layer",
  ),
);
if (
  !amazonInspectorAppSodaResult.findings?.some(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  )
) {
  console.error(
    `smoke: Amazon Inspector app-soda-layer follow-up fixture did not fire through real WASM: ${JSON.stringify(amazonInspectorAppSodaResult)}`,
  );
  process.exit(2);
}

const amazonInspectorSigchainResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorSigchainFixturePath, "utf8"),
    "amazon-inspector-sigchain-js",
  ),
);
if (
  !amazonInspectorSigchainResult.findings?.some(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  )
) {
  console.error(
    `smoke: Amazon Inspector sigchain-js follow-up fixture did not fire through real WASM: ${JSON.stringify(amazonInspectorSigchainResult)}`,
  );
  process.exit(2);
}

const amazonInspectorChainAnalyzeResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorChainAnalyzeFixturePath, "utf8"),
    "amazon-inspector-chain-analyze",
  ),
);
const amazonInspectorChainAnalyzeFinding =
  amazonInspectorChainAnalyzeResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorChainAnalyzeFinding ||
  !Array.isArray(amazonInspectorChainAnalyzeFinding.cve_refs) ||
  amazonInspectorChainAnalyzeFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector chain-analyze follow-up fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorChainAnalyzeResult)}`,
  );
  process.exit(2);
}

const amazonInspectorClaudeRemoteAgentResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorClaudeRemoteAgentFixturePath, "utf8"),
    "amazon-inspector-claude-remote-agent",
  ),
);
const amazonInspectorClaudeRemoteAgentFinding =
  amazonInspectorClaudeRemoteAgentResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorClaudeRemoteAgentFinding ||
  !Array.isArray(amazonInspectorClaudeRemoteAgentFinding.cve_refs) ||
  amazonInspectorClaudeRemoteAgentFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector claude-remote-agent follow-up fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorClaudeRemoteAgentResult)}`,
  );
  process.exit(2);
}

const amazonInspectorLLMInterceptorResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorLLMInterceptorFixturePath, "utf8"),
    "amazon-inspector-llm-interceptor",
  ),
);
const amazonInspectorLLMInterceptorFinding =
  amazonInspectorLLMInterceptorResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorLLMInterceptorFinding ||
  amazonInspectorLLMInterceptorFinding.excerpt?.includes("friend-token") ||
  !Array.isArray(amazonInspectorLLMInterceptorFinding.cve_refs) ||
  amazonInspectorLLMInterceptorFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector llm-interceptor follow-up fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorLLMInterceptorResult)}`,
  );
  process.exit(2);
}

const amazonInspectorMapStreakResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorMapStreakFixturePath, "utf8"),
    "amazon-inspector-map-streak-kit",
  ),
);
const amazonInspectorMapStreakFinding =
  amazonInspectorMapStreakResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorMapStreakFinding ||
  !Array.isArray(amazonInspectorMapStreakFinding.cve_refs) ||
  amazonInspectorMapStreakFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector map-streak-kit RedShell fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorMapStreakResult)}`,
  );
  process.exit(2);
}

const amazonInspectorKitVimMapResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorKitVimMapFixturePath, "utf8"),
    "amazon-inspector-kit-vim-map",
  ),
);
const amazonInspectorKitVimMapFinding =
  amazonInspectorKitVimMapResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorKitVimMapFinding ||
  !Array.isArray(amazonInspectorKitVimMapFinding.cve_refs) ||
  amazonInspectorKitVimMapFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector kit-vim-map RedShell fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorKitVimMapResult)}`,
  );
  process.exit(2);
}

const amazonInspectorKitMapVimResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorKitMapVimFixturePath, "utf8"),
    "amazon-inspector-kit-map-vim",
  ),
);
const amazonInspectorKitMapVimFinding =
  amazonInspectorKitMapVimResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorKitMapVimFinding ||
  !Array.isArray(amazonInspectorKitMapVimFinding.cve_refs) ||
  amazonInspectorKitMapVimFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector kit-map-vim RedShell fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorKitMapVimResult)}`,
  );
  process.exit(2);
}

const amazonInspectorWScreenctlResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorWScreenctlFixturePath, "utf8"),
    "amazon-inspector-w-screenctl",
  ),
);
const amazonInspectorWScreenctlFinding =
  amazonInspectorWScreenctlResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorWScreenctlFinding ||
  !Array.isArray(amazonInspectorWScreenctlFinding.cve_refs) ||
  amazonInspectorWScreenctlFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector w-screenctl fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorWScreenctlResult)}`,
  );
  process.exit(2);
}

const amazonInspectorAcladeAgentResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorAcladeAgentFixturePath, "utf8"),
    "amazon-inspector-aclade-agent",
  ),
);
const amazonInspectorAcladeAgentFinding =
  amazonInspectorAcladeAgentResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorAcladeAgentFinding ||
  !Array.isArray(amazonInspectorAcladeAgentFinding.cve_refs) ||
  amazonInspectorAcladeAgentFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector aclade-agent fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorAcladeAgentResult)}`,
  );
  process.exit(2);
}

const amazonInspectorAgentHubAIResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorAgentHubAIFixturePath, "utf8"),
    "amazon-inspector-agenthub-ai",
  ),
);
const amazonInspectorAgentHubAIFinding =
  amazonInspectorAgentHubAIResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorAgentHubAIFinding ||
  !Array.isArray(amazonInspectorAgentHubAIFinding.cve_refs) ||
  amazonInspectorAgentHubAIFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector agenthub-ai fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorAgentHubAIResult)}`,
  );
  process.exit(2);
}

const amazonInspectorGuangnaoAgentProxyResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorGuangnaoAgentProxyFixturePath, "utf8"),
    "amazon-inspector-guangnao-agent-proxy",
  ),
);
const amazonInspectorGuangnaoAgentProxyFinding =
  amazonInspectorGuangnaoAgentProxyResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorGuangnaoAgentProxyFinding ||
  amazonInspectorGuangnaoAgentProxyFinding.excerpt?.includes("gnP2p!7xQ") ||
  !Array.isArray(amazonInspectorGuangnaoAgentProxyFinding.cve_refs) ||
  amazonInspectorGuangnaoAgentProxyFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector agent-proxy fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorGuangnaoAgentProxyResult)}`,
  );
  process.exit(2);
}

for (const [label, fixture, hint, rawIOC] of [
  [
    "core-tailwindcss-utility loader",
    amazonInspectorCoreTailwindFixturePath,
    "amazon-inspector-core-tailwindcss-utility",
    "31.97.137.157",
  ],
  [
    "bcc-design beacon",
    amazonInspectorBCCDesignFixturePath,
    "amazon-inspector-bcc-design",
    "91.201.215.48",
  ],
  [
    "bcc-design-icons beacon",
    amazonInspectorBCCDesignFixturePath,
    "amazon-inspector-bcc-design-icons",
    "91.201.215.48",
  ],
  [
    "setup-codex exfiltration",
    amazonInspectorSetupCodexFixturePath,
    "amazon-inspector-setup-codex",
    "hooks.zapier.com",
  ],
  [
    "expect-dotenv remote parser execution",
    amazonInspectorExpectDotenvFixturePath,
    "amazon-inspector-expect-dotenv",
    "arrayParser",
  ],
  [
    "@httttt/mcp-demo javaagent execution",
    amazonInspectorHtttttMCPDemoFixturePath,
    "amazon-inspector-httttt-mcp-demo",
    "myhuaweicloud.com",
  ],
  [
    "mcp-dev-toolkit Git propagation",
    amazonInspectorMCPDevToolkitFixturePath,
    "amazon-inspector-mcp-dev-toolkit",
    "git push",
  ],
  [
    "express-session-handler mutable remote code loader",
    amazonInspectorExpressSessionHandlerFixturePath,
    "amazon-inspector-express-session-handler",
    "api.jsonbin.io",
  ],
  [
    "chai-as-soul environment exfiltration and remote code loader",
    amazonInspectorChaiAsSoulFixturePath,
    "amazon-inspector-chai-as-soul",
    "x-secret-header",
  ],
  [
    "@gfe/lx-watcher installer identity exfiltration",
    amazonInspectorGFELXWatcherFixturePath,
    "amazon-inspector-gfe-lx-watcher",
    "df384ffa-1094-4bbf-a202-e8b345b3ed18",
  ],
  [
    "fuel-react installer environment exfiltration",
    amazonInspectorFuelReactFixturePath,
    "amazon-inspector-fuel-react",
    "process.env",
  ],
  [
    "lumen-pages-community installer identity exfiltration",
    amazonInspectorLumenPagesFixturePath,
    "amazon-inspector-lumen-pages-community",
    "b00492c6-27ba-4ea0-a9cb-dd50b3770250",
  ],
]) {
  const latestCampaignResult = JSON.parse(
    globalThis.audrScan(readFileSync(fixture, "utf8"), hint),
  );
  const latestCampaignFinding = latestCampaignResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
  if (
    !latestCampaignFinding ||
    latestCampaignFinding.excerpt?.includes(rawIOC) ||
    !Array.isArray(latestCampaignFinding.cve_refs) ||
    latestCampaignFinding.cve_refs.length !== 0
  ) {
    console.error(
      `smoke: Amazon Inspector ${label} fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(latestCampaignResult)}`,
    );
    process.exit(2);
  }
}

const amazonInspectorUibabaiResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorUibabaiFixturePath, "utf8"),
    "amazon-inspector-uibabai",
  ),
);
const amazonInspectorUibabaiFinding =
  amazonInspectorUibabaiResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorUibabaiFinding ||
  !Array.isArray(amazonInspectorUibabaiFinding.cve_refs) ||
  amazonInspectorUibabaiFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector uibabai fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorUibabaiResult)}`,
  );
  process.exit(2);
}

const amazonInspectorSimpleDateResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorSimpleDateFixturePath, "utf8"),
    "amazon-inspector-simple-date-formatter",
  ),
);
const amazonInspectorSimpleDateFinding =
  amazonInspectorSimpleDateResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorSimpleDateFinding ||
  !Array.isArray(amazonInspectorSimpleDateFinding.cve_refs) ||
  amazonInspectorSimpleDateFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector simple-date-formatter fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorSimpleDateResult)}`,
  );
  process.exit(2);
}

const amazonInspectorCryptostockResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorCryptostockFixturePath, "utf8"),
    "amazon-inspector-cryptostock",
  ),
);
const amazonInspectorCryptostockFinding =
  amazonInspectorCryptostockResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorCryptostockFinding ||
  !Array.isArray(amazonInspectorCryptostockFinding.cve_refs) ||
  amazonInspectorCryptostockFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector cryptostock fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorCryptostockResult)}`,
  );
  process.exit(2);
}

const amazonInspectorNotafollowerResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorNotafollowerFixturePath, "utf8"),
    "amazon-inspector-notafollower",
  ),
);
const amazonInspectorNotafollowerFinding =
  amazonInspectorNotafollowerResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorNotafollowerFinding ||
  amazonInspectorNotafollowerFinding.excerpt?.includes("YOUR_COLLAB") ||
  amazonInspectorNotafollowerFinding.excerpt?.includes("real_aws_keys") ||
  !Array.isArray(amazonInspectorNotafollowerFinding.cve_refs) ||
  amazonInspectorNotafollowerFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector notafollower fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorNotafollowerResult)}`,
  );
  process.exit(2);
}

const amazonInspectorDepcruiseResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorDepcruiseFixturePath, "utf8"),
    "amazon-inspector-depcruise",
  ),
);
const amazonInspectorDepcruiseFinding =
  amazonInspectorDepcruiseResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorDepcruiseFinding ||
  amazonInspectorDepcruiseFinding.excerpt?.includes("ltidi.storage.googleapis.com") ||
  amazonInspectorDepcruiseFinding.excerpt?.includes("ltidisafe") ||
  !Array.isArray(amazonInspectorDepcruiseFinding.cve_refs) ||
  amazonInspectorDepcruiseFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector depcruise fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorDepcruiseResult)}`,
  );
  process.exit(2);
}

for (const [fixture, hint, label] of [
  [
    amazonInspectorPFPFormsFixturePath,
    "amazon-inspector-pfp-forms",
    "pfp-forms-sme-loan platform loader",
  ],
  [
    amazonInspectorCheckoutDesktopFixturePath,
    "amazon-inspector-checkout-desktop",
    "checkout-desktop-total platform loader",
  ],
]) {
  const platformLoaderResult = JSON.parse(
    globalThis.audrScan(readFileSync(fixture, "utf8"), hint),
  );
  const platformLoaderFinding = platformLoaderResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
  if (
    !platformLoaderFinding ||
    platformLoaderFinding.excerpt?.includes("oob-worker") ||
    platformLoaderFinding.excerpt?.includes("wel1.ru") ||
    !Array.isArray(platformLoaderFinding.cve_refs) ||
    platformLoaderFinding.cve_refs.length !== 0
  ) {
    console.error(
      `smoke: Amazon Inspector ${label} fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(platformLoaderResult)}`,
    );
    process.exit(2);
  }
}

const telekomODSReactUIKitResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(telekomODSReactUIKitFixturePath, "utf8"),
    "telekom-ods-react-ui-kit",
  ),
);
const telekomODSReactUIKitFinding = telekomODSReactUIKitResult.findings?.find(
  (finding) => finding.rule_id === "telekom-ods-react-ui-kit-system-file-exfil",
);
if (
  !telekomODSReactUIKitFinding ||
  !Array.isArray(telekomODSReactUIKitFinding.cve_refs) ||
  telekomODSReactUIKitFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Telekom ODS React UI Kit fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(telekomODSReactUIKitResult)}`,
  );
  process.exit(2);
}

const scrambleeerResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(scrambleeerFixturePath, "utf8"),
    "scrambleeer-pypi",
  ),
);
const scrambleeerFinding = scrambleeerResult.findings?.find(
  (finding) => finding.rule_id === "scrambleeer-reverse-shell-ioc",
);
if (
  !scrambleeerFinding ||
  scrambleeerFinding.excerpt?.includes("bax.h4x.tv") ||
  !Array.isArray(scrambleeerFinding.cve_refs) ||
  scrambleeerFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: scrambleeer fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(scrambleeerResult)}`,
  );
  process.exit(2);
}

const scrambleeeerResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(scrambleeeerFixturePath, "utf8"),
    "scrambleeeer-pypi",
  ),
);
const scrambleeeerFinding = scrambleeeerResult.findings?.find(
  (finding) => finding.rule_id === "scrambleeer-reverse-shell-ioc",
);
if (
  !scrambleeeerFinding ||
  scrambleeeerFinding.excerpt?.includes("bax.h4x.tv") ||
  !Array.isArray(scrambleeeerFinding.cve_refs) ||
  scrambleeeerFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: scrambleeeer fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(scrambleeeerResult)}`,
  );
  process.exit(2);
}

console.log(
  `smoke: ok — ${result.findings.length} findings, format=${result.format_detected}, audr=${result.audr_sha.slice(0, 8)} (${result.audr_tag}), ${result.scan_ms}ms`,
);
process.exit(0);
