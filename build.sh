#!/bin/bash

# Usage:
#   ./build.sh           -> Android build (default)
#   ./build.sh android   -> Android build
#   ./build.sh ios       -> iOS build

PLATFORM=${1:-android}  

echo "🚀 Building React App..."
npm run build

echo "🔄 Copying build to native project..."
npx cap copy

if [ "$PLATFORM" = "android" ]; then
  echo "📦 Building Android (APK + AAB)..."
  cd android

  echo "🧹 Cleaning..."
  ./gradlew clean

  echo "📦 Building APK..."
  ./gradlew assembleRelease

  echo "📦 Building AAB..."
  ./gradlew bundleRelease

  echo "✅ APK: app/build/outputs/apk/release/app-release.apk"
  echo "✅ AAB: app/build/outputs/bundle/release/app-release.aab"

  cd ..

elif [ "$PLATFORM" = "ios" ]; then
  echo "🍏 Building iOS..."

  # Ensure the latest build is copied
  npx cap open ios

  echo "📱 Opened Xcode. You can now archive and export from Xcode (Product > Archive)."
  echo "⚠️ iOS build must be done via Xcode due to Apple signing requirements."

else
  echo "❌ Unknown platform: $PLATFORM"
  echo "Usage: ./build.sh [android|ios]"
  exit 1
fi
