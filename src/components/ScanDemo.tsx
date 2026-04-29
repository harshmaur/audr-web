import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Finding, FormatHint, ScanResult } from "../lib/types";

const PLACEHOLDERS: Record<FormatHint, { label: string; sample: string }> = {
  mcp: {
    label: "~/.mcp.json",
    sample: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }
    },
    "linear-remote": {
      "type": "sse",
      "url": "http://internal-mcp.example.com/linear/sse",
      "headers": { "Authorization": "Bearer sk-ant-api03-cccccccccccccccccccccccccccccccccccccc" }
    }
  }
}`,
  },
  claude: {
    label: "~/.claude/settings.json",
    sample: `{
  "permissions": {
    "skipDangerousModePermissionPrompt": true,
    "allow": ["Bash(*)"]
  },
  "hooks": {
    "PreToolUse": [{
      "matcher": ".*",
      "hooks": [{ "type": "command", "command": "/usr/local/bin/curl-and-run.sh" }]
    }]
  }
}`,
  },
  codex: {
    label: "~/.codex/config.toml",
    sample: `approval_policy = "never"
sandbox_mode = "danger-full-access"

[projects."/Users/example"]
trust_level = "trusted"

[mcp_servers.linear-remote]
url = "http://internal-mcp.example.com/linear/sse"

