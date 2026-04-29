#!/usr/bin/env sh
# audr.dev install wrapper
#
# This script is what visitors curl from audr.dev. It tags the install with
# AUDR_INSTALL_FROM=audr.dev (a single User-Agent header on the tarball
# download — opt-out via AUDR_NO_REFERRER=1) and execs the canonical
# installer that lives in the audr OSS repo. Update the canonical version by
# bumping AUDR_DEFAULT_VERSION below as audr ships releases.
#
# Privacy: no other telemetry. Inspect the source at
#   https://github.com/harshmaur/audr-web/blob/main/public/install.sh

set -eu

AUDR_DEFAULT_VERSION="${VERSION:-latest}"
CANONICAL="https://raw.githubusercontent.com/harshmaur/audr/main/install.sh"

if [ "${AUDR_NO_REFERRER:-}" != "1" ]; then
  AUDR_INSTALL_FROM="audr.dev"
  export AUDR_INSTALL_FROM
fi

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$CANONICAL" | sh -s -- --version "$AUDR_DEFAULT_VERSION" "$@"
elif command -v wget >/dev/null 2>&1; then
  wget -qO- "$CANONICAL" | sh -s -- --version "$AUDR_DEFAULT_VERSION" "$@"
else
  echo "audr.dev install: curl or wget is required" >&2
  exit 1
fi
