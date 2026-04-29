#!/usr/bin/env bash
# Installs Go into the build sandbox so Vercel's runner can compile the
# audr WASM scan engine. Vercel's Amazon Linux 2 build image doesn't ship
# Go, but it permits arbitrary tarball downloads from go.dev.
#
# After this script runs, `go` is on PATH for the rest of the build.
# Idempotent — re-running on a warm cache is fast.
set -euo pipefail

GO_VERSION="${GO_VERSION:-1.22.5}"
GO_ROOT="${GO_ROOT:-$HOME/.cache/go-toolchain/$GO_VERSION}"

# Map runner arch to Go's tarball arch.
case "$(uname -m)" in
  x86_64|amd64) GO_ARCH="amd64" ;;
  aarch64|arm64) GO_ARCH="arm64" ;;
  *)
    echo "install-go: unsupported arch $(uname -m)" >&2
    exit 1 ;;
esac

case "$(uname -s)" in
  Linux)  GO_OS="linux" ;;
  Darwin) GO_OS="darwin" ;;
  *)
    echo "install-go: unsupported OS $(uname -s)" >&2
    exit 1 ;;
esac

if [[ ! -x "$GO_ROOT/bin/go" ]]; then
  mkdir -p "$GO_ROOT"
  TARBALL="go${GO_VERSION}.${GO_OS}-${GO_ARCH}.tar.gz"
  echo "install-go: fetching https://go.dev/dl/${TARBALL}"
  curl -fsSL "https://go.dev/dl/${TARBALL}" -o "/tmp/${TARBALL}"
  tar -C "$GO_ROOT" --strip-components=1 -xzf "/tmp/${TARBALL}"
  rm -f "/tmp/${TARBALL}"
fi

# Persist for the rest of the Vercel build (writes to $BASH_ENV when set,
# otherwise prepends to PATH for the current shell).
export PATH="$GO_ROOT/bin:$PATH"
if [[ -n "${BASH_ENV:-}" ]]; then
  echo "export PATH=\"$GO_ROOT/bin:\$PATH\"" >> "$BASH_ENV"
fi

go version
