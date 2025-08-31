#!/usr/bin/env bash
set -euo pipefail
# Clean DerivedData, Pods, and reinstall to resolve module map issues.
APP_DIR="$(cd "$(dirname "$0")/App" && pwd)"
DERIVED=~/Library/Developer/Xcode/DerivedData

echo "[iOS Clean] Removing DerivedData entries for App workspace..."
find "$DERIVED" -maxdepth 1 -type d -name 'App-*' -prune -exec rm -rf {} + || true

cd "$APP_DIR"

echo "[iOS Clean] Removing Pods & lockfile..."
rm -rf Pods Podfile.lock App.xcworkspace

echo "[iOS Clean] Installing Pods (static frameworks)..."
pod install

echo "[iOS Clean] Done. Open workspace with: xed App.xcworkspace"
