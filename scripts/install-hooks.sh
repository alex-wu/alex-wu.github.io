#!/usr/bin/env bash
# install-hooks.sh — activates the versioned hooks in .githooks/.
# Idempotent. Run once after cloning.

set -e

cd "$(dirname "$0")/.."

if [[ ! -d .githooks ]]; then
  echo "✗ .githooks/ directory not found. Are you in the repo root?" >&2
  exit 1
fi

git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null || true

echo "✓ Hooks active (core.hooksPath = .githooks)."
echo "  Installed: $(ls .githooks/ | tr '\n' ' ')"
echo ""
echo "  Verify:    git config core.hooksPath"
echo "  Disable:   git config --unset core.hooksPath"
