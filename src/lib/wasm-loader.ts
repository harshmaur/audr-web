// Lazy WASM loader for the audr scan engine.
//
// The .wasm blob and Go's wasm_exec.js shim live under /wasm/. Both are
// loaded dynamically, on first user interaction, so they don't bloat the
// initial JS bundle.

import type { ScanResult } from "./types";

declare global {
  interface Window {
    Go?: new () => GoInstance;
    audrScan?: (text: string, formatHint?: string) => string;
    audrVersion?: () => string;
  }
}

interface GoInstance {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): Promise<void>;
}

let bootPromise: Promise<void> | null = null;

async function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-audr-src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.audrLoaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`failed to load ${src}`)), {
        once: true,
      });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.audrSrc = src;
    s.addEventListener("load", () => {
      s.dataset.audrLoaded = "true";
      resolve();
    });
    s.addEventListener("error", () => reject(new Error(`failed to load ${src}`)));
    document.head.appendChild(s);
  });
}

export async function bootWasm(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("bootWasm: not in a browser");
  }
  if (typeof window.audrScan === "function") return;
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    if (typeof WebAssembly === "undefined") {
      throw new Error("WebAssembly is not available in this browser");
    }
    await loadScript("/wasm/wasm_exec.js");
    if (!window.Go) {
      throw new Error("wasm_exec.js loaded but Go shim was not registered");
    }
    const go = new window.Go();
    const wasmResp = await fetch("/wasm/audr.wasm");
    if (!wasmResp.ok) {
      throw new Error(`wasm fetch failed: ${wasmResp.status}`);
    }
    const { instance } = await WebAssembly.instantiateStreaming(wasmResp, go.importObject).catch(
      async () => {
        // Older browsers lack instantiateStreaming with non-application/wasm MIME.
        // Fall back to ArrayBuffer.
        const buf = await (await fetch("/wasm/audr.wasm")).arrayBuffer();
        return WebAssembly.instantiate(buf, go.importObject);
      },
    );
    void go.run(instance);
    // Give Go's main() a tick to register window.audrScan.
    for (let i = 0; i < 20; i++) {
      if (typeof window.audrScan === "function") return;
      await new Promise((r) => setTimeout(r, 25));
    }
    throw new Error("audrScan was not registered after WASM boot");
  })();

  try {
    await bootPromise;
  } catch (err) {
    bootPromise = null;
    throw err;
  }
}

export async function scan(text: string, formatHint?: string): Promise<ScanResult> {
  await bootWasm();
  if (typeof window.audrScan !== "function") {
    throw new Error("audrScan unavailable after boot");
  }
  const raw = window.audrScan(text, formatHint ?? "");
  return JSON.parse(raw) as ScanResult;
}
