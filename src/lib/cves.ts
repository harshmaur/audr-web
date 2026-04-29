import cvesJson from "../data/cves.json";
import type { CVE } from "./types";

const REQUIRED_KEYS: (keyof CVE)[] = [
  "cve_id",
  "product",
  "vendor",
  "severity",
  "published_date",
  "summary_short",
  "visceral_consequence",
  "audr_rule_id",
  "scope_phrase",
];

const ALLOWED_SEVERITIES = new Set(["critical", "high", "medium", "low"]);

export function loadCVEs(): CVE[] {
  if (!Array.isArray(cvesJson) || cvesJson.length === 0) {
    throw new Error("cves.json must be a non-empty array");
  }
  return cvesJson.map((raw, idx) => validate(raw, idx));
}

function validate(raw: unknown, idx: number): CVE {
  if (!raw || typeof raw !== "object") {
    throw new Error(`cves.json[${idx}] is not an object`);
  }
  const obj = raw as Record<string, unknown>;
  for (const k of REQUIRED_KEYS) {
    if (typeof obj[k] !== "string" || (obj[k] as string).length === 0) {
      throw new Error(`cves.json[${idx}] missing required string field: ${k}`);
    }
  }
  if (!ALLOWED_SEVERITIES.has(obj.severity as string)) {
    throw new Error(
      `cves.json[${idx}].severity must be critical|high|medium|low, got ${obj.severity}`,
    );
  }
  if (Number.isNaN(Date.parse(obj.published_date as string))) {
    throw new Error(`cves.json[${idx}].published_date is not a valid date`);
  }
  return obj as unknown as CVE;
}

export function daysSince(isoDate: string, now: Date = new Date()): number {
  const t = Date.parse(isoDate);
  if (Number.isNaN(t)) return -1;
  return Math.max(0, Math.floor((now.getTime() - t) / (1000 * 60 * 60 * 24)));
}

export function severityClass(sev: string): string {
  switch (sev) {
    case "critical":
      return "text-sev-critical";
    case "high":
      return "text-sev-high";
    case "medium":
      return "text-sev-medium";
    case "low":
      return "text-sev-low";
    default:
      return "text-text-muted";
  }
}

export function severityBg(sev: string): string {
  switch (sev) {
    case "critical":
      return "bg-sev-critical";
    case "high":
      return "bg-sev-high";
    case "medium":
      return "bg-sev-medium";
    case "low":
      return "bg-sev-low";
    default:
      return "bg-border";
  }
}
