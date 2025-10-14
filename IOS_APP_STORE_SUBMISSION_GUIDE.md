# iOS App Store Build & Submission Guide

## 📋 Overview
This guide walks you through building and submitting the Connectize iOS app to the App Store after fixing the app name issue.

---

## ✅ What Was Fixed

### Issue
- **App Store Rejection**: "Marketplace app name: Connectize" vs "Name displayed on device: App"
- Apple requires app names to match to avoid user confusion

### Solution Applied
1. ✅ **capacitor.config.ts** (line 6): Changed `appName: "App"` → `appName: "Connectize"`
2. ✅ **ios/App/App/Info.plist** (line 12): Changed `<string>App</string>` → `<string>Connectize</string>`
3. ✅ **Created build script**: `build-ios-app-store.sh` for automated build process
4. ✅ **Committed changes**: Commit ef0c826

---

## 🚀 Quick Start (Automated Build)

### Option 1: Use the Build Script (Recommended)

```bash
cd /Users/lekiaprosper/Documents/Dev/Connectize/Connectize-Frontend
./build-ios-app-store.sh
```

This script will:
1. Build the React app
2. Sync Capacitor to iOS
3. Copy resources
4. Open Xcode automatically
5. Display checklist for manual steps

Then follow the **Manual Steps in Xcode** section below.

---

## 🛠️ Manual Build Process (Step-by-Step)

### Step 1: Build React Application

```bash
cd /Users/lekiaprosper/Documents/Dev/Connectize/Connectize-Frontend
npm run build
```

**Expected Output:**
- Build files in `build/client/` directory
- No errors in console

### Step 2: Sync Capacitor to iOS

```bash
npx cap sync ios
```

**This will:**
- Update iOS project with config changes
- Copy web assets to iOS
- Update native dependencies

**Expected Output:**
```
✔ Copying web assets from build/client to ios/App/App/public in 123ms
✔ Creating capacitor.config.json in ios/App/App in 1ms
✔ copy ios in 234ms
✔ Updating iOS plugins in 45ms
✔ Updating iOS native dependencies in 678ms
✔ update ios in 789ms
```

### Step 3: Open Xcode

```bash
npx cap open ios
```

**Or manually:**
```bash
open ios/App/App.xcworkspace
```

⚠️ **Important**: Always open `.xcworkspace`, NOT `.xcodeproj`

---

## 🍎 Manual Steps in Xcode

### 1. Verify App Configuration

**Navigate to:** Project Navigator → App → General

**Check these settings:**

| Setting | Expected Value |
|---------|---------------|
| **Display Name** | `Connectize` ✓ (was "App") |
| **Bundle Identifier** | `co.connectize.app` |
| **Version** | Increment (e.g., `1.0.0` → `1.0.1`) |
| **Build** | Increment (e.g., `1` → `2`) |
| **Team** | Your Apple Developer Team |
| **Signing Certificate** | Valid iOS Distribution certificate |

### 2. Increment Version Number

**Why:** App Store requires new version for each submission

**How:**
- In General tab, find "Version" field
- Change from current version (e.g., `1.0.0`) to next version (e.g., `1.0.1`)
- Or increment build number if keeping same version

### 3. Select Build Target

**Top toolbar:**
- Click device selector (next to Play/Stop buttons)
- Choose **"Any iOS Device (arm64)"** or a connected physical device
- Do NOT choose Simulator for App Store builds

### 4. Clean Build Folder

**Important for fresh builds:**

```
Product → Clean Build Folder
```

Or press: **Shift + Cmd + K**

### 5. Archive the App

**Steps:**
1. Go to `Product → Archive`
2. **Or press:** `Cmd + Shift + B` (may not work on all Xcode versions)
3. Wait for build to complete (5-10 minutes)
4. Archive will appear in Organizer

**Common Issues:**
- ❌ **"Archive is grayed out"**: Make sure "Any iOS Device" is selected, not Simulator
- ❌ **Build errors**: Check signing certificates are valid and not expired
- ❌ **Missing dependencies**: Run `npx cap sync ios` again

### 6. Distribute to App Store

**When archive completes:**

1. **Organizer opens automatically**
   - If not, go to `Window → Organizer`
   - Select "Archives" tab

2. **Select your archive**
   - Find the latest archive (sorted by date)
   - Should show "Connectize" with today's date

3. **Click "Distribute App"**

4. **Choose distribution method:**
   - Select **"App Store Connect"**
   - Click "Next"

5. **Upload method:**
   - Select **"Upload"**
   - Click "Next"

6. **Distribution options:**
   - ✓ Upload your app's symbols (recommended)
   - ✓ Manage version and build number (Xcode-managed)
   - Click "Next"

7. **Signing:**
   - Choose **"Automatically manage signing"**
   - Click "Next"

8. **Review:**
   - Check all information is correct
   - Click "Upload"

9. **Wait for upload**
   - Progress bar will show upload status
   - Can take 5-15 minutes depending on app size and connection

10. **Success!**
    - You'll see "Upload Successful"
    - Build will process on App Store Connect (10-30 minutes)

---

## 📱 App Store Connect Submission

### 1. Wait for Build Processing

