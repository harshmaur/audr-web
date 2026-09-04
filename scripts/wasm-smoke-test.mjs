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
const amazonInspectorTailwindFluidStylesFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-tailwind-fluid-styles.js",
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
const amazonInspectorChaiAsOTCFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-chai-as-otc.js",
);
const amazonInspectorChaiAsOrgFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-chai-as-org.js",
);
const amazonInspectorSpotifyURLInfosFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-spotify-url-infos.js",
);
const amazonInspectorSpotifyURLResolversFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-spotify-url-resolvers.js",
);
const amazonInspectorOctopusActionFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-octopus-action.js",
);
const amazonInspectorMTServerlessFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-mt-ts-serverless-starter.js",
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
const amazonInspectorGrafenoFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-grafeno-preinstall.js",
);
const amazonInspectorEnvParserFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-env-parser.js",
);
const amazonInspectorDimHydrationUIFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-dim-hydration-ui.js",
);
const amazonInspectorDimHydrationUIBinaryFixturePath = join(
  root,
  "tests/fixtures/amazon-inspector-dim-hydration-ui.bin",
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
const tronixPyPIFixturePath = join(
  root,
  "tests/fixtures/tronix-pypi-private-key-exfil.py",
);
const tronixPyPITrongridiFixturePath = join(
  root,
  "tests/fixtures/tronix-pypi-trongridi-private-key-exfil.py",
);
const spaysrbdataDiscordNVFixturePath = join(
  root,
  "tests/fixtures/spaysrbdata-discordnv-infostealer.py",
);
const pygameRenderkitFixtures = [
  [
    "tests/fixtures/pygame-renderkit-setup.py",
    "pygame-renderkit-setup",
    "setup.py installer",
  ],
  [
    "tests/fixtures/pygame-renderkit-rk-recon.py",
    "pygame-renderkit-recon",
    "dropped recon payload",
  ],
  [
    "tests/fixtures/pygame-renderkit.service",
    "pygame-renderkit-systemd",
    "systemd-user persistence",
  ],
  [
    "tests/fixtures/pygame-renderkit-sudoers",
    "pygame-renderkit-sudoers",
    "sudoers persistence",
  ],
  [
    "tests/fixtures/flask-header-guard-setup.py",
    "flask-header-guard-setup",
    "flask-header-guard setup.py installer",
  ],
  [
    "tests/fixtures/flask-header-guard-backdoor.py",
    "flask-header-guard-backdoor",
    "flask-header-guard hidden Flask backdoor",
  ],
  [
    "tests/fixtures/flask-header-guard-fhg-recon.py",
    "flask-header-guard-recon",
    "flask-header-guard dropped recon payload",
  ],
  [
    "tests/fixtures/flask-header-guard-sudoers",
    "flask-header-guard-sudoers",
    "flask-header-guard sudoers persistence",
  ],
];
const miniShaiHuludOpenAPICodegenFixtures = [
  [
    "tests/fixtures/mini-shai-hulud-openapi-codegen-payload.js",
    "mini-shai-hulud-openapi-codegen-payload",
    "3FWCvzduYZg.js payload",
  ],
  [
    "tests/fixtures/mini-shai-hulud-openapi-codegen-binding.gyp",
    "mini-shai-hulud-openapi-codegen-binding-gyp",
    "binding.gyp launcher",
  ],
  [
    "tests/fixtures/mini-shai-hulud-openapi-codegen-package.json",
    "mini-shai-hulud-openapi-codegen-package-json",
    "package.json preinstall launcher",
  ],
];
const miniShaiHuludUntrustedPublishWorkflowFixturePath = join(
  root,
  "tests/fixtures/mini-shai-hulud-untrusted-publish-workflow.yml",
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

for (const [label, fixture, hint, rawIOC, rawResultIOCs = []] of [
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
    "chai-as-otc environment exfiltration and remote code loader",
    amazonInspectorChaiAsOTCFixturePath,
    "amazon-inspector-chai-as-otc",
    "aHR0cHM6Ly9pcGNoZWNrLWhhc2hlZC52ZXJjZWwuYXBw",
  ],
  [
    "chai-as-org environment exfiltration and remote code loader",
    amazonInspectorChaiAsOrgFixturePath,
    "amazon-inspector-chai-as-org",
    "aHR0cHM6Ly9pcGNoZWNrLWhhc2hlZC52ZXJjZWwuYXBw",
  ],
  [
    "spotify-url-infos whole-workspace Telegram archival",
    amazonInspectorSpotifyURLInfosFixturePath,
    "amazon-inspector-spotify-url-infos",
    "sendDocument",
  ],
  [
    "spotify-url-resolvers whole-workspace Telegram archival",
    amazonInspectorSpotifyURLResolversFixturePath,
    "amazon-inspector-spotify-url-resolvers",
    "sendDocument",
  ],
  [
    "octopus-action install-time host and system-file exfiltration",
    amazonInspectorOctopusActionFixturePath,
    "amazon-inspector-octopus-action",
    "dfwvktnc563cparn1p88c8051w7ovej3.oastify.com",
    ["dfwvktnc563cparn1p88c8051w7ovej3.oastify.com", "/etc/passwd", "/etc/hosts"],
  ],
  [
    "mt-ts-serverless-starter install-time host and system-file exfiltration",
    amazonInspectorMTServerlessFixturePath,
    "amazon-inspector-mt-ts-serverless-starter",
    "e4jw9ucdu7sdebgoqqx919p6qxwoke83.oastify.com",
    ["e4jw9ucdu7sdebgoqqx919p6qxwoke83.oastify.com", "/etc/passwd", "/etc/hosts"],
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
  [
    "grafeno-billing installer credential exfiltration and reverse shell",
    amazonInspectorGrafenoFixturePath,
    "amazon-inspector-grafeno-billing",
    "216.126.236.46",
    ["216.126.236.46", "/dev/tcp/216.126.236.46/4444"],
  ],
  [
    "grafeno-payments installer credential exfiltration and reverse shell",
    amazonInspectorGrafenoFixturePath,
    "amazon-inspector-grafeno-payments",
    "216.126.236.46",
    ["216.126.236.46", "/dev/tcp/216.126.236.46/4444"],
  ],
  [
    "grafeno-webhook installer credential exfiltration and reverse shell",
    amazonInspectorGrafenoFixturePath,
    "amazon-inspector-grafeno-webhook",
    "216.126.236.46",
    ["216.126.236.46", "/dev/tcp/216.126.236.46/4444"],
  ],
  [
    "@js-lib-team/env-parser wallet-key theft",
    amazonInspectorEnvParserFixturePath,
    "amazon-inspector-env-parser",
    "0x70951410C5E9E938D8715288A7229548287a1a62",
    [
      "0x70951410C5E9E938D8715288A7229548287a1a62",
      "PRIVATE_KEY",
      "SECRET",
      "MNEMONIC",
      "local.env",
    ],
  ],
]) {
  const latestCampaignResult = JSON.parse(
    globalThis.audrScan(readFileSync(fixture, "utf8"), hint),
  );
  const latestCampaignFinding = latestCampaignResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
  const serializedResult = JSON.stringify(latestCampaignResult).toLowerCase();
  if (
    !latestCampaignFinding ||
    latestCampaignFinding.excerpt?.includes(rawIOC) ||
    rawResultIOCs.some((marker) =>
      serializedResult.includes(marker.toLowerCase()),
    ) ||
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

const amazonInspectorTailwindFluidStylesResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorTailwindFluidStylesFixturePath, "utf8"),
    "amazon-inspector-tailwind-fluid-styles",
  ),
);
const amazonInspectorTailwindFluidStylesFinding =
  amazonInspectorTailwindFluidStylesResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
const amazonInspectorTailwindFluidStylesSerialized = JSON.stringify(
  amazonInspectorTailwindFluidStylesResult,
).toLowerCase();
if (
  !amazonInspectorTailwindFluidStylesFinding ||
  !amazonInspectorTailwindFluidStylesFinding.excerpt ||
  amazonInspectorTailwindFluidStylesSerialized.includes(
    "0xa322e5f3d311d3080e6f0121063e9adc2490ef1a",
  ) ||
  amazonInspectorTailwindFluidStylesSerialized.includes("/0x/cls") ||
  amazonInspectorTailwindFluidStylesSerialized.includes("/0x/ls") ||
  !Array.isArray(amazonInspectorTailwindFluidStylesFinding.cve_refs) ||
  amazonInspectorTailwindFluidStylesFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector tailwindcss-fluid-styles fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorTailwindFluidStylesResult)}`,
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

const amazonInspectorDimHydrationUIResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorDimHydrationUIFixturePath, "utf8"),
    "amazon-inspector-dim-hydration-ui",
  ),
);
const amazonInspectorDimHydrationUIFinding =
  amazonInspectorDimHydrationUIResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorDimHydrationUIFinding ||
  amazonInspectorDimHydrationUIFinding.excerpt?.includes("217.60.77.63") ||
  !Array.isArray(amazonInspectorDimHydrationUIFinding.cve_refs) ||
  amazonInspectorDimHydrationUIFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector dim-hydration-ui fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorDimHydrationUIResult)}`,
  );
  process.exit(2);
}

const amazonInspectorDimHydrationUIBinaryResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(amazonInspectorDimHydrationUIBinaryFixturePath, "utf8"),
    "amazon-inspector-dim-hydration-ui-binary",
  ),
);
const amazonInspectorDimHydrationUIBinaryFinding =
  amazonInspectorDimHydrationUIBinaryResult.findings?.find(
    (finding) => finding.rule_id === "amazon-inspector-npm-malware-ioc",
  );
if (
  !amazonInspectorDimHydrationUIBinaryFinding ||
  amazonInspectorDimHydrationUIBinaryFinding.excerpt?.includes(
    "217.60.77.63",
  ) ||
  !Array.isArray(amazonInspectorDimHydrationUIBinaryFinding.cve_refs) ||
  amazonInspectorDimHydrationUIBinaryFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Amazon Inspector dim-hydration-ui binary fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(amazonInspectorDimHydrationUIBinaryResult)}`,
  );
  process.exit(2);
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

const tronixPyPIResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(tronixPyPIFixturePath, "utf8"),
    "tronix-pypi-key-exfil",
  ),
);
const tronixPyPIFinding = tronixPyPIResult.findings?.find(
  (finding) => finding.rule_id === "tronix-pypi-private-key-exfil-ioc",
);
if (
  !tronixPyPIFinding ||
  tronixPyPIFinding.excerpt?.includes(
    "68076f26e81df7060eba3e58.mockapi.io",
  ) ||
  tronixPyPIFinding.excerpt?.includes("synthetic_tronix_marker") ||
  !Array.isArray(tronixPyPIFinding.cve_refs) ||
  tronixPyPIFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Tronix PyPI fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(tronixPyPIResult)}`,
  );
  process.exit(2);
}

const tronixPyPITrongridiResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(tronixPyPITrongridiFixturePath, "utf8"),
    "tronix-pypi-trongridi-key-exfil",
  ),
);
const tronixPyPITrongridiFinding = tronixPyPITrongridiResult.findings?.find(
  (finding) => finding.rule_id === "tronix-pypi-private-key-exfil-ioc",
);
if (
  !tronixPyPITrongridiFinding ||
  typeof tronixPyPITrongridiFinding.excerpt !== "string" ||
  tronixPyPITrongridiFinding.excerpt.length === 0 ||
  tronixPyPITrongridiFinding.excerpt?.includes(
    "66c0dc0bba6f27ca9a57c4bf.mockapi.io",
  ) ||
  tronixPyPITrongridiFinding.excerpt?.includes("synthetic_trongridi_marker") ||
  !Array.isArray(tronixPyPITrongridiFinding.cve_refs) ||
  tronixPyPITrongridiFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Tronix trongridi fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(tronixPyPITrongridiResult)}`,
  );
  process.exit(2);
}

const spaysrbdataDiscordNVResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(spaysrbdataDiscordNVFixturePath, "utf8"),
    "spaysrbdata-discordnv",
  ),
);
const spaysrbdataDiscordNVFinding = spaysrbdataDiscordNVResult.findings?.find(
  (finding) => finding.rule_id === "spaysrbdata-discordnv-infostealer-ioc",
);
if (
  !spaysrbdataDiscordNVFinding ||
  typeof spaysrbdataDiscordNVFinding.excerpt !== "string" ||
  spaysrbdataDiscordNVFinding.excerpt.length === 0 ||
  spaysrbdataDiscordNVFinding.excerpt?.includes("1528403989983662194") ||
  spaysrbdataDiscordNVFinding.excerpt?.includes(
    "synthetic_discordnv_secret_never_expose",
  ) ||
  spaysrbdataDiscordNVFinding.excerpt?.includes("synthetic_webhook_secret") ||
  !Array.isArray(spaysrbdataDiscordNVFinding.cve_refs) ||
  spaysrbdataDiscordNVFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: spaysrbdata discordnv fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(spaysrbdataDiscordNVResult)}`,
  );
  process.exit(2);
}

