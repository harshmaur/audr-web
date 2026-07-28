import coverageJson from "../data/coverage-ledger.json";

export type CoverageStatus = "shipped" | "actionable" | "investigating";
export type CoverageSeverity = "critical" | "high" | "medium" | "low";

export interface CoverageEntry {
  cve_id: string;
  status: CoverageStatus;
  severity: CoverageSeverity;
  vendor: string;
  product: string;
  published_date: string;
  last_seen_at: string;
  keywords: string[];
  local_signal_category: string;
  nvd_url: string;
  summary_short: string;
  audr_rule_id?: string;
}

export interface CoverageSnapshot {
  generated_at: string;
  source_last_discovery_at: string;
  source_entry_count: number;
  public_entry_count: number;
  selected_triage_limit: number;
  excluded_public_safe_candidate_count: number;
  excluded_status_counts: Record<string, number>;
  excluded_unknown_vendor_product_count?: number;
  excluded_unknown_severity_count?: number;
  enriched_from_cves_json_count?: number;
  entries: CoverageEntry[];
}

export interface CoverageStats {
  shippedLocalCheckCount: number;
  latestAdvisoryReviewed: string;
  agentProductsRepresented: number;
  publicSnapshotUpdated: string;
}

const STATUSES = new Set<CoverageStatus>(["shipped", "actionable", "investigating"]);
const SEVERITIES = new Set<CoverageSeverity>(["critical", "high", "medium", "low"]);
const FORBIDDEN_ENTRY_KEYS = new Set([
  "summary",
  "proposed_detection_surface",
  "next_action",
  "notes",
  "reason",
  "blocker",
  "question",
  "duplicate_of",
  "existing_rule_id",
  "origin_issue",
  "origin_issue_number",
  "origin_issue_numbers",
  "origin_issues",
  "audr_commit",
  "audr_web_commit",
  "shipped_at",
]);
const FORBIDDEN_PUBLIC_STRINGS = [
  "shipper_should_implement",
  "none_already_shipped",
  "blocked_",
  "proposed_detection_surface",
  "origin_issue",
  "github.com/harshmaur/audr/issues",
];
const STATUS_ORDER: Record<CoverageStatus, number> = {
  shipped: 0,
  actionable: 1,
  investigating: 2,
};

export function validateCoverageSnapshot(raw: unknown, sourceLabel = "coverage-ledger"): CoverageSnapshot {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`${sourceLabel} must be an object`);
  }
  const obj = raw as Record<string, unknown>;
  rejectForbiddenPublicStrings(obj, sourceLabel);
  const generatedAt = requiredString(obj, "generated_at", sourceLabel);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(generatedAt) || Number.isNaN(Date.parse(generatedAt))) {
    throw new Error(`${sourceLabel}.generated_at must be UTC ISO timestamp ending in Z`);
  }
  const sourceLastDiscoveryAt = requiredString(obj, "source_last_discovery_at", sourceLabel);
  if (!isRealDate(sourceLastDiscoveryAt)) {
    throw new Error(`${sourceLabel}.source_last_discovery_at must be YYYY-MM-DD`);
  }
  for (const key of [
    "source_entry_count",
    "public_entry_count",
    "selected_triage_limit",
    "excluded_public_safe_candidate_count",
  ]) {
    if (!Number.isInteger(obj[key]) || (obj[key] as number) < 0) {
      throw new Error(`${sourceLabel}.${key} must be a non-negative integer`);
    }
  }
  if (!obj.excluded_status_counts || typeof obj.excluded_status_counts !== "object" || Array.isArray(obj.excluded_status_counts)) {
    throw new Error(`${sourceLabel}.excluded_status_counts must be an object`);
  }
  if (!Array.isArray(obj.entries) || obj.entries.length === 0) {
    throw new Error(`${sourceLabel}.entries must be a non-empty array`);
  }
  const seen = new Set<string>();
  const entries = obj.entries.map((entry, idx) => validateEntry(entry, `${sourceLabel}.entries[${idx}]`, seen));
  if (obj.public_entry_count !== entries.length) {
    throw new Error(`${sourceLabel}.public_entry_count must match entries.length`);
  }
  return obj as unknown as CoverageSnapshot;
}

export function loadCoverageSnapshot(): CoverageSnapshot {
  return validateCoverageSnapshot(coverageJson, "src/data/coverage-ledger.json");
}

export function publicCoverageEntries(snapshot: CoverageSnapshot): CoverageEntry[] {
  return [...snapshot.entries].sort(compareCoverageEntries);
}

export function shippedCoverageEntries(snapshot: CoverageSnapshot): CoverageEntry[] {
  return publicCoverageEntries(snapshot).filter((entry) => entry.status === "shipped");
}

export function selectedTriageEntries(snapshot: CoverageSnapshot, limit = 12): CoverageEntry[] {
  return publicCoverageEntries(snapshot)
    .filter((entry) => entry.status === "actionable" || entry.status === "investigating")
    .slice(0, limit);
}

