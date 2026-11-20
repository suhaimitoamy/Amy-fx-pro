#!/usr/bin/env bash
# Amy FX Pro — Fast Baseline Initialization & Verification Script (Harness Primitive)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==> [Amy FX Pro] Working directory: $PWD"
echo "==> [Amy FX Pro] Node environment: $(node -v)"

echo "==> [Amy FX Pro] 1. Fast Syntax Validation..."
node --check app/src/main/assets/app.js
node --check app/src/main/assets/apps/shared/amy-gemini-live-bridge.js
node --check app/src/main/assets/apps/shared/journal-analytics-pro.js
node --check lib/twelvedata-key-pool.mjs
node --check tools/serve-local.mjs
echo "    ✓ Syntax validation clean (0 errors)"

echo "==> [Amy FX Pro] 2. Baseline Health Verification (Targeted Tests)..."
node --test tests/home-price-chart.test.mjs tests/journal-analytics-pro.test.mjs tests/twelvedata-key-pool.test.mjs
echo "    ✓ Baseline targeted tests passed"

echo "==> [Amy FX Pro] 3. Preview Server Command:"
echo "    node tools/serve-local.mjs (Default Preview: http://localhost:8080)"

if [ "${RUN_START_COMMAND:-0}" = "1" ]; then
  echo "==> [Amy FX Pro] Launching local preview server..."
  exec node tools/serve-local.mjs
fi
