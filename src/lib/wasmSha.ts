// Reads the SHA-256 of public/wasm/audr.wasm at Astro build time.
// Written by scripts/build-wasm.sh into src/generated/wasm-sha.txt.
// In dev mode (no build), returns "unknown" so the privacy line silently
// omits the hash rather than rendering a broken value.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SHA_PATH = resolve(process.cwd(), "src/generated/wasm-sha.txt");

export function getWasmSha(): string {
  try {
    if (!existsSync(SHA_PATH)) return "unknown";
    const v = readFileSync(SHA_PATH, "utf8").trim();
    if (/^[0-9a-f]{64}$/i.test(v)) return v.toLowerCase();
  } catch {
    /* dev-mode fallback */
  }
  return "unknown";
}
