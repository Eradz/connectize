# 📍 Report Button Location Guide

## Where is the Report Button?

### **Location:** News Feed Posts (Feed Page)

The **Report button** appears on the **3-dot menu (⋮)** of posts created by OTHER users.

---

## 🎯 Visual Guide

### **On YOUR OWN Posts:**
```
┌────────────────────────────────────┐
│  👤 Your Name                   ⋮ │  ← Click this
│  • 2 hours ago                     │
│────────────────────────────────────│
│  This is your post content...      │
│                                    │
└────────────────────────────────────┘

When you click ⋮ on YOUR post:
┌─────────────────┐
│ ✏️  Edit post    │
│ 🗑️  Delete post  │
└─────────────────┘
```

### **On ANOTHER USER's Posts:**
```
┌────────────────────────────────────┐
│  👤 John Doe                    ⋮ │  ← Click this
│  • 2 hours ago                     │
│────────────────────────────────────│
│  This is John's post content...    │
│                                    │
└────────────────────────────────────┘

When you click ⋮ on ANOTHER USER's post:
┌──────────────────┐
│ ⚠️  Report post   │  ← NEW! App Store Compliance
└──────────────────┘
```

---

## 📋 Step-by-Step Testing

### **Step 1: Go to News Feed**
```
Navigate to: /feed
OR click "Feed" in the navigation menu
```

### **Step 2: Find Another User's Post**
Look for posts that show:
- A different user's name (not yours)
- Posts from people you follow or in your network

**Important:** You must be viewing ANOTHER user's post, not your own!

### **Step 3: Click the 3-Dot Menu (⋮)**
- Located in the **top-right corner** of the post
- Next to the user's name and timestamp

### **Step 4: See Report Option**
You should see:
```
┌──────────────────┐
│ ⚠️  Report post   │
└──────────────────┘
```

### **Step 5: Click "Report post"**
A modal will appear with:
- **Report Type dropdown** (8 options):
  - Spam
  - Harassment
  - Hate Speech
  - Violence
  - Nudity
  - Fake Profile
  - Inappropriate
  - Other
- **Description textarea** (required)
- **Submit button**

---

## 🧪 Testing on Local Development

### **Terminal:**
```bash
cd /Users/lekiaprosper/Documents/Dev/Connectize/Connectize-Frontend
npm run dev
```

### **Browser:**
1. Open: `http://localhost:5173` (or the port shown)
2. Login with your account
3. Navigate to `/feed`
4. Find a post by another user
5. Click ⋮ menu
6. Should see "⚠️ Report post"

---

## 🔍 Troubleshooting

### **"I don't see the Report button!"**

**Check these:**

1. **Are you viewing YOUR OWN post?**
   - ❌ Report button does NOT show on your posts
   - ✅ Only shows on OTHER users' posts

2. **Are you logged in?**
   - Must be authenticated to see the button

3. **Hard refresh the browser:**
   - Mac: Cmd + Shift + R
   - Windows: Ctrl + Shift + R

4. **Clear browser cache:**
   - Settings → Privacy → Clear browsing data

5. **Check browser console for errors:**
   - F12 → Console tab
   - Look for JavaScript errors

### **"The button doesn't work!"**

**Check:**
1. Network tab (F12 → Network)
2. When you click Submit, should see:
   - Request to: `/api/content-reports/report_content/`
   - Method: POST
   - Status: 200 or 201

**If 400/500 error:**
- Check backend is running
- Check migrations were applied
- Check API endpoint is registered

---

## 📸 Screenshot Locations for App Store

### **Screenshot 1: Three-Dot Menu**
- **Path:** `/feed`
- **Action:** Hover over ⋮ on another user's post
- **Show:** Menu button visible

### **Screenshot 2: Report Option Visible**
- **Path:** `/feed`
- **Action:** Click ⋮ on another user's post
- **Show:** Dropdown menu with "⚠️ Report post" option

### **Screenshot 3: Report Modal**
- **Path:** `/feed`
- **Action:** Click "Report post"
- **Show:** Modal with:
  - Title: "Report Content"
  - Dropdown: Select report type
  - Textarea: Description field
  - Button: Submit

### **Screenshot 4: Success Toast**
- **Path:** `/feed`
- **Action:** Submit a test report
- **Show:** Success notification appearing

---

## 🎨 Code Reference

### **File:** `src/components/admin/feeds/DiscoverPosts.jsx`

### **Lines 197-232:** The Report Button Logic

```javascript
{postItem?.user?.id === currentUser?.id ? (
  // If it's YOUR post:
  <MoreOptions className="shrink-0 !max-w-[120px]">
    <div className="flex flex-col gap-2">
      <ButtonWithTooltipIcon
        text="Edit post"
        IconName={Pencil1Icon}
        onClick={() => setIsEditing(true)}
      />
      <ButtonWithTooltipIcon
        text="Delete post"
        IconName={TrashIcon}
        onClick={async () => {
          await deletePost(postItem?.id);
        }}
      />
    </div>
  </MoreOptions>
) : (
  // If it's ANOTHER USER's post:
  <MoreOptions className="shrink-0 !max-w-[120px]">
    <div className="flex flex-col gap-2">
      <ButtonWithTooltipIcon
        text="Report post"
        IconName={ExclamationTriangleIcon}  // ⚠️ Warning Triangle
        onClick={() => setShowReportModal(true)}
        className="!text-red-600 hover:!text-red-500"
      />
    </div>
  </MoreOptions>
)}
```

### **Key Points:**
- **Condition:** `postItem?.user?.id === currentUser?.id`
- **Your post:** Shows Edit/Delete
- **Other's post:** Shows Report (NEW!)
- **Icon:** ExclamationTriangleIcon (⚠️)
- **Color:** Red (#DC2626)
- **Action:** Opens ReportModal

---

## ✅ Verification Checklist

Before submitting to App Store:

- [ ] Report button visible on OTHER users' posts
- [ ] Report button NOT visible on YOUR posts
- [ ] Clicking button opens modal
- [ ] Modal has 8 report types
- [ ] Description field is required
- [ ] Submit button works
- [ ] Success toast appears
- [ ] Report saved in database
- [ ] Admin can view report at `/admin/api/contentreport/`

---

## 📞 Quick Console Test

**Test if button exists:**
```javascript
// In browser console (F12)
// On the feed page with another user's post
document.querySelector('[data-tooltip="Report post"]');
// Should return an element, not null
```

**Test API endpoint:**
```javascript
// In browser console
fetch('/api/content-reports/report_content/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    content_type: 'post',
    content_id: 1,
    reported_user_id: 2,
    report_type: 'spam',
    description: 'Test report'
  })
}).then(r => r.json()).then(console.log);
```

---

## 🎯 Summary

**Report Button Location:**
- **Page:** News Feed (`/feed`)
- **Element:** Post ⋮ menu (top-right)
- **Visibility:** Only on OTHER users' posts
- **Icon:** ⚠️ (Warning Triangle)
- **Color:** Red
- **Text:** "Report post"

**To Test:**
1. Go to /feed
2. Find someone else's post
3. Click ⋮
4. See "Report post"
5. Click it
6. Fill form
7. Submit
8. Check admin panel

**Commit:** ed910d589a3a4736f4e0bdcb7b4f04d832560c22
**Status:** ✅ Implemented and Deployed
