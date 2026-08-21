// Command audr-wasm wraps audr's parser + rule registry as a single
// `scan(text, formatHint?)` function exposed to JavaScript via syscall/js.
//
// Build:
//   GOOS=js GOARCH=wasm go build -ldflags="-X main.audrSHA=$SHA" -o audr.wasm .
//
// The wasm_exec.js runtime ships with the Go toolchain at
// $(go env GOROOT)/lib/wasm/wasm_exec.js. The build script copies it next
// to the .wasm so the browser can boot the runtime.
//
//go:build js && wasm

package main

import (
	"encoding/json"
	"strings"
	"syscall/js"
	"time"

	"github.com/harshmaur/audr/internal/finding"
	"github.com/harshmaur/audr/internal/parse"
	"github.com/harshmaur/audr/internal/rules"
	_ "github.com/harshmaur/audr/internal/rules/builtin"
)

// audrSHA is the audr submodule commit the WASM blob was compiled from.
// Overridden at build time via -ldflags="-X main.audrSHA=<sha>".
var audrSHA = "dev"

// audrTag is the audr submodule release tag (e.g. "v0.3.1").
// Overridden at build time via -ldflags="-X main.audrTag=<tag>".
var audrTag = "dev"

type wasmFinding struct {
	RuleID       string   `json:"rule_id"`
	Severity     string   `json:"severity"`
	Title        string   `json:"title"`
	AttackerGets string   `json:"attacker_gets"`
	Excerpt      string   `json:"excerpt"`
	Line         int      `json:"line"`
	CVERefs      []string `json:"cve_refs"`
}

type wasmResult struct {
	Findings       []wasmFinding `json:"findings"`
	FormatDetected string        `json:"format_detected"`
	AudrSHA        string        `json:"audr_sha"`
	AudrTag        string        `json:"audr_tag"`
	ScanMS         int64         `json:"scan_ms"`
}

// cveByRule maps audr rule IDs to the CVE refs we want to surface in the
// browser demo. Hand-curated; the spec calls these out in the WASM API
// contract. Add entries here as new CVEs land — the audr finding type
// itself doesn't carry CVE refs because not every finding is CVE-anchored.
var cveByRule = map[string][]string{
	"claude-hook-shell-rce":                               {"CVE-2025-59536"},
	"claude-skip-permission-prompt":                       {"CVE-2025-59536"},
	"claude-mcp-auto-approve":                             {"CVE-2025-59536"},
	"cursor-agent-sandbox-working-directory-escape":       {"CVE-2026-50548"},
	"kiota-plugin-static-template-traversal":              {"CVE-2026-59864"},
	"langflow-toolguard-code-injection":                   {"CVE-2026-9135"},
	"mcp-memory-service-document-api-unauth":              {"CVE-2026-50027"},
	"openclaw-interpreter-startup-env-filtering":          {"CVE-2026-62199"},
	"openclaw-dashboard-notification-username-stored-xss": {"CVE-2026-66418"},
	"siyuan-anonymous-publish-mcp-admin-bypass":           {"CVE-2026-66012"},
}

