#!/bin/bash

# Fix iOS Copy Pods Resources build phase
# This script should be run after npx cap update ios or npx cap run ios

echo "🔧 Fixing iOS Copy Pods Resources build phase..."

cd ios/App && pod install

echo "✅ iOS build fix applied successfully!"
echo "You can now run: cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build"
