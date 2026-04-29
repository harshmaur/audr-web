#!/usr/bin/env bash
# Vercel buildCommand entrypoint. Sourced or executed — either way,
# it sets up the Go toolchain in the same shell that runs npm.
#
# Stays as a single script (rather than `install-go && npm run build`)
# so PATH exported here is visible to the npm sub-process.
set -euo pipefail

cd "$(dirname "$0")/.."

# Install Go into the build sandbox and prepend to PATH for this process.
# shellcheck source=./install-go.sh
source scripts/install-go.sh

npm run build
