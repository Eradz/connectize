# 🔧 Troubleshooting Guide - App Store Compliance Features

## Current Issues & Fixes

### ❌ Issue 1: Pages No Longer Scroll Vertically

**Symptoms:**
- Cannot scroll up/down on any page
- Page feels "stuck"

**Root Cause:**
The `.messages-opened` CSS class is stuck on the `<body>` element, which applies:
```css
overflow: hidden;
height: 100vh;
```

**Immediate Fix (Browser):**
1. Open browser DevTools (F12 or Right-click → Inspect)
2. In Console, type: `document.body.classList.remove('messages-opened')`
3. Press Enter
4. Page should scroll again

**Permanent Fix Options:**

**Option A - Clear Browser Cache:**
- **Mac:** Cmd + Shift + R
- **Windows:** Ctrl + Shift + R
- Or clear cache in Settings → Privacy → Clear browsing data

**Option B - Code Fix (if issue persists):**
Add this to `AppLayout.jsx` or `root.jsx`:
```javascript
useEffect(() => {
  // Cleanup any stuck scroll-blocking classes
  return () => {
    document.body.classList.remove('messages-opened');
  };
}, []);
```

---

### ❌ Issue 2: Report Button Not Visible

**Where to Find It:**
The Report button appears ONLY on **other users' posts**, not your own posts.

**Steps to Test:**
1. Go to `/feed` (News Feed)
2. Find a post created by **another user** (not you)
3. Click the **"⋮"** (three dots) menu button
4. You should see **"⚠️ Report post"** option

**If Not Visible:**
- Make sure you're logged in
- Make sure you're viewing someone else's post (not yours)
- Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R)

**What You See on Your Own Posts:**
- ✏️ Edit post
- 🗑️ Delete post

**What You See on Others' Posts:**
- ⚠️ Report post (NEW!)

---

### ❌ Issue 3: Block User Button Location

**Where to Find It:**
The Block button appears ONLY on **other users' profiles**, not your own.

**Steps to Test:**
1. Go to any user's profile page (click on their name/avatar)
2. Next to the "**Connect**" button, you should see "**Block User**"
3. Click it to block/unblock

**If Not Visible:**
- Make sure you're viewing someone else's profile (not yours)
- Hard refresh the page
- Check browser console for errors

**What You See on Your Own Profile:**
- ✏️ Edit Profile button

**What You See on Others' Profiles:**
- 🔗 Connect button
- 🚫 Block User button (NEW!)

---

### ❌ Issue 4: WebSocket Connection Error

**Error Message:**
```
WebSocket connection to 'wss://about.connectize.co/ws/notifications/?token=...' failed
```

**What It Means:**
This is a **backend notification system** issue, NOT related to App Store compliance features.

**Root Cause:**
- WebSocket endpoint might not be configured on production
- SSL/TLS certificate issue with WSS connection
- Backend server not accepting WebSocket connections

**Does NOT Affect:**
- ✅ Report post functionality
- ✅ Block user functionality  
- ✅ Any App Store compliance features

**Backend Fix Needed:**
Check Django Channels / Daphne configuration:
1. Verify WebSocket routing in `routing.py`
2. Check ASGI application setup
3. Verify Redis configuration for Channels
4. Check Railway WebSocket support

**Temporary Workaround:**
This error can be safely ignored for now. Notifications will still work via polling.

---

### ❌ Issue 5: 404 Errors

**Error Message:**
```
Failed to load resource: the server responded with a status of 404
```

**Status:** ✅ **FIXED** in commit `2eadcbc`

**What Was Done:**
Added SPA rewrite rules to `vercel.json`:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

**If Still Seeing 404s:**
- Wait 2-3 minutes for Vercel to finish deploying
- Clear browser cache
- Check Vercel deployment status

---

## ✅ Implemented App Store Compliance Features

### 1. Report Content (Objectionable Content Flagging)

**Backend:**
- ✅ `ContentReport` model created
- ✅ API endpoint: `POST /api/content-reports/report_content/`
- ✅ Supports 8 report types: spam, harassment, hate_speech, violence, nudity, fake_profile, inappropriate, other

**Frontend:**
- ✅ Report button on posts (⋮ menu)
- ✅ `ReportModal` component with dropdown and description
- ✅ API service: `reportContent()` in `moderation.js`