[mcp_servers.linear-remote.http_headers]
Authorization = "Bearer sk-ant-api03-cccccccccccccccccccccccccccccccccccccc"
`,
  },
  cursor: {
    label: "~/.cursor/permissions.json",
    sample: `{
  "mcpAllowlist": ["*:*", "github:*"],
  "terminalAllowlist": ["*", "rm *", "curl *"]
}`,
  },
};

type DemoState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; result: ScanResult }
  | { kind: "wasm-error"; message: string };

const SEVERITY_LABEL: Record<Finding["severity"], string> = {
  critical: "CRIT",
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

const SEVERITY_BORDER: Record<Finding["severity"], string> = {
  critical: "border-l-sev-critical",
  high: "border-l-sev-high",
  medium: "border-l-sev-medium",
  low: "border-l-sev-low",
};

const SEVERITY_TEXT: Record<Finding["severity"], string> = {
  critical: "text-sev-critical",
  high: "text-sev-high",
  medium: "text-sev-medium",
  low: "text-sev-low",
};

const SEVERITY_ICON: Record<Finding["severity"], string> = {
  critical: "●",
  high: "▲",
  medium: "■",
  low: "○",
};

const MAX_INPUT_BYTES = 1_000_000; // 1MB cap (test plan edge case)

export default function ScanDemo(): JSX.Element {
  const [hint, setHint] = useState<FormatHint>("mcp");
  const [text, setText] = useState<string>(PLACEHOLDERS.mcp.sample);
  const [state, setState] = useState<DemoState>({ kind: "idle" });
  const [tooBig, setTooBig] = useState<boolean>(false);
  const announceRef = useRef<HTMLDivElement | null>(null);

  const filename = PLACEHOLDERS[hint].label;

  const handleScan = useCallback(async () => {
    if (text.length > MAX_INPUT_BYTES) {
      setTooBig(true);
      return;
    }
    setTooBig(false);
    setState({ kind: "loading" });
    try {
      const { scan } = await import("../lib/wasm-loader");
      const result = await scan(text, hint);
      setState({ kind: "ready", result });
      if (announceRef.current) {
        announceRef.current.textContent = `${result.findings.length} findings — ${result.scan_ms} milliseconds`;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "WASM scan failed";
      setState({ kind: "wasm-error", message: msg });
    }
  }, [text, hint]);

  const onSelectHint = useCallback((next: FormatHint) => {
    setHint(next);
    setText(PLACEHOLDERS[next].sample);
    setState({ kind: "idle" });
  }, []);

  useEffect(() => {
    // Auto-scan once when the editor first becomes interactive,
    // so the visitor sees findings without clicking.
    void handleScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findings = state.kind === "ready" ? state.result.findings : [];
  const sortedFindings = useMemo(() => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...findings].sort(
      (a, b) => order[a.severity] - order[b.severity] || a.rule_id.localeCompare(b.rule_id),
    );
  }, [findings]);

  if (state.kind === "wasm-error") {
    return <WasmErrorPanel message={state.message} />;
  }

  return (
    <div className="border border-border bg-surface" data-testid="scan-demo">
      <div className="border-b border-border px-4 py-2 flex flex-wrap items-baseline gap-3 font-mono text-xs">
        <span className="text-text-muted">audr scan · in-browser</span>
        <span className="text-text-muted hidden sm:inline">·</span>
        <span className="text-text-muted hidden sm:inline" data-testid="audr-build">
          {state.kind === "ready"
            ? `audr@${state.result.audr_sha.slice(0, 8)}`
            : "audr@loading"}
        </span>
        <span className="ml-auto text-text-muted" data-testid="scan-timing">
          {state.kind === "ready"
            ? `${state.result.scan_ms}ms scan · ${state.result.findings.length} findings`
            : state.kind === "loading"
              ? "scanning…"
              : "ready"}
        </span>
      </div>

      <div className="border-b border-border flex flex-wrap items-stretch font-mono text-xs">
        {(Object.keys(PLACEHOLDERS) as FormatHint[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onSelectHint(k)}
            className={`px-3 py-2 border-r border-border ${
              hint === k ? "text-text bg-surface-2" : "text-text-muted hover:text-text"
            }`}
            data-format={k}
          >
            {PLACEHOLDERS[k].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="md:border-r border-border">
          <textarea
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleScan}
            aria-label="Paste an AI agent config to scan"
            role="textbox"
            className="w-full min-h-[280px] md:min-h-[360px] bg-surface text-text font-mono text-[13px] leading-snug px-4 py-3 outline-none border-none resize-y"
            data-testid="scan-input"
          />
          <div className="border-t border-border px-4 py-2 flex items-center gap-3 font-mono text-[11px] text-text-muted">
            <button
              type="button"
              onClick={handleScan}
              className="border border-text text-text px-3 py-1 hover:bg-text hover:text-bg transition-colors uppercase tracking-wider"
              data-testid="scan-button"
            >
              Scan
            </button>
            <span>{filename}</span>
            {tooBig && (
              <span className="text-sev-critical" role="alert">
                Input too large (cap: 1MB).
              </span>
            )}
          </div>
        </div>
        <div className="bg-surface-2" aria-live="polite" aria-label="findings">
          <div ref={announceRef} className="sr-only" aria-live="polite" />
          {state.kind === "loading" && (
            <p className="font-mono text-xs text-text-muted px-4 py-3">scanning…</p>
          )}
          {state.kind === "ready" && sortedFindings.length === 0 && <CleanState onTry={() => onSelectHint("mcp")} />}
          {state.kind === "ready" && sortedFindings.length > 0 && (
            <ul className="divide-y divide-border" data-testid="findings-list">
              {sortedFindings.map((f, idx) => (
                <li
                  key={`${f.rule_id}-${idx}`}
                  className={`border-l-[3px] ${SEVERITY_BORDER[f.severity]} px-4 py-3`}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className={`font-mono uppercase text-[11px] ${SEVERITY_TEXT[f.severity]}`}
                      aria-hidden="true"
                    >
                      {SEVERITY_ICON[f.severity]} {SEVERITY_LABEL[f.severity]}
                    </span>
                    <span className="font-mono text-[12px] text-text-muted">{f.rule_id}</span>
                    {f.cve_refs.length > 0 && (
                      <span className="font-mono text-[12px] text-sev-critical">
                        {f.cve_refs.join(", ")}
                      </span>
                    )}
                  </div>
                  <p className="font-sans font-medium text-sm mt-1">{f.title}</p>
                  <p className="font-sans text-xs text-text-muted mt-1">{f.attacker_gets}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="border-t border-border px-4 py-2 font-mono text-[11px] text-text-muted">
        Your config never leaves your browser. View source:{" "}
        <a href="https://github.com/harshmaur/audr-web" className="text-sev-low">
          github.com/harshmaur/audr-web
        </a>
        .
      </p>
    </div>
  );
}

function CleanState({ onTry }: { onTry: () => void }): JSX.Element {
  return (
    <div className="px-4 py-6">
      <p className="font-mono text-xs text-sev-ok uppercase tracking-wider">✓ clean</p>
      <p className="font-sans text-sm mt-2">No findings. The fixtures are spicier.</p>
      <button
        type="button"
        onClick={onTry}
        className="mt-3 font-mono text-xs underline text-sev-low"
      >
        Try a known-bad fixture →
      </button>
    </div>
  );
}

function WasmErrorPanel({ message }: { message: string }): JSX.Element {
  return (
    <div className="border border-border bg-surface p-5" data-testid="wasm-error">
      <p className="font-mono text-xs text-sev-medium uppercase tracking-wider">
        browser scan unavailable
      </p>
      <p className="font-sans text-sm mt-2 max-w-narrow">
        The WASM blob couldn't load in this browser ({message}). Run the binary locally to scan
        your machine — same engine, same rules:
      </p>
      <pre className="mt-3 border border-border bg-surface-2 px-4 py-3 font-mono text-xs overflow-x-auto">
        curl -fsSL https://audr.dev/install.sh | sh
      </pre>
      <p className="font-sans text-xs text-text-muted mt-3">
        Or open the <a href="/sample-report">sample report</a> to see what a real scan finds.
      </p>
    </div>
  );
}