export function latestCoverageEntries(entries: CoverageEntry[], limit: number): CoverageEntry[] {
  return [...entries]
    .sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at) || b.published_date.localeCompare(a.published_date) || b.cve_id.localeCompare(a.cve_id))
    .slice(0, limit);
}

export function coverageStats(snapshot: CoverageSnapshot): CoverageStats {
  const entries = publicCoverageEntries(snapshot);
  return {
    shippedLocalCheckCount: entries.filter((entry) => entry.status === "shipped").length,
    latestAdvisoryReviewed: entries.reduce((max, entry) => entry.last_seen_at > max ? entry.last_seen_at : max, "1970-01-01"),
    agentProductsRepresented: new Set(entries.map((entry) => `${entry.vendor.toLowerCase()}::${entry.product.toLowerCase()}`)).size,
    publicSnapshotUpdated: snapshot.generated_at.slice(0, 10),
  };
}

export function coverageStatusLabel(status: CoverageStatus): string {
  switch (status) {
    case "shipped":
      return "shipped local check";
    case "actionable":
      return "candidate local signal";
    case "investigating":
      return "under investigation";
  }
}

export function compareCoverageEntries(a: CoverageEntry, b: CoverageEntry): number {
  return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.published_date.localeCompare(a.published_date) || b.cve_id.localeCompare(a.cve_id);
}

function validateEntry(raw: unknown, sourceLabel: string, seen: Set<string>): CoverageEntry {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`${sourceLabel} must be an object`);
  }
  const obj = raw as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_ENTRY_KEYS.has(key)) throw new Error(`${sourceLabel} contains forbidden field ${key}`);
  }
  const cveId = requiredString(obj, "cve_id", sourceLabel);
  if (!/^CVE-\d{4}-\d{3,7}$/.test(cveId)) throw new Error(`${sourceLabel}.cve_id is invalid`);
  if (seen.has(cveId)) throw new Error(`${sourceLabel}.cve_id duplicates ${cveId}`);
  seen.add(cveId);
  const status = requiredString(obj, "status", sourceLabel) as CoverageStatus;
  if (!STATUSES.has(status)) throw new Error(`${sourceLabel}.status is invalid`);
  const severity = requiredString(obj, "severity", sourceLabel) as CoverageSeverity;
  if (!SEVERITIES.has(severity)) throw new Error(`${sourceLabel}.severity is invalid`);
  for (const key of ["vendor", "product", "local_signal_category", "summary_short"] as const) {
    const value = requiredString(obj, key, sourceLabel);
    if (value.toLowerCase() === "unknown") throw new Error(`${sourceLabel}.${key} must not be unknown`);
  }
  const publishedDate = requiredString(obj, "published_date", sourceLabel);
  const lastSeenAt = requiredString(obj, "last_seen_at", sourceLabel);
  if (!isRealDate(publishedDate)) throw new Error(`${sourceLabel}.published_date must be YYYY-MM-DD`);
  if (!isRealDate(lastSeenAt)) throw new Error(`${sourceLabel}.last_seen_at must be YYYY-MM-DD`);
  const nvdUrl = requiredString(obj, "nvd_url", sourceLabel);
  if (nvdUrl !== `https://nvd.nist.gov/vuln/detail/${cveId}`) throw new Error(`${sourceLabel}.nvd_url must match cve_id`);
  if (!Array.isArray(obj.keywords) || obj.keywords.some((keyword) => typeof keyword !== "string")) {
    throw new Error(`${sourceLabel}.keywords must be a string array`);
  }
  const summaryShort = obj.summary_short as string;
  if (summaryShort.length > 160 || /https?:\/\//.test(summaryShort) || /\s{2,}/.test(summaryShort)) {
    throw new Error(`${sourceLabel}.summary_short must be public-safe`);
  }
  if (status === "shipped") {
    const ruleId = requiredString(obj, "audr_rule_id", sourceLabel);
    if (!/^[a-z][a-z0-9-]+$/.test(ruleId)) throw new Error(`${sourceLabel}.audr_rule_id is invalid`);
  } else if (Object.hasOwn(obj, "audr_rule_id")) {
    throw new Error(`${sourceLabel}.audr_rule_id is only allowed on shipped rows`);
  }
  return obj as unknown as CoverageEntry;
}

function requiredString(obj: Record<string, unknown>, key: string, sourceLabel: string): string {
  if (typeof obj[key] !== "string" || (obj[key] as string).trim().length === 0) {
    throw new Error(`${sourceLabel}.${key} must be a non-empty string`);
  }
  return obj[key] as string;
}

function rejectForbiddenPublicStrings(value: unknown, sourceLabel: string): void {
  const serialized = JSON.stringify(value);
  for (const forbidden of FORBIDDEN_PUBLIC_STRINGS) {
    if (serialized.includes(forbidden)) {
      throw new Error(`${sourceLabel} contains forbidden internal string ${forbidden}`);
    }
  }
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
