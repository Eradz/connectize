#!/bin/bash

# iOS Build Preparation Script
# This script prepares the Connectize app for iOS builds and prevents timeout errors

set -e  # Exit on error

echo "🚀 Starting iOS Build Preparation..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean old builds
echo -e "${YELLOW}📦 Step 1: Cleaning old builds...${NC}"
rm -rf build/client build/server
rm -rf ios/App/App/public
echo -e "${GREEN}✓ Old builds cleaned${NC}"

# Step 2: Build the web app
echo -e "${YELLOW}📦 Step 2: Building React app...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ React app built successfully${NC}"

# Step 3: Fix index.html naming issue (if exists)
echo -e "${YELLOW}📦 Step 3: Checking index.html...${NC}"
if [ -f "build/client/index 2.html" ]; then
    echo -e "${YELLOW}  Found 'index 2.html', renaming to 'index.html'...${NC}"
    mv "build/client/index 2.html" "build/client/index.html"
fi

if [ ! -f "build/client/index.html" ]; then
    echo -e "${RED}✗ index.html not found in build/client${NC}"
    exit 1
fi
echo -e "${GREEN}✓ index.html verified${NC}"

# Step 4: Optimize assets (remove test files for production)
echo -e "${YELLOW}📦 Step 4: Optimizing assets...${NC}"
cd build/client
rm -f api-test.html auth-test.html font-test.html 2>/dev/null || true
rm -f "offline 2.html" "quick-login 2.html" "robots 2.txt" "seo 3" 2>/dev/null || true
cd ../..
echo -e "${GREEN}✓ Assets optimized${NC}"

# Step 5: Sync with Capacitor
echo -e "${YELLOW}📦 Step 5: Syncing with iOS project...${NC}"
npx cap sync ios
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Capacitor sync failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Synced successfully${NC}"

# Step 6: Check final size
echo -e "${YELLOW}📦 Step 6: Checking bundle size...${NC}"
PUBLIC_SIZE=$(du -sh ios/App/App/public | cut -f1)
FILE_COUNT=$(find ios/App/App/public -type f | wc -l | tr -d ' ')
echo -e "  Public folder size: ${GREEN}${PUBLIC_SIZE}${NC}"
echo -e "  Number of files: ${GREEN}${FILE_COUNT}${NC}"

if [ "$FILE_COUNT" -gt 100 ]; then
    echo -e "${YELLOW}⚠️  Warning: Large number of files (${FILE_COUNT}). This might cause slow Xcode builds.${NC}"
fi

# Step 7: Open Xcode (optional)
echo ""
echo -e "${GREEN}✅ iOS Build Preparation Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. In Xcode: Select your device/simulator"
echo "3. Product → Archive (for App Store)"
echo "   OR"
echo "   Product → Build (Cmd+B) for testing"
echo ""
echo "Tips to avoid timeout:"
echo "- Use 'Build' instead of 'Archive' for testing"
echo "- Close other apps to free up system resources"
echo "- If timeout persists, clean build folder: Product → Clean Build Folder (Cmd+Shift+K)"
echo ""

read -p "Do you want to open Xcode now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Opening Xcode...${NC}"
    npx cap open ios
fi
