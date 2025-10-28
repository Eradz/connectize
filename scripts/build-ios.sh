#!/bin/bash
# Robust iOS build & run helper for Connectize (Capacitor)
# Supports being invoked from repo root OR from inside Connectize-Frontend.
# Adds logging, simulator auto-detect, flag options, and safer error handling.

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# When executed inside scripts directory, project root is its parent (already normalized by pwd)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# If executed from monorepo root (parent dir contains Connectize-Frontend), adjust
if [ ! -f "${PROJECT_ROOT}/capacitor.config.ts" ]; then
    if [ -d "${PROJECT_ROOT}/Connectize-Frontend" ] && [ -f "${PROJECT_ROOT}/Connectize-Frontend/capacitor.config.ts" ]; then
        PROJECT_ROOT="${PROJECT_ROOT}/Connectize-Frontend"
    fi
fi

cd "$PROJECT_ROOT"

LOG_FILE="ios_build.log"
SCHEME="App"
WORKSPACE_REL="ios/App/App.xcworkspace"
APP_BUNDLE_ID="co.connectize.app"
APP_NAME="App"

SIMULATOR_ID="${SIMULATOR_ID:-}"         # Allow override via env
SIMULATOR_NAME="${SIMULATOR_NAME:-iPhone 16}" # Fallback name search

SKIP_SYNC=false
SKIP_INSTALL=false
SKIP_LAUNCH=false
CLEAN_DERIVED=true
CONFIGURATION="Debug"

usage() {
    cat <<EOF
Usage: $(basename "$0") [options]
Options:
    --no-sync          Skip 'npx cap sync ios'
    --no-install       Build only (do not install on simulator)
    --no-launch        Build & install but don't launch
    --release          Use Release configuration
    --keep-derived     Do not delete DerivedData caches first
    --sim-id <UDID>    Specify exact simulator UDID
    --sim-name <name>  Specify simulator name to search (default: iPhone 16)
    -h, --help         Show this help
Environment:
    SIMULATOR_ID / SIMULATOR_NAME can be used instead of flags
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --no-sync) SKIP_SYNC=true ; shift ;;
        --no-install) SKIP_INSTALL=true ; shift ;;
        --no-launch) SKIP_LAUNCH=true ; shift ;;
        --release) CONFIGURATION="Release" ; shift ;;
        --keep-derived) CLEAN_DERIVED=false ; shift ;;
        --sim-id) SIMULATOR_ID="$2" ; shift 2 ;;
        --sim-name) SIMULATOR_NAME="$2" ; shift 2 ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $1"; usage; exit 1 ;;
    esac
done

echo "🚀 Connectize iOS Build (scheme=${SCHEME} config=${CONFIGURATION})"
echo "Project root: $PROJECT_ROOT"
echo "Logging to: $LOG_FILE"

if [ "$SKIP_SYNC" = false ]; then
    echo "📱 Step 1: Syncing web + native (Capacitor)" | tee "$LOG_FILE"
    npx cap sync ios >>"$LOG_FILE" 2>&1
else
    echo "⚡ Skipping sync as requested" | tee -a "$LOG_FILE"
fi

echo "🧹 Step 2: Cleaning extended attributes (framework quarantine bits)" | tee -a "$LOG_FILE"
find node_modules/@capacitor -name "*.framework" -exec xattr -cr {} \; 2>/dev/null || true
find ios/App/Pods -name "*.framework" -exec xattr -cr {} \; 2>/dev/null || true

if [ "$CLEAN_DERIVED" = true ]; then
    echo "�️  Step 3: Purging DerivedData caches for fresh build" | tee -a "$LOG_FILE"
    rm -rf ~/Library/Developer/Xcode/DerivedData/${APP_NAME}-* 2>/dev/null || true
else
    echo "♻️  Keeping existing DerivedData" | tee -a "$LOG_FILE"
fi

echo "🔧 Step 4: Pre-clean workspace" | tee -a "$LOG_FILE"
if [ ! -d "ios/App" ]; then
    echo "❌ ios/App directory missing under $(pwd)" | tee -a "$LOG_FILE"
    exit 66
fi
if [ ! -d "ios/App/App.xcworkspace" ] && [ ! -f "ios/App/App.xcworkspace/contents.xcworkspacedata" ]; then
    # In some setups workspace is a directory, sometimes considered as a package
    if [ ! -e "ios/App/App.xcworkspace" ]; then
        echo "❌ Workspace not found at $WORKSPACE_REL (pwd=$(pwd))" | tee -a "$LOG_FILE"
        ls -la ios/App | tee -a "$LOG_FILE" || true
        exit 66
    fi
