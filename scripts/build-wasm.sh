#!/usr/bin/env bash
# Build the audr WASM scan engine from the pinned audr submodule.
#
# Output:
#   public/wasm/audr.wasm       — the compiled scan engine
#   public/wasm/wasm_exec.js    — Go runtime shim, copied from $(go env GOROOT)
#
# Build SHAs:
#   The audr submodule SHA + tag are embedded into the blob via -ldflags so the
#   browser demo can display "Demo running audr@<sha8>".
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v go >/dev/null 2>&1; then
  echo "build-wasm: go is required. Install Go 1.22+ and re-run." >&2
  exit 1
fi

if [[ ! -d vendor/audr/internal ]]; then
  echo "build-wasm: vendor/audr submodule is empty. Run:" >&2
  echo "  git submodule update --init --recursive" >&2
  exit 1
fi

AUDR_SHA="$(git -C vendor/audr rev-parse HEAD)"
AUDR_TAG="$(git -C vendor/audr describe --tags --exact-match HEAD 2>/dev/null || echo "untagged")"

echo "build-wasm: audr@${AUDR_SHA:0:8} (${AUDR_TAG})"

mkdir -p public/wasm

# The wasm_exec.js shim location moved between Go releases.
# Try the modern path first, then legacy.
GOROOT="$(go env GOROOT)"
WASM_EXEC=""
for candidate in "$GOROOT/lib/wasm/wasm_exec.js" "$GOROOT/misc/wasm/wasm_exec.js"; do
  if [[ -f "$candidate" ]]; then
    WASM_EXEC="$candidate"
    break
  fi
done
if [[ -z "$WASM_EXEC" ]]; then
  echo "build-wasm: could not locate wasm_exec.js under $GOROOT" >&2
  exit 1
fi
cp "$WASM_EXEC" public/wasm/wasm_exec.js

# The wrapper imports audr's `internal/` packages, which Go only allows from
# code rooted under audr's module tree. Copy the wrapper into a sibling cmd/
# package inside the submodule (not committed to the submodule) and build
# from there.
WRAPPER_DIR="vendor/audr/cmd/audr-wasm"
mkdir -p "$WRAPPER_DIR"
cp scripts/wasm-src/main.go "$WRAPPER_DIR/main.go"

(
  cd vendor/audr
  GOOS=js GOARCH=wasm go build \
    -ldflags="-X main.audrSHA=${AUDR_SHA} -X main.audrTag=${AUDR_TAG}" \
    -o ../../public/wasm/audr.wasm \
    ./cmd/audr-wasm
)
SIZE_BYTES=$(stat -c%s public/wasm/audr.wasm 2>/dev/null || stat -f%z public/wasm/audr.wasm)
SIZE_KB=$((SIZE_BYTES / 1024))
echo "build-wasm: wrote public/wasm/audr.wasm (${SIZE_KB} KB uncompressed)"

# SHA-256 of the blob, surfaced in the demo's privacy line so visitors can
# verify what's running in their browser. Two outputs:
#   public/wasm/audr.wasm.sha256 — public, fetchable
#   src/generated/wasm-sha.txt   — read at Astro build time, inlined into HTML
WASM_SHA_HEX=""
if command -v sha256sum >/dev/null 2>&1; then
  WASM_SHA_HEX="$(sha256sum public/wasm/audr.wasm | awk '{print $1}')"
elif command -v shasum >/dev/null 2>&1; then
  WASM_SHA_HEX="$(shasum -a 256 public/wasm/audr.wasm | awk '{print $1}')"
fi
if [[ -n "$WASM_SHA_HEX" ]]; then
  echo "$WASM_SHA_HEX  audr.wasm" > public/wasm/audr.wasm.sha256
  mkdir -p src/generated
  printf '%s' "$WASM_SHA_HEX" > src/generated/wasm-sha.txt
  echo "build-wasm: SHA-256 ${WASM_SHA_HEX:0:12}…"
fi

if command -v brotli >/dev/null 2>&1; then
  brotli -f -o public/wasm/audr.wasm.br public/wasm/audr.wasm
  BR_BYTES=$(stat -c%s public/wasm/audr.wasm.br 2>/dev/null || stat -f%z public/wasm/audr.wasm.br)
  BR_KB=$((BR_BYTES / 1024))
  echo "build-wasm: brotli-compressed: ${BR_KB} KB (target: <3000 KB per office-hours spec)"
fi
