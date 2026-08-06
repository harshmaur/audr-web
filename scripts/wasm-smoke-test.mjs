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

console.log(
  `smoke: ok — ${result.findings.length} findings, format=${result.format_detected}, audr=${result.audr_sha.slice(0, 8)} (${result.audr_tag}), ${result.scan_ms}ms`,
);
process.exit(0);
