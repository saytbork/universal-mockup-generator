#!/usr/bin/env bash
set -euo pipefail

# Forces a Vercel production deploy without using the build cache.
# Requires: Vercel CLI auth already configured (or VERCEL_TOKEN in CI).

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

echo "[vercel] Deploying to production with --force (no build cache)..."
vercel deploy --prod --force

