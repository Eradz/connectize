# iOS App Store - Quick Reference Checklist

## 🎯 Problem Fixed
- ❌ **Before**: Device showed "App", App Store showed "Connectize"
- ✅ **After**: Both show "Connectize"

## 📝 Files Changed (Commit: ef0c826)
- [x] `capacitor.config.ts` - appName: "Connectize"
- [x] `ios/App/App/Info.plist` - CFBundleDisplayName: "Connectize"
- [x] `build-ios-app-store.sh` - Automated build script

---

## 🚀 Quick Build Commands

```bash
# Navigate to project
cd /Users/lekiaprosper/Documents/Dev/Connectize/Connectize-Frontend

# Run automated build script
./build-ios-app-store.sh

# OR manual commands:
npm run build              # 1. Build React app
npx cap sync ios          # 2. Sync to iOS
npx cap open ios          # 3. Open Xcode
```

---

## 🍎 Xcode Checklist

### Before Archive:
- [ ] Display Name: "Connectize" ✓
- [ ] Bundle ID: co.connectize.app
- [ ] Version: Increment (e.g., 1.0.0 → 1.0.1)
- [ ] Build: Increment (e.g., 1 → 2)
- [ ] Team: Selected
- [ ] Device: "Any iOS Device (arm64)"

### Archive Steps:
1. [ ] Product → Clean Build Folder
2. [ ] Product → Archive
3. [ ] Wait for completion (5-10 min)
4. [ ] Organizer opens automatically

### Distribution:
1. [ ] Select archive
2. [ ] Click "Distribute App"
3. [ ] Choose "App Store Connect"
4. [ ] Choose "Upload"
5. [ ] Enable symbols & auto-manage signing
6. [ ] Review & Upload
7. [ ] Wait for upload (5-15 min)

---

## 📱 App Store Connect Checklist

### After Upload:
- [ ] Wait for processing (10-30 min)
- [ ] Check email for build ready
- [ ] Go to appstoreconnect.apple.com
- [ ] Select "Connectize" app
- [ ] Verify build appears

### Submission:
- [ ] Select the new build
- [ ] Update "What's New":
  ```
  Bug Fixes & Improvements:
  - Fixed app name display
  - Improved performance
  - Enhanced user experience
  ```

- [ ] Add review notes:
  ```
  Re: Previous Rejection - App Name Fixed
  
  Device now shows "Connectize" matching marketplace name.
  Updated CFBundleDisplayName and appName configuration.
  Names now match - no user confusion.
  ```

- [ ] Click "Submit for Review"

---

## ⏱️ Timeline
- Build & Archive: **10 min**
- Upload: **10 min**
- Processing: **20 min**
- **Review: 1-3 days** ⏳

---

## ✅ Verification

**Test in Xcode:**
- App name shows "Connectize" in General tab

**After App Store Approval:**
- Download app from App Store
- Check home screen shows "Connectize"
- Launch and test functionality

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Archive grayed out | Select "Any iOS Device", not Simulator |
| Signing error | Check Team selected in Signing & Capabilities |
| Upload fails | Check internet, try again (transient errors common) |
| Build not showing | Wait 30 min, check email for errors |

---

## 📞 Resources

- **Full Guide**: `IOS_APP_STORE_SUBMISSION_GUIDE.md`
- **Build Script**: `./build-ios-app-store.sh`
- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer**: https://developer.apple.com

---

## 🎉 Expected Result

✅ App Store approval with:
- Device displays: "Connectize" ✓
- App Store shows: "Connectize" ✓
- No name mismatch ✓
- Happy users! 🎊