fi
(
    cd ios/App && xcodebuild clean -workspace "App.xcworkspace" -scheme "$SCHEME" >>"$PROJECT_ROOT/$LOG_FILE" 2>&1 || true
)

# Determine simulator ID if not provided
if [ -z "$SIMULATOR_ID" ]; then
    echo "🔍 Locating simulator UDID for name pattern: $SIMULATOR_NAME" | tee -a "$LOG_FILE"
    SIMULATOR_ID=$(xcrun simctl list devices | grep -i "$SIMULATOR_NAME" | grep -v Unavailable | grep -Eo "[0-9A-F-]{36}" | head -1 || true)
fi

if [ -z "$SIMULATOR_ID" ]; then
    echo "⚠️  No matching simulator found by name. Listing available booted devices:" | tee -a "$LOG_FILE"
    xcrun simctl list devices | grep Booted | tee -a "$LOG_FILE" || true
    echo "❌ Could not resolve a simulator. Provide one with --sim-id <UDID>." | tee -a "$LOG_FILE"
    exit 1
fi

echo "🧪 Using simulator: $SIMULATOR_NAME ($SIMULATOR_ID)" | tee -a "$LOG_FILE"

DESTINATION="platform=iOS Simulator,id=${SIMULATOR_ID}"

echo "🏗️  Step 5: Building via xcodebuild" | tee -a "$LOG_FILE"
set +e
(
    cd ios/App && \
    xcodebuild -workspace "App.xcworkspace" -scheme "$SCHEME" \
        -destination "$DESTINATION" \
        -configuration "$CONFIGURATION" \
        CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO \
        build >>"$PROJECT_ROOT/$LOG_FILE" 2>&1
)
XC_STATUS=$?
set -e

if [ $XC_STATUS -ne 0 ]; then
    echo "❌ Build failed (exit $XC_STATUS). See $LOG_FILE for details." | tee -a "$LOG_FILE"
    tail -n 40 "$LOG_FILE"
    exit $XC_STATUS
fi

echo "✅ Build succeeded" | tee -a "$LOG_FILE"

if [ "$SKIP_INSTALL" = true ]; then
    echo "📦 Skipping install step" | tee -a "$LOG_FILE"
    exit 0
fi

echo "📦 Step 6: Locating built .app" | tee -a "$LOG_FILE"
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -type d -name "${APP_NAME}.app" -path "*Build/Products*${CONFIGURATION}-iphonesimulator*" 2>/dev/null | head -1)

if [ -z "$APP_PATH" ]; then
    echo "❌ Could not locate built app bundle" | tee -a "$LOG_FILE"
    exit 1
fi

echo "App bundle: $APP_PATH" | tee -a "$LOG_FILE"

# Boot simulator if needed
STATE=$(xcrun simctl list devices | grep "$SIMULATOR_ID" | grep -o "(Booted)\|(Shutdown)" || true)
if [ "$STATE" != "(Booted)" ]; then
    echo "🔄 Booting simulator $SIMULATOR_ID" | tee -a "$LOG_FILE"
    xcrun simctl boot "$SIMULATOR_ID" >/dev/null 2>&1 || true
    open -a Simulator
    sleep 5
fi

echo "📲 Installing app" | tee -a "$LOG_FILE"
xcrun simctl install "$SIMULATOR_ID" "$APP_PATH" >/dev/null

if [ "$SKIP_LAUNCH" = true ]; then
    echo "� Launch step skipped" | tee -a "$LOG_FILE"
    exit 0
fi

echo "🚀 Launching $APP_BUNDLE_ID" | tee -a "$LOG_FILE"
LAUNCH_OUT=$(xcrun simctl launch "$SIMULATOR_ID" "$APP_BUNDLE_ID" 2>&1 || true)
echo "$LAUNCH_OUT" >>"$LOG_FILE"
PID=$(echo "$LAUNCH_OUT" | awk -F ':' '/ProcessID/{gsub(/ /, "", $2); print $2}')

echo "🎉 Success! App running (PID: ${PID:-unknown})." | tee -a "$LOG_FILE"
echo "🔎 Tail of log (last 20 lines):"
tail -n 20 "$LOG_FILE"
