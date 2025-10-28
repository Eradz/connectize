#!/bin/bash

# iOS App Store Build Script
# This script prepares and builds the Connectize iOS app for App Store submission

set -e  # Exit on error

echo "🚀 Starting iOS App Store Build Process..."
echo ""

# Step 1: Navigate to frontend directory
echo "📂 Step 1: Navigating to Connectize-Frontend directory..."
cd "$(dirname "$0")"
pwd
echo ""

# Step 2: Build the React application
echo "🔨 Step 2: Building React application for production..."
npm run build
echo "✅ React build complete!"
echo ""

# Step 3: Sync Capacitor to iOS
echo "📱 Step 3: Syncing Capacitor to iOS project..."
npx cap sync ios
echo "✅ Capacitor sync complete!"
echo ""

# Step 4: Copy resources
echo "🎨 Step 4: Ensuring resources are in place..."
npx cap copy ios
echo "✅ Resources copied!"
echo ""

# Step 5: Open Xcode
echo "🍎 Step 5: Opening Xcode..."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 MANUAL STEPS IN XCODE:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. ✓ Verify app name shows 'Connectize' in General → Display Name"
echo "2. ✓ Check Bundle Identifier: co.connectize.app"
echo "3. ✓ Increment version number (e.g., 1.0.0 → 1.0.1)"
echo "4. ✓ Select your Team and Signing Certificate"
echo "5. ✓ Choose 'Any iOS Device' or a connected device"
echo "6. ✓ Product → Archive (or Cmd+Shift+Option+K then Cmd+B)"
echo "7. ✓ Wait for archive to complete"
echo "8. ✓ In Organizer, select archive and click 'Distribute App'"
echo "9. ✓ Choose 'App Store Connect'"
echo "10. ✓ Upload to App Store"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 APP STORE SUBMISSION NOTES:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "In response to previous rejection, note:"
echo "'Fixed app name - device now displays Connectize matching"
echo "marketplace name. Updated CFBundleDisplayName in Info.plist"
echo "and appName in capacitor.config.ts.'"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

npx cap open ios

echo ""
echo "✅ Build process complete! Follow the manual steps above."
