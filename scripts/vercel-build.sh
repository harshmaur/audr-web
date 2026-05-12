#!/usr/bin/env bash
# Vercel buildCommand entrypoint. Sourced or executed — either way,
# it sets up the Go toolchain in the same shell that runs Bun.
#
# Stays as a single script (rather than `install-go && bun run build`)
# so PATH exported here is visible to the Bun sub-process.
set -euo pipefail

cd "$(dirname "$0")/.."

# Install Go into the build sandbox and prepend to PATH for this process.
# shellcheck source=./install-go.sh
source scripts/install-go.sh

bun run build