// formatHintToPath returns a synthetic file path so audr's filename-based
// format detector picks the right parser. The path is never read from disk.
func formatHintToPath(hint string) string {
	switch strings.ToLower(strings.TrimSpace(hint)) {
	case "claude", "claude-settings":
		return "/synth/.claude/settings.json"
	case "codex", "codex-config":
		return "/synth/.codex/config.toml"
	case "cursor", "cursor-permissions":
		return "/synth/.cursor/permissions.json"
	case "cursor-app", "cursor-app-package":
		return "/synth/cursor/resources/app/package.json"
	case "package", "package-json", "npm":
		return "/synth/package.json"
	case "mcp", "mcp-config":
		return "/synth/.mcp.json"
	case "openapi", "swagger", "kiota", "kiota-openapi-spec":
		return "/synth/openapi.yaml"
	case "requirements", "requirements-txt", "pypi":
		return "/synth/requirements.txt"
	case "mrmustard", "mrmustard-pypi":
		return "/synth/venv/lib/python3.12/site-packages/mrmustard/__init__.py"
	case "cfgzen", "cfgzen-pypi":
		return "/synth/venv/lib/python3.12/site-packages/cfgzen/_native.so"
	case "amazon-inspector-npm-malware", "amazon-inspector-malware":
		return "/synth/node_modules/chalk-utils/postinstall.js"
	case "amazon-inspector-streak-core-math", "amazon-inspector-streak":
		return "/synth/node_modules/streak-core-math/index.mjs"
	case "amazon-inspector-streak-daily-lib":
		return "/synth/node_modules/streak-daily-lib/index.mjs"
	case "amazon-inspector-streak-core-lib":
		return "/synth/node_modules/streak-core-lib/index.mjs"
	case "amazon-inspector-streak-day-utils":
		return "/synth/node_modules/streak-day-utils/index.mjs"
	case "amazon-inspector-agentcli", "amazon-inspector-yancyyu-agentcli":
		return "/synth/node_modules/@yancyyu/agentcli/bin/hermit.mjs"
	case "amazon-inspector-app-soda-layer":
		return "/synth/node_modules/app-soda-layer/test.js"
	case "amazon-inspector-sigchain-js":
		return "/synth/node_modules/sigchain-js/dist/sigchain-js.esm.js"
	case "amazon-inspector-chain-analyze":
		return "/synth/node_modules/chain-analyze/dist/sigchain-js.esm.js"
	case "amazon-inspector-claude-remote-agent":
		return "/synth/node_modules/claude-remote-agent/agent.js"
	case "amazon-inspector-llm-interceptor":
		return "/synth/node_modules/llm-interceptor/defaults.json"
	case "amazon-inspector-map-streak-kit", "amazon-inspector-redshell":
		return "/synth/node_modules/map-streak-kit/dist/index.mjs"
	case "amazon-inspector-kit-vim-map":
		return "/synth/node_modules/kit-vim-map/dist/internal/calc-math.dat"
	case "amazon-inspector-kit-map-vim":
		return "/synth/node_modules/kit-map-vim/dist/index.mjs"
	case "amazon-inspector-w-screenctl", "amazon-inspector-wscreenctl":
		return "/synth/node_modules/w-screenctl/src/WScreenctl.mjs"
	case "amazon-inspector-aclade-agent", "amazon-inspector-aclade":
		return "/synth/node_modules/aclade-agent/dist/index.js"
	case "amazon-inspector-agenthub-ai", "amazon-inspector-agenthub":
		return "/synth/node_modules/agenthub-ai/dist-publish/main.js"
	case "amazon-inspector-guangnao-agent-proxy", "amazon-inspector-agent-proxy":
		return "/synth/node_modules/@guangnao/agent-proxy/dist/cli.js"
	case "amazon-inspector-core-tailwindcss-utility", "amazon-inspector-core-tailwind":
		return "/synth/node_modules/core-tailwindcss-utility/index.js"
	case "amazon-inspector-bcc-design":
		return "/synth/node_modules/bcc-design/notify.js"
	case "amazon-inspector-bcc-design-icons":
		return "/synth/node_modules/bcc-design-icons/notify.js"
	case "amazon-inspector-setup-codex":
		return "/synth/node_modules/setup-codex/lib/report.js"
	case "amazon-inspector-expect-dotenv":
		return "/synth/node_modules/expect-dotenv/lib/workers/plugin.worker.js"
	case "amazon-inspector-httttt-mcp-demo", "amazon-inspector-mcp-demo":
		return "/synth/node_modules/@httttt/mcp-demo/dist/index.js"
	case "amazon-inspector-mcp-dev-toolkit":
		return "/synth/node_modules/mcp-dev-toolkit/c2_exfil.js"
	case "amazon-inspector-express-session-handler":
		return "/synth/node_modules/express-session-handler/index.js"
	case "amazon-inspector-uibabai":
		return "/synth/node_modules/uibabai/index.js"
	case "amazon-inspector-simple-date-formatter", "amazon-inspector-simple-date":
		return "/synth/node_modules/simple-date-formatter-new-9/package.json"
	case "amazon-inspector-cryptostock":
		return "/synth/node_modules/cryptostock/index.js"
	case "amazon-inspector-notafollower":
		return "/synth/node_modules/notafollower/package.json"
	case "amazon-inspector-depcruise":
		return "/synth/node_modules/depcruise-wrap-stream-in-html/package.json"
	case "amazon-inspector-pfp-forms":
		return "/synth/node_modules/pfp-forms-sme-loan/_bridge.js"
	case "amazon-inspector-checkout-desktop":
		return "/synth/node_modules/checkout-desktop-total/_platform.js"
	case "telekom-ods-react-ui-kit", "telekom-ods-malware":
		return "/synth/node_modules/@telekom-ods/react-ui-kit/package.json"
	case "openclaw-dashboard", "openclaw-dashboard-source":
		return "/synth/openclaw-dashboard/index.html"
	case "siyuan", "siyuan-config":
		return "/synth/.siyuan/conf.json"
	default:
		return ""
	}
}

