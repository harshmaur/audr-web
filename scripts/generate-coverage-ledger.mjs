import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourcePath = process.env.COVERAGE_LEDGER_SOURCE
  ? path.resolve(process.env.COVERAGE_LEDGER_SOURCE)
  : path.resolve(root, "../agentguard/docs/cve-triage-ledger.json");
const cvesPath = path.resolve(root, "src/data/cves.json");
const outputPath = path.resolve(root, "src/data/coverage-ledger.json");

const ALLOWED_STATUSES = new Set(["shipped", "actionable", "investigating"]);
const ALLOWED_SEVERITIES = new Set(["critical", "high", "medium", "low"]);
const FORBIDDEN_KEYS = new Set([
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
const FORBIDDEN_STRINGS = [
  "shipper_should_implement",
  "none_already_shipped",
  "blocked_",
  "proposed_detection_surface",
  "origin_issue",
  "github.com/harshmaur/audr/issues",
];

function readJson(file) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing ${file}. Set COVERAGE_LEDGER_SOURCE=/path/to/cve-triage-ledger.json if the agentguard checkout is elsewhere.`,
    );
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function publicDate(value) {
  if (typeof value !== "string") return "";
  const date = value.slice(0, 10);
  return isRealDate(date) ? date : "";
}

function validCve(id) {
  return typeof id === "string" && /^CVE-\d{4}-\d{3,7}$/.test(id);
}

function nvdUrl(cveId) {
  return `https://nvd.nist.gov/vuln/detail/${cveId}`;
}

function collapseSummary(value) {
  const cleaned = String(value ?? "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (cleaned.length <= 160) return cleaned;
  const cut = cleaned.slice(0, 157);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 100 ? lastSpace : 157).trim()}…`;
}

function localSignalCategory(surface, fallback = "needs research") {
  const text = String(surface ?? "").toLowerCase();
  if (/symlink|canonicalization|filesystem/.test(text)) return "workspace filesystem";
  if (/source checkout|source tree|source file|source pattern|innerhtml|javascript source|html source|browser source/.test(text)) {
    return "source code";
  }
  if (/lockfile|package|dependency|npm|pip|python dependency|manifest/.test(text)) return "dependency manifest";
  if (/mcp/.test(text)) return "MCP server config";
  if (/permission|approval|scope|trust|auth|token|credential|bearer/.test(text)) return "permissions/trust config";
  if (/hook|plugin/.test(text)) return "plugin/hook config";
  if (/config|env|dotenv|workspace/.test(text)) return "agent config";
  return fallback;
}

function localSignalFromRule(ruleId) {
  if (/symlink|filesystem/.test(ruleId)) return "workspace filesystem";
  if (/mcp/.test(ruleId)) return "MCP server config";
  if (/hook|plugin/.test(ruleId)) return "plugin/hook config";
  if (/package|version|openclaw|praison|roo|continue/.test(ruleId)) return "dependency manifest";
  if (/auth|token|scope|trust|permission|approval/.test(ruleId)) return "permissions/trust config";
  return "agent config";
}

function compareEntries(a, b) {
  const statusOrder = { shipped: 0, actionable: 1, investigating: 2 };
  return (
    statusOrder[a.status] - statusOrder[b.status] ||
    b.published_date.localeCompare(a.published_date) ||
    b.cve_id.localeCompare(a.cve_id)
  );
}

function assertPublicEntry(entry) {
  if (!validCve(entry.cve_id)) throw new Error(`bad cve_id: ${entry.cve_id}`);
  if (entry.nvd_url !== nvdUrl(entry.cve_id)) throw new Error(`bad nvd_url for ${entry.cve_id}`);
  if (!ALLOWED_STATUSES.has(entry.status)) throw new Error(`bad status for ${entry.cve_id}`);
  if (!ALLOWED_SEVERITIES.has(entry.severity)) throw new Error(`bad severity for ${entry.cve_id}`);
  if (!entry.vendor || entry.vendor === "unknown" || !entry.product || entry.product === "unknown") {
    throw new Error(`unknown vendor/product for ${entry.cve_id}`);
  }
  if (!isRealDate(entry.published_date) || !isRealDate(entry.last_seen_at)) {
    throw new Error(`bad dates for ${entry.cve_id}`);
  }
  if (!entry.local_signal_category || entry.local_signal_category === "needs research") {
    throw new Error(`bad local signal for ${entry.cve_id}`);
  }
  if (!entry.summary_short || entry.summary_short.length > 160 || /https?:\/\//.test(entry.summary_short)) {
    throw new Error(`bad summary_short for ${entry.cve_id}`);
  }
  if (entry.status === "shipped" && !entry.audr_rule_id) {
    throw new Error(`shipped row missing audr_rule_id: ${entry.cve_id}`);
  }
  if (entry.status !== "shipped" && Object.hasOwn(entry, "audr_rule_id")) {
    throw new Error(`candidate row must not include audr_rule_id: ${entry.cve_id}`);
  }
  for (const key of Object.keys(entry)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error(`forbidden key ${key} on ${entry.cve_id}`);
  }
}

const ledger = readJson(sourcePath);
const sourceEntries = Array.isArray(ledger.entries) ? ledger.entries : [];
const cves = readJson(cvesPath);
if (!Array.isArray(cves) || cves.length === 0) throw new Error("src/data/cves.json must be non-empty");

const sourceById = new Map(sourceEntries.filter((e) => validCve(e.cve_id)).map((e) => [e.cve_id, e]));
const emitted = new Map();
const excludedStatusCounts = {};
let excludedUnknownVendorProductCount = 0;
let excludedUnknownSeverityCount = 0;
let enrichedFromCvesJsonCount = 0;

function emit(entry) {
  assertPublicEntry(entry);
  if (emitted.has(entry.cve_id)) throw new Error(`duplicate public CVE row: ${entry.cve_id}`);
  emitted.set(entry.cve_id, entry);
}

for (const cve of cves) {
  const source = sourceById.get(cve.cve_id) ?? {};
  const surface = source.proposed_detection_surface;
  const row = {
    cve_id: cve.cve_id,
    status: "shipped",
    severity: cve.severity,
    vendor: cve.vendor,
    product: cve.product,
    published_date: publicDate(cve.published_date),
    last_seen_at: publicDate(source.last_seen_at) || publicDate(cve.published_date),
    keywords: Array.isArray(source.keywords) ? source.keywords.slice(0, 4) : [cve.product],
    local_signal_category: localSignalCategory(surface, localSignalFromRule(cve.audr_rule_id)),
    nvd_url: nvdUrl(cve.cve_id),
    summary_short: collapseSummary(cve.summary_short),
    audr_rule_id: cve.audr_rule_id,
  };
  if (sourceById.has(cve.cve_id)) enrichedFromCvesJsonCount += 1;
  emit(row);
}

for (const raw of sourceEntries) {
  if (!validCve(raw.cve_id) || emitted.has(raw.cve_id)) continue;
  const status = raw.status;
  if (!ALLOWED_STATUSES.has(status)) {
    const publicStatusKey = String(status ?? "missing").startsWith("blocked_") ? "blocked" : (status ?? "missing");
    excludedStatusCounts[publicStatusKey] = (excludedStatusCounts[publicStatusKey] ?? 0) + 1;
    continue;
  }
  if (!ALLOWED_SEVERITIES.has(raw.severity)) {
    excludedUnknownSeverityCount += 1;
    continue;
  }
  if (!raw.vendor || raw.vendor === "unknown" || !raw.product || raw.product === "unknown") {
    excludedUnknownVendorProductCount += 1;
    continue;
  }
  const publishedDate = publicDate(raw.published_date);
  const lastSeenAt = publicDate(raw.last_seen_at);
  if (!publishedDate || !lastSeenAt) continue;
  const sourceSignal = localSignalCategory(raw.proposed_detection_surface);
  if (sourceSignal === "needs research") continue;
  const row = {
    cve_id: raw.cve_id,
    status,
    severity: raw.severity,
    vendor: raw.vendor,
    product: raw.product,
    published_date: publishedDate,
    last_seen_at: lastSeenAt,
    keywords: Array.isArray(raw.keywords) ? raw.keywords.slice(0, 4) : [],
    local_signal_category: sourceSignal,
    nvd_url: nvdUrl(raw.cve_id),
    summary_short: collapseSummary(raw.summary),
    ...(status === "shipped" ? { audr_rule_id: raw.audr_rule_id } : {}),
  };
  if (status === "shipped") emit(row);
}

const candidates = sourceEntries
  .filter((raw) => !emitted.has(raw.cve_id))
  .filter((raw) => raw.status === "actionable" || raw.status === "investigating")
  .map((raw) => {
    if (!validCve(raw.cve_id)) return null;
    if (!ALLOWED_SEVERITIES.has(raw.severity)) return null;
    if (!raw.vendor || raw.vendor === "unknown" || !raw.product || raw.product === "unknown") return null;
    const publishedDate = publicDate(raw.published_date);
    const lastSeenAt = publicDate(raw.last_seen_at);
    if (!publishedDate || !lastSeenAt) return null;
    const signal = localSignalCategory(raw.proposed_detection_surface);
    if (signal === "needs research") return null;
    const row = {
      cve_id: raw.cve_id,
      status: raw.status,
      severity: raw.severity,
      vendor: raw.vendor,
      product: raw.product,
      published_date: publishedDate,
      last_seen_at: lastSeenAt,
      keywords: Array.isArray(raw.keywords) ? raw.keywords.slice(0, 4) : [],
      local_signal_category: signal,
      nvd_url: nvdUrl(raw.cve_id),
      summary_short: collapseSummary(raw.summary),
    };
    assertPublicEntry(row);
    return row;
  })
  .filter(Boolean)
  .sort(compareEntries)
  .slice(0, 12);

for (const row of candidates) emit(row);

const entries = [...emitted.values()].sort(compareEntries);
const latestSeen = entries.reduce((max, entry) => entry.last_seen_at > max ? entry.last_seen_at : max, "1970-01-01");
const snapshot = {
  generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  source_last_discovery_at: latestSeen,
  source_entry_count: sourceEntries.length,
  public_entry_count: entries.length,
  selected_triage_limit: 12,
  excluded_public_safe_candidate_count: sourceEntries.length - entries.length,
  excluded_status_counts: excludedStatusCounts,
  excluded_unknown_vendor_product_count: excludedUnknownVendorProductCount,
  excluded_unknown_severity_count: excludedUnknownSeverityCount,
  enriched_from_cves_json_count: enrichedFromCvesJsonCount,
  entries,
};

const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
for (const forbidden of FORBIDDEN_STRINGS) {
  if (serialized.includes(forbidden)) throw new Error(`serialized output leaked internal string: ${forbidden}`);
}
for (const entry of entries) assertPublicEntry(entry);

fs.writeFileSync(outputPath, serialized);
console.log(JSON.stringify({
  source_entry_count: sourceEntries.length,
  public_entry_count: entries.length,
  shipped_count: entries.filter((entry) => entry.status === "shipped").length,
  selected_candidate_count: entries.filter((entry) => entry.status !== "shipped").length,
  excluded_unknown_vendor_product_count: excludedUnknownVendorProductCount,
  excluded_status_counts: excludedStatusCounts,
  enriched_from_cves_json_count: enrichedFromCvesJsonCount,
}, null, 2));