**Steps:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple ID
3. Select "My Apps" → "Connectize"
4. Wait for build to appear in "TestFlight" section
5. Processing takes 10-30 minutes
6. You'll receive email when ready

### 2. Create New Version (if needed)

**If this is a new version:**
1. Go to "App Store" tab
2. Click "+" next to "iOS App"
3. Enter new version number (e.g., 1.0.1)
4. Click "Create"

### 3. Select Build

1. In version page, find "Build" section
2. Click "+" or "Select a build before you submit your app"
3. Choose the build you just uploaded
4. Click "Done"

### 4. Update "What's New in This Version"

**Suggested text:**
```
Bug Fixes & Improvements:
- Fixed app name display to properly show "Connectize" on device home screen
- Improved app performance and stability
- Enhanced user experience
```

### 5. Address Previous Rejection

**In "App Review Information" → "Notes":**

```
Re: Previous Rejection - App Name Mismatch

We have addressed the app name issue:

FIXED:
- Device Display Name: Now shows "Connectize" (previously showed "App")
- Marketplace Name: Connectize
- Both names now match as required

Technical Changes:
- Updated CFBundleDisplayName in Info.plist
- Updated appName in capacitor.config.ts
- Rebuilt and archived app with corrected configuration

The app name displayed on the device home screen now matches the 
App Store listing, resolving the user confusion concern.
```

### 6. Submit for Review

1. Review all information
2. Ensure all required fields are filled
3. Click "Save" at top right
4. Click "Submit for Review"
5. Confirm submission

---

## ⏱️ Timeline

| Step | Duration | Notes |
|------|----------|-------|
| Build React app | 1-2 min | Depends on project size |
| Sync Capacitor | 30 sec | Updates iOS project |
| Archive in Xcode | 5-10 min | Clean build recommended |
| Upload to App Store | 5-15 min | Depends on connection |
| Build processing | 10-30 min | Automated by Apple |
| App Review | 1-3 days | Can be faster for bug fixes |

**Total: ~1-3 days** (mostly waiting for review)

---

## ✅ Verification Checklist

Before submitting, verify:

- [ ] App name shows "Connectize" in Xcode General → Display Name
- [ ] Info.plist has `<string>Connectize</string>` for CFBundleDisplayName
- [ ] capacitor.config.ts has `appName: "Connectize"`
- [ ] Version number is incremented
- [ ] Build number is incremented
- [ ] Archive is successful
- [ ] Upload to App Store Connect is successful
- [ ] Build appears in App Store Connect
- [ ] "What's New" section is updated
- [ ] Response to rejection is written
- [ ] All app metadata is correct
- [ ] Screenshots are up to date (if changed)

---

## 🐛 Troubleshooting

### Issue: "Archive is grayed out"
**Solution:**
- Select "Any iOS Device (arm64)" from device selector
- Do NOT select Simulator or "My Mac"

### Issue: "Signing for 'App' requires a development team"
**Solution:**
- Go to Signing & Capabilities
- Select your Team from dropdown
- Ensure "Automatically manage signing" is checked

### Issue: "No valid signing certificates"
**Solution:**
- Open Xcode → Preferences → Accounts
- Select your Apple ID
- Click "Manage Certificates"
- Add "Apple Distribution" certificate if missing

### Issue: "Build succeeds but archive fails"
**Solution:**
1. Clean build folder (Shift + Cmd + K)
2. Close Xcode
3. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
4. Reopen Xcode and try again

### Issue: "Upload fails with generic error"
**Solution:**
- Check your internet connection
- Try uploading again (transient errors are common)
- Use Xcode → Preferences → Accounts → Download Manual Profiles
- Try archiving again

### Issue: "App Store Connect doesn't show build"
**Solution:**
- Wait 30 minutes (processing can be slow)
- Check for email from Apple about build issues
- Verify bundle identifier matches App Store Connect
- Check for missing compliance information

---

## 📧 Email Notifications

You'll receive emails for:
1. **Build uploaded** - Immediate
2. **Build processed** - 10-30 minutes after upload
3. **In review** - When Apple starts reviewing
4. **Approved/Rejected** - 1-3 days after submission

---

## 🎯 Expected Outcome

**After resubmission:**

✅ **Device Display**: Shows "Connectize" on home screen
✅ **App Store**: Shows "Connectize" in listing
✅ **Names Match**: No confusion for users
✅ **Review Passes**: Should resolve the rejection reason

**If approved:**
- App will be "Ready for Sale" status
- Users can download from App Store
- Version 1.0.1 (or your new version) will be live

---

## 📞 Support

**If you encounter issues:**

1. **Check Apple Developer Forums**: Many common issues discussed
2. **Contact Apple Developer Support**: If persistent issues
3. **Review App Store Review Guidelines**: Ensure compliance

---

## 🎉 Success!

Once approved, your app will be available on the App Store with the correct name "Connectize" displayed on user devices!

**Next Steps After Approval:**
1. Test download from App Store
2. Verify app name appears correctly on device
3. Test all app functionality
4. Monitor crash reports and user feedback
5. Plan next update if needed

---

**Last Updated:** Today
**Script Location:** `./build-ios-app-store.sh`
**Commit:** ef0c826
