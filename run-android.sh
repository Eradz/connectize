#!/bin/bash

# Android Run Script - Workaround for Capacitor CLI bug
# This script runs your Android app without using the broken "cap run" command

set -e  # Exit on error

echo "🤖 Connectize Android Builder"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo -e "${RED}❌ Error: Must be run from project root${NC}"
    exit 1
fi

# Function to check if adb is available
check_adb() {
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}❌ ADB not found${NC}"
        echo "Please install Android SDK Platform Tools"
        echo "Or add to PATH: export PATH=\$PATH:\$HOME/Library/Android/sdk/platform-tools"
        exit 1
    fi
}

# Function to check for connected devices
check_devices() {
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l | xargs)
    if [ "$DEVICES" -eq 0 ]; then
        echo -e "${RED}❌ No Android devices connected${NC}"
        echo ""
        echo "Please either:"
        echo "  1. Connect a physical device via USB"
        echo "  2. Start an Android emulator"
        echo "  3. Use Android Studio to run the app"
        exit 1
    fi
    echo -e "${GREEN}✓ Found $DEVICES Android device(s)${NC}"
}

# Parse arguments
SKIP_BUILD=false
SKIP_SYNC=false
INSTALL_ONLY=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-build) SKIP_BUILD=true ;;
        --skip-sync) SKIP_SYNC=true ;;
        --install-only) INSTALL_ONLY=true ;;
        --help)
            echo "Usage: ./run-android.sh [options]"
            echo ""
            echo "Options:"
            echo "  --skip-build      Skip npm run build"
            echo "  --skip-sync       Skip capacitor sync"
            echo "  --install-only    Just install, don't launch"
            echo "  --help            Show this help"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Step 1: Build web assets (if not skipped)
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${BLUE}📦 Building web assets...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Build complete${NC}"
    echo ""
else
    echo -e "${BLUE}⏭️  Skipping build${NC}"
    echo ""
fi

# Step 2: Sync with Capacitor (if not skipped)
if [ "$SKIP_SYNC" = false ]; then
    echo -e "${BLUE}🔄 Syncing with Capacitor...${NC}"
    npx cap sync android
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Sync failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Sync complete${NC}"
    echo ""
else
    echo -e "${BLUE}⏭️  Skipping sync${NC}"
    echo ""
fi

# Step 3: Check for devices
echo -e "${BLUE}🔍 Checking for devices...${NC}"
check_adb
check_devices
echo ""

# Step 4: Build and install APK
echo -e "${BLUE}🔨 Building and installing APK...${NC}"
cd android

# Clean previous builds (optional, uncomment if needed)
# ./gradlew clean

# Build and install debug APK
./gradlew installDebug

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build/Install failed${NC}"
    cd ..
    exit 1
fi

cd ..
echo -e "${GREEN}✓ App installed successfully${NC}"
echo ""

# Step 5: Launch app (if not install-only)
if [ "$INSTALL_ONLY" = false ]; then
    echo -e "${BLUE}🚀 Launching app...${NC}"
    adb shell am start -n co.connectize.app/.MainActivity
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ App launched successfully${NC}"
        echo ""
        echo -e "${BLUE}📱 View logs with:${NC}"
        echo "   adb logcat | grep -E '(Capacitor|WebView|Connectize)'"
    else
        echo -e "${RED}❌ Failed to launch app${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}ℹ️  App installed but not launched (--install-only)${NC}"
fi

echo ""
echo -e "${GREEN}✨ Done!${NC}"
