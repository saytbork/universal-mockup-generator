#!/usr/bin/env bash
set -euo pipefail

# Builds locally and deploys prebuilt output to avoid remote build cache work.
# Requires: Vercel CLI auth already configured (or VERCEL_TOKEN in CI).

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

echo "[vercel] Pulling production project settings..."
vercel pull --yes --environment=production

echo "[vercel] Building locally..."
vercel build --prod

echo "[vercel] Deploying prebuilt output (no remote build cache upload)..."
vercel deploy --prebuilt --prod