// guessFormatPath inspects the input text to pick a synthetic path when the
// caller didn't pass a hint. Heuristic, not authoritative.
func guessFormatPath(text string) string {
	t := strings.TrimSpace(text)
	lower := strings.ToLower(t)
	switch {
	case strings.Contains(lower, "/api/notifications") &&
		strings.Contains(lower, "notifpanelbody") &&
		(strings.Contains(lower, "notificons") ||
			strings.Contains(lower, "notiflastseen") ||
			strings.Contains(lower, "notificationbell") ||
			strings.Contains(lower, "agent dashboard")):
		return "/synth/openclaw-dashboard/index.html"
	case strings.HasPrefix(t, "{"):
		switch {
		case strings.Contains(t, `"openapi"`) || strings.Contains(t, `"swagger"`):
			return "/synth/openapi.json"
		case strings.Contains(t, `"kernelVersion"`) && strings.Contains(t, `"publish"`):
			return "/synth/.siyuan/conf.json"
		case strings.Contains(t, `"mcpServers"`):
			return "/synth/.mcp.json"
		case strings.Contains(t, `"mcpAllowlist"`) || strings.Contains(t, `"terminalAllowlist"`):
			return "/synth/.cursor/permissions.json"
		case strings.Contains(t, `"hooks"`) || strings.Contains(t, `"permissions"`):
			return "/synth/.claude/settings.json"
		default:
			return "/synth/.mcp.json"
		}
	case strings.HasPrefix(t, "openapi:") || strings.HasPrefix(t, "swagger:"):
		return "/synth/openapi.yaml"
	case strings.Contains(t, "approval_policy") || strings.Contains(t, "[mcp_servers"):
		return "/synth/.codex/config.toml"
	default:
		return ""
	}
}

func severityString(s finding.Severity) string {
	switch s {
	case finding.SeverityCritical:
		return "critical"
	case finding.SeverityHigh:
		return "high"
	case finding.SeverityMedium:
		return "medium"
	case finding.SeverityLow:
		return "low"
	}
	return "unknown"
}

func toWASMFinding(f finding.Finding) wasmFinding {
	refs := cveByRule[f.RuleID]
	if refs == nil {
		refs = []string{}
	}
	return wasmFinding{
		RuleID:       f.RuleID,
		Severity:     severityString(f.Severity),
		Title:        f.Title,
		AttackerGets: f.Description,
		Excerpt:      f.Match,
		Line:         f.Line,
		CVERefs:      refs,
	}
}

// scanText runs the configured parser + every applicable rule against the
// input. Returns a JSON-marshalled wasmResult (string) so the JS side has a
// single stable contract regardless of how syscall/js reshapes nested
// values.
func scanText(text, formatHint string) string {
	start := time.Now()

	path := formatHintToPath(formatHint)
	if path == "" {
		path = guessFormatPath(text)
	}
	if path == "" {
		// Last resort: assume mcp.json. The parser will return a parse
		// error if it isn't, which we surface as zero findings.
		path = "/synth/.mcp.json"
	}

	doc := parse.Parse(path, []byte(text))
	var fs []finding.Finding
	if doc != nil {
		fs = rules.Apply(doc)
	}

	out := wasmResult{
		Findings:       make([]wasmFinding, 0, len(fs)),
		FormatDetected: string(doc.Format),
		AudrSHA:        audrSHA,
		AudrTag:        audrTag,
	}
	for _, f := range fs {
		out.Findings = append(out.Findings, toWASMFinding(f))
	}
	out.ScanMS = time.Since(start).Milliseconds()

	b, err := json.Marshal(out)
	if err != nil {
		errOut, _ := json.Marshal(map[string]string{"error": err.Error()})
		return string(errOut)
	}
	return string(b)
}

func scanFunc(this js.Value, args []js.Value) any {
	if len(args) < 1 || args[0].Type() != js.TypeString {
		errOut, _ := json.Marshal(map[string]string{"error": "audrScan(text, formatHint?) requires a string text"})
		return string(errOut)
	}
	text := args[0].String()
	hint := ""
	if len(args) >= 2 && args[1].Type() == js.TypeString {
		hint = args[1].String()
	}
	return scanText(text, hint)
}

func versionFunc(this js.Value, args []js.Value) any {
	b, _ := json.Marshal(map[string]string{
		"audr_sha": audrSHA,
		"audr_tag": audrTag,
	})
	return string(b)
}

func main() {
	js.Global().Set("audrScan", js.FuncOf(scanFunc))
	js.Global().Set("audrVersion", js.FuncOf(versionFunc))
	// Keep the program alive so the JS side can call the exported funcs.
	select {}
}
