#!/usr/bin/env node
// Boots audr.wasm in Node, runs it against a known-bad fixture, and asserts
// the WASM API contract from the office-hours spec is honored.
//
// Runs in CI before deploy. Failure preserves the last-good wasm and opens
// a GH issue (per the test plan).

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const wasmPath = join(root, "public/wasm/audr.wasm");
const wasmExecPath = join(root, "public/wasm/wasm_exec.js");
const fixturePath = join(root, "tests/fixtures/dirty-mcp.json");

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

console.log(
  `smoke: ok — ${result.findings.length} findings, format=${result.format_detected}, audr=${result.audr_sha.slice(0, 8)} (${result.audr_tag}), ${result.scan_ms}ms`,
);
process.exit(0);