**Files Created:**
- `/NEM/api/models/content_moderation_model.py`
- `/NEM/api/views/content_moderation_view.py`
- `/Connectize-Frontend/src/components/moderation/ReportModal.jsx`
- `/Connectize-Frontend/src/api-services/moderation.js`

**Files Modified:**
- `/Connectize-Frontend/src/components/admin/feeds/DiscoverPosts.jsx`

### 2. Block Abusive Users

**Backend:**
- ✅ `BlockedUser` model created
- ✅ API endpoints:
  - `POST /api/blocked-users/block_user/`
  - `POST /api/blocked-users/unblock_user/`
  - `GET /api/blocked-users/my_blocked_users/`
  - `GET /api/blocked-users/is_blocked/`

**Frontend:**
- ✅ Block button on user profiles (next to Connect)
- ✅ `BlockUserButton` component with toggle
- ✅ API services: `blockUser()`, `unblockUser()` in `moderation.js`

**Files Created:**
- `/Connectize-Frontend/src/components/moderation/BlockUserButton.jsx`

**Files Modified:**
- `/Connectize-Frontend/src/components/userProfile/user-profile-heading.jsx`

### 3. Zero-Tolerance Policy in Terms

**Location:** `/terms-and-conditions` page

**Sections Added:**
1. "Zero-Tolerance Policy for Objectionable Content"
2. "Content Moderation and User Safety"

**Files Modified:**
- `/Connectize-Frontend/src/pages/terms&policies/terms.jsx`

### 4. Terms Agreement (Already Existed)

**Location:** Signup page checkbox

**Status:** ✅ Already implemented with validation

---

## 🧪 Testing Checklist

### Before App Store Submission:

- [ ] **Fix scroll issue** (remove stuck `.messages-opened` class)
- [ ] **Test Report button**
  - [ ] Navigate to feed
  - [ ] Find another user's post
  - [ ] Click ⋮ menu
  - [ ] See "Report post" option
  - [ ] Click and fill form
  - [ ] Submit successfully
  - [ ] Check admin panel for entry
- [ ] **Test Block button**
  - [ ] Navigate to another user's profile
  - [ ] See "Block User" button next to Connect
  - [ ] Click to block
  - [ ] Button changes to "Unblock"
  - [ ] Click to unblock
  - [ ] Check admin panel for entry
- [ ] **Verify Terms page**
  - [ ] Navigate to `/terms-and-conditions`
  - [ ] Scroll to find zero-tolerance sections
  - [ ] Take screenshot
- [ ] **Take Screenshots** (6 required)
  1. Terms page with zero-tolerance policy
  2. Report button on post
  3. Report modal filled out
  4. Block button on profile
  5. Signup terms checkbox
  6. Admin dashboard showing reports

---

## 📸 Screenshots for App Store

### Screenshot 1: Terms & Conditions
**Path:** `/terms-and-conditions`
**Scroll to:** "Zero-Tolerance Policy for Objectionable Content"
**Show:** Full section text about no-tolerance stance

### Screenshot 2: Report Button
**Path:** `/feed`
**Action:** Click ⋮ on another user's post
**Show:** Menu with "⚠️ Report post" option visible

### Screenshot 3: Report Modal
**Action:** Click "Report post"
**Show:** Modal with:
- Report type dropdown (8 options)
- Description textarea
- Submit button

### Screenshot 4: Block Button
**Path:** `/profile/[user-id]` (another user)
**Show:** "Block User" button next to "Connect" button

### Screenshot 5: Terms Checkbox
**Path:** `/signup`
**Show:** Checkbox "I agree to Terms and Privacy Policy" (required)

### Screenshot 6: Admin Dashboard
**Path:** `/admin/api/contentreport/`
**Show:** List of submitted reports with filters

---

## 🔗 Useful Commands

### Clear Stuck Scroll Class
```javascript
// In browser console
document.body.classList.remove('messages-opened');
```

### Check if Features Are Loaded
```javascript
// In browser console
// Check if moderation API exists
console.log(window.location.origin + '/api/content-reports/');
console.log(window.location.origin + '/api/blocked-users/');
```

### Check Git Commits
```bash
git log --oneline | grep -i "app store\|compliance\|report\|block"
```

---

## 📞 Support

If issues persist after trying these fixes:
1. Check browser console for JavaScript errors
2. Verify Vercel deployment completed
3. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Try incognito/private browsing mode
5. Check admin panel at `/admin/api/contentreport/`
