#!/bin/bash
# Unified build script for Connectize - Builds both iOS and Android apps
# Author: Connectize Dev Team
# Date: October 2025

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# If executed from monorepo root, adjust
if [ ! -f "${PROJECT_ROOT}/capacitor.config.ts" ]; then
    if [ -d "${PROJECT_ROOT}/Connectize-Frontend" ]; then
        PROJECT_ROOT="${PROJECT_ROOT}/Connectize-Frontend"
    fi
fi

cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
BUILD_ANDROID=false
BUILD_IOS=false
CONFIGURATION="Debug"
BUILD_TYPE="APK"

usage() {
    cat <<EOF
${GREEN}Connectize Mobile App Builder${NC}

Usage: $(basename "$0") [options]

${YELLOW}Platform Options:${NC}
    --android          Build Android app
    --ios              Build iOS app
    --both             Build both Android and iOS apps

${YELLOW}Configuration:${NC}
    --debug            Build debug version (default)
    --release          Build release version

${YELLOW}Android Options:${NC}
    --apk              Build APK (default)
    --aab              Build Android App Bundle

${YELLOW}Other:${NC}
    -h, --help         Show this help

${YELLOW}Examples:${NC}
    $(basename "$0") --android --debug
    $(basename "$0") --ios --release
    $(basename "$0") --both --release --aab
    $(basename "$0") --android --release --apk

${YELLOW}Requirements:${NC}
    Android: Android Studio, Android SDK, Gradle
    iOS:     Xcode, iOS Simulator (macOS only)
EOF
}

if [ $# -eq 0 ]; then
    usage
    exit 0
fi

while [[ $# -gt 0 ]]; do
    case "$1" in
        --android) BUILD_ANDROID=true ; shift ;;
        --ios) BUILD_IOS=true ; shift ;;
        --both) BUILD_ANDROID=true ; BUILD_IOS=true ; shift ;;
        --debug) CONFIGURATION="Debug" ; shift ;;
        --release) CONFIGURATION="Release" ; shift ;;
        --apk) BUILD_TYPE="APK" ; shift ;;
        --aab) BUILD_TYPE="AAB" ; shift ;;
        -h|--help) usage; exit 0 ;;
        *) echo -e "${RED}Unknown option: $1${NC}"; usage; exit 1 ;;
    esac
done

if [ "$BUILD_ANDROID" = false ] && [ "$BUILD_IOS" = false ]; then
    echo -e "${RED}Error: Please specify at least one platform (--android, --ios, or --both)${NC}"
    usage
    exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Connectize Mobile App Builder       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "  Build Type: $CONFIGURATION"
echo "  Android: $BUILD_ANDROID"
echo "  iOS: $BUILD_IOS"
[ "$BUILD_ANDROID" = true ] && echo "  Android Format: $BUILD_TYPE"
echo ""

# Step 1: Build web app
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 Step 1: Building Web Application${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if npm run build; then
    echo -e "${GREEN}✅ Web build successful${NC}"
else
    echo -e "${RED}❌ Web build failed${NC}"
    exit 1
fi

echo ""

# Step 2: Build Android
if [ "$BUILD_ANDROID" = true ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🤖 Step 2: Building Android App${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Check if Android SDK is available
    if ! command -v adb &> /dev/null; then
        echo -e "${YELLOW}⚠️  Warning: Android SDK (adb) not found in PATH${NC}"
        echo "   Make sure Android Studio is installed"
    fi
    
    ANDROID_ARGS=""
    [ "$CONFIGURATION" = "Release" ] && ANDROID_ARGS="$ANDROID_ARGS --release"
    [ "$BUILD_TYPE" = "AAB" ] && ANDROID_ARGS="$ANDROID_ARGS --aab" || ANDROID_ARGS="$ANDROID_ARGS --apk"
    
    if bash "$SCRIPT_DIR/build-android.sh" $ANDROID_ARGS; then
        echo -e "${GREEN}✅ Android build successful${NC}"
        
        if [ "$CONFIGURATION" = "Release" ]; then
            if [ "$BUILD_TYPE" = "AAB" ]; then
                echo -e "${BLUE}📦 Android AAB: connectize-release.aab${NC}"
            else
                echo -e "${BLUE}📦 Android APK: connectize-release.apk${NC}"
            fi
        else
            echo -e "${BLUE}📦 Android APK: connectize-debug.apk${NC}"
        fi
    else
        echo -e "${RED}❌ Android build failed${NC}"
        exit 1
    fi
    echo ""
fi

# Step 3: Build iOS
if [ "$BUILD_IOS" = true ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🍎 Step 3: Building iOS App${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Check if macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}❌ iOS builds are only supported on macOS${NC}"
        exit 1
    fi
    
    # Check if Xcode is available
    if ! command -v xcodebuild &> /dev/null; then
        echo -e "${RED}❌ Xcode not found. Please install Xcode from the App Store${NC}"
        exit 1
    fi
    
    IOS_ARGS=""
    [ "$CONFIGURATION" = "Release" ] && IOS_ARGS="$IOS_ARGS --release"
    
    if bash "$SCRIPT_DIR/build-ios.sh" $IOS_ARGS; then
        echo -e "${GREEN}✅ iOS build successful${NC}"
        echo -e "${BLUE}📦 iOS app built and installed on simulator${NC}"
    else
        echo -e "${RED}❌ iOS build failed${NC}"
        exit 1
    fi
    echo ""
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🎉 Build Complete!                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"

if [ "$BUILD_ANDROID" = true ]; then
    echo -e "${GREEN}✅ Android:${NC}"
    if [ "$CONFIGURATION" = "Release" ]; then
        if [ "$BUILD_TYPE" = "AAB" ]; then
            echo "   📦 connectize-release.aab (ready for Play Store)"
        else
            echo "   📦 connectize-release.apk (ready for distribution)"
        fi
    else
        echo "   📦 connectize-debug.apk (ready for testing)"
    fi
fi

if [ "$BUILD_IOS" = true ]; then
    echo -e "${GREEN}✅ iOS:${NC}"
    echo "   📱 App built and available in iOS Simulator"
    if [ "$CONFIGURATION" = "Release" ]; then
        echo "   📝 For App Store: Open Xcode and archive the project"
    fi
fi

echo ""
echo -e "${YELLOW}Next Steps:${NC}"

if [ "$BUILD_ANDROID" = true ]; then
    echo ""
    echo -e "${BLUE}Android:${NC}"
    if [ "$CONFIGURATION" = "Release" ]; then
        if [ "$BUILD_TYPE" = "AAB" ]; then
            echo "  1. Upload connectize-release.aab to Google Play Console"
            echo "  2. Follow Play Store review process"
        else
            echo "  1. Test: adb install connectize-release.apk"
            echo "  2. Distribute via your preferred platform"
        fi
    else
        echo "  1. Install: adb install connectize-debug.apk"
        echo "  2. Test on physical device or emulator"
    fi
fi

if [ "$BUILD_IOS" = true ]; then
    echo ""
    echo -e "${BLUE}iOS:${NC}"
    if [ "$CONFIGURATION" = "Release" ]; then
        echo "  1. Open Xcode: open ios/App/App.xcworkspace"
        echo "  2. Select Product > Archive"
        echo "  3. Upload to App Store Connect"
    else
        echo "  1. App is running in iOS Simulator"
        echo "  2. Test all features thoroughly"
    fi
fi

echo ""
echo -e "${GREEN}Build logs saved to:${NC}"
[ "$BUILD_ANDROID" = true ] && echo "  📄 android_build.log"
[ "$BUILD_IOS" = true ] && echo "  📄 ios_build.log"
echo ""
