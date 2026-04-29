// Type contracts for the audr-web frontend.
// The Finding shape mirrors the WASM API contract from the office-hours spec.
// Keep in sync with scripts/wasm-src/main.go (wasmFinding / wasmResult).

export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  rule_id: string;
  severity: Severity;
  title: string;
  attacker_gets: string;
  excerpt: string;
  line: number;
  cve_refs: string[];
}

export type FormatHint = "claude" | "codex" | "cursor" | "mcp";

export interface ScanResult {
  findings: Finding[];
  format_detected: string;
  audr_sha: string;
  audr_tag: string;
  scan_ms: number;
}

export interface CVE {
  cve_id: string;
  product: string;
  vendor: string;
  severity: Severity;
  published_date: string;
  summary_short: string;
  visceral_consequence: string;
  audr_rule_id: string;
  scope_phrase: string;
}