for (const [fixture, hint, label] of pygameRenderkitFixtures) {
  const campaignResult = JSON.parse(
    globalThis.audrScan(readFileSync(join(root, fixture), "utf8"), hint),
  );
  const campaignFinding = campaignResult.findings?.find(
    (finding) =>
      finding.rule_id === "pygame-renderkit-reverse-shell-persistence-ioc",
  );
  if (
    !campaignFinding ||
    campaignFinding.excerpt?.includes("5uj0a8ziyu.localto.net") ||
    campaignFinding.excerpt?.includes("smat7ckgzo.localto.net") ||
    campaignFinding.excerpt?.includes("synthetic_secret_never_expose") ||
    !Array.isArray(campaignFinding.cve_refs) ||
    campaignFinding.cve_refs.length !== 0
  ) {
    console.error(
      `smoke: pygame-renderkit ${label} fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(campaignResult)}`,
    );
    process.exit(2);
  }
}

for (const [fixture, hint, label] of miniShaiHuludOpenAPICodegenFixtures) {
  const campaignResult = JSON.parse(
    globalThis.audrScan(readFileSync(join(root, fixture), "utf8"), hint),
  );
  const campaignFinding = campaignResult.findings?.find(
    (finding) => finding.rule_id === "mini-shai-hulud-dropped-payload",
  );
  if (
    !campaignFinding ||
    campaignFinding.excerpt?.includes("synthetic-secret-never-expose") ||
    !Array.isArray(campaignFinding.cve_refs) ||
    campaignFinding.cve_refs.length !== 0
  ) {
    console.error(
      `smoke: Mini Shai-Hulud ${label} fixture did not return the expected redacted non-CVE finding through real WASM: ${JSON.stringify(campaignResult)}`,
    );
    process.exit(2);
  }
}

const miniShaiHuludWorkflowResult = JSON.parse(
  globalThis.audrScan(
    readFileSync(miniShaiHuludUntrustedPublishWorkflowFixturePath, "utf8"),
    "mini-shai-hulud-untrusted-publish-workflow",
  ),
);
const miniShaiHuludWorkflowFinding = miniShaiHuludWorkflowResult.findings?.find(
  (finding) =>
    finding.rule_id === "mini-shai-hulud-untrusted-publish-workflow",
);
if (
  !miniShaiHuludWorkflowFinding ||
  miniShaiHuludWorkflowResult.format_detected !== "gha-workflow" ||
  miniShaiHuludWorkflowFinding.severity !== "critical" ||
  !Array.isArray(miniShaiHuludWorkflowFinding.cve_refs) ||
  miniShaiHuludWorkflowFinding.cve_refs.length !== 0
) {
  console.error(
    `smoke: Mini Shai-Hulud untrusted publish workflow fixture did not return the expected non-CVE finding through real WASM: ${JSON.stringify(miniShaiHuludWorkflowResult)}`,
  );
  process.exit(2);
}

console.log(
  `smoke: ok — ${result.findings.length} findings, format=${result.format_detected}, audr=${result.audr_sha.slice(0, 8)} (${result.audr_tag}), ${result.scan_ms}ms`,
);
process.exit(0);
