#!/usr/bin/env bash
# Prepare docs build inputs and browser tests without starting servers or publishing.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

npm ci
npm run test:setup
npm run source:prepare
npx --no-install playwright install chromium