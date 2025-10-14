# 🚫 User Blocking - Functionality & Behavior

## What Happens When a User is Blocked?

When User A blocks User B on Connectize, the following occurs:

---

## ✅ **Currently Implemented (Basic Blocking)**

### **1. Block Record is Created**
- Stored in `BlockedUser` table (database)
- Fields recorded:
  - `blocker` - User who initiated the block (User A)
  - `blocked` - User being blocked (User B)
  - `reason` - Optional reason for blocking
  - `created_at` - Timestamp of when block occurred

### **2. Block Button State Changes**
- Button text changes from **"Block User"** → **"Unblock"**
- Button color changes from red to gray
- State is persisted (survives page refresh)
- Stored in database, not localStorage

### **3. User Can Unblock Later**
- Click "Unblock" button to remove the block
- Deletes the `BlockedUser` record
- Relationship restored to normal
- All restrictions removed

### **4. Database Queries Available**
The API provides these endpoints:

```
GET  /api/blocked-users/my_blocked_users/    - List all users you've blocked
GET  /api/blocked-users/is_blocked/?user_id=X - Check if specific user is blocked
POST /api/blocked-users/block_user/          - Block a user
POST /api/blocked-users/unblock_user/        - Unblock a user
```

---

## ❌ **Not Currently Implemented (Needs Implementation)**

### **1. Content Filtering**
**What SHOULD happen:** Blocked user's content is hidden from feeds

**Current Status:** ❌ Not implemented

**What's visible now:**
- ✅ Block button works (creates database record)
- ❌ Blocked user's posts still show in feed
- ❌ Blocked user's comments still visible
- ❌ Blocked user can still see your content

**Where to implement:**
```python
# Backend: /NEM/api/views/post_view.py (or similar)

def get_queryset(self):
    user = self.request.user
    if user.is_authenticated:
        # Get list of blocked user IDs
        blocked_user_ids = BlockedUser.objects.filter(
            blocker=user
        ).values_list('blocked_id', flat=True)
        
        # Exclude posts from blocked users
        return Post.objects.exclude(
            user_id__in=blocked_user_ids
        ).order_by('-created_at')
    
    return Post.objects.all().order_by('-created_at')
```

### **2. Interaction Prevention**
**What SHOULD happen:** Blocked users can't interact with each other

**Current Status:** ❌ Not implemented

**Interactions to block:**
- ❌ Blocked user can still comment on your posts
- ❌ Blocked user can still like your posts
- ❌ Blocked user can still message you
- ❌ Blocked user can still connect with you
- ❌ Blocked user can still see your profile

**Where to implement:**
```python
# In each interaction endpoint (comments, likes, messages, etc.)

def create(self, request, *args, **kwargs):
    # Check if blocked
    is_blocked = BlockedUser.objects.filter(
        Q(blocker=request.user, blocked=target_user) |
        Q(blocker=target_user, blocked=request.user)
    ).exists()
    
    if is_blocked:
        return Response(
            {'error': 'You cannot interact with this user'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Continue with normal creation...
```

### **3. Notification Prevention**
**What SHOULD happen:** No notifications from blocked users

**Current Status:** ❌ Not implemented

**Notifications to block:**
- ❌ Likes from blocked users
- ❌ Comments from blocked users
- ❌ Messages from blocked users
- ❌ Connection requests from blocked users

### **4. Search/Discovery Filtering**
**What SHOULD happen:** Blocked users hidden from search results

**Current Status:** ❌ Not implemented

**Where blocked users still appear:**
- ❌ User search results
- ❌ Suggested connections
- ❌ "People you may know"
- ❌ Company employee lists

### **5. Bidirectional Blocking**
**What SHOULD happen:** Block works both ways

**Current Status:** ⚠️ Partial (one-way only)

**Current behavior:**
- ✅ User A blocks User B → User B's content hidden from User A
- ❌ User B can still see User A's content
- ❌ User B doesn't know they're blocked

**Best practice:** Block should be mutual (both users can't see each other)

---

## 📋 **Implementation Priority Checklist**

### **High Priority (App Store Compliance):**
- [ ] **Hide blocked users' posts from feed**
  - File: `/NEM/api/views/` (post views)
  - Filter out blocked users in `get_queryset()`
- [ ] **Hide blocked users' comments**
  - File: `/NEM/api/views/` (comment views)
  - Filter comments from blocked users
- [ ] **Prevent blocked users from messaging**
  - File: `/NEM/chat/` or `/NEM/notification/`
  - Check block status before allowing message

### **Medium Priority:**
- [ ] Block users from commenting on your posts
- [ ] Block users from liking your posts
- [ ] Hide blocked users from search results
- [ ] Prevent connection requests from blocked users

### **Low Priority (Nice to Have):**
- [ ] Hide blocked users from "People you may know"
- [ ] Analytics on blocking patterns
- [ ] Admin dashboard for blocking statistics

---

## 🛠️ **Implementation Guide**

### **Step 1: Create Helper Function (Backend)**

Add to `/NEM/api/utils/blocking.py`:

```python
from api.models.content_moderation_model import BlockedUser
from django.db.models import Q

def is_blocked(user1, user2):
    """
    Check if user1 has blocked user2 or vice versa
    Returns True if either user has blocked the other
    """
    return BlockedUser.objects.filter(
        Q(blocker=user1, blocked=user2) |
        Q(blocker=user2, blocked=user1)
    ).exists()

def get_blocked_user_ids(user):
    """
    Get list of user IDs that this user has blocked
    """
    return BlockedUser.objects.filter(
        blocker=user
    ).values_list('blocked_id', flat=True)

def get_blockers_ids(user):
    """
    Get list of user IDs who have blocked this user
    """
    return BlockedUser.objects.filter(
        blocked=user
    ).values_list('blocker_id', flat=True)

def get_all_blocked_ids(user):
    """
    Get combined list of:
    - Users this user has blocked
    - Users who have blocked this user
    """
    blocked = set(get_blocked_user_ids(user))
    blockers = set(get_blockers_ids(user))
    return list(blocked.union(blockers))
```

### **Step 2: Apply to Post Feed**

Modify `/NEM/api/views/post_view.py` (or wherever posts are queried):

```python
from api.utils.blocking import get_all_blocked_ids

class PostViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.all()
        
        if user.is_authenticated:
            # Filter out posts from blocked users and users who blocked you
            blocked_ids = get_all_blocked_ids(user)
            queryset = queryset.exclude(user_id__in=blocked_ids)
        
        return queryset.order_by('-created_at')
```

### **Step 3: Apply to Comments**

```python
# In comment views
def get_queryset(self):
    queryset = super().get_queryset()
    
    if self.request.user.is_authenticated:
        blocked_ids = get_all_blocked_ids(self.request.user)
        queryset = queryset.exclude(user_id__in=blocked_ids)
    
    return queryset
```

### **Step 4: Block Interactions**

```python
# In comment creation view
def create(self, request, *args, **kwargs):
    post_id = request.data.get('post_id')
    post = Post.objects.get(id=post_id)
    
    # Check if blocked
    if is_blocked(request.user, post.user):
        return Response(
            {'error': 'You cannot comment on this post'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return super().create(request, *args, **kwargs)
```

### **Step 5: Frontend Query Invalidation**

When a user is blocked/unblocked, refresh the feed:

```javascript
// In BlockUserButton.jsx
import { useQueryClient } from "@tanstack/react-query";

const BlockUserButton = ({ userId, userName }) => {
  const queryClient = useQueryClient();
  
  const handleBlock = async () => {
    setLoading(true);
    try {
      await blockUser(userId);
      setIsBlocked(true);
      
      // Refresh feed to hide blocked user's content
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['comments']);
      
      toast.success(`Blocked ${userName}. Their content is now hidden.`);
    } catch (error) {
      toast.error("Error blocking user");
    } finally {
      setLoading(false);
    }
  };
};
```

---

## 🎯 **Expected User Experience (After Full Implementation)**

### **When User A Blocks User B:**

1. **Immediate UI Change:**
   - ✅ Block button → "Unblock"
   - ✅ Toast notification: "Blocked [Name]. Their content is now hidden."

2. **Feed Changes:**
   - ❌ User B's posts disappear from User A's feed
   - ❌ User B's comments disappear from all posts
   - ❌ User B's likes not shown

3. **Profile Access:**
   - ❌ User B's profile hidden/restricted for User A
   - ❌ User B cannot view User A's profile (optional, based on privacy settings)

4. **Interactions Prevented:**
   - ❌ User B cannot comment on User A's posts
   - ❌ User B cannot like User A's posts
   - ❌ User B cannot message User A
   - ❌ User B cannot send connection request to User A

5. **Search & Discovery:**
   - ❌ User B doesn't appear in User A's search results
   - ❌ User B not suggested to User A

6. **Mutual Blocking (Recommended):**
   - ❌ User A cannot see User B's content
   - ❌ User B cannot see User A's content
   - ⚠️ Neither user knows they're blocked (for safety)

---

## 🔐 **Privacy & Safety Considerations**

### **Should the blocked user know?**
**Recommendation:** ❌ No

**Reasons:**
- Prevents retaliation
- Reduces harassment
- User safety priority
- Industry standard (Twitter, Instagram, Facebook all hide block status)

**How it appears to blocked user:**
- They can still see your profile (but it's empty/limited)
- Their comments/likes appear normal to them
- But you never see their interactions
- Appears as if you're just not engaging

### **Block vs Mute**
Some platforms offer both:

**Block:**
- Complete separation
- No interactions possible
- Bidirectional

**Mute (Not implemented):**
- Hide their content from you
- They can still interact
- One-directional
- Less severe

---

## 📊 **Current Implementation Status**

| Feature | Status | Priority |
|---------|--------|----------|
| Block button UI | ✅ Implemented | - |
| Database record | ✅ Implemented | - |
| API endpoints | ✅ Implemented | - |
| Hide posts in feed | ❌ Not implemented | 🔴 High |
| Hide comments | ❌ Not implemented | 🔴 High |
| Block messaging | ❌ Not implemented | 🟡 Medium |
| Block interactions | ❌ Not implemented | 🟡 Medium |
| Hide from search | ❌ Not implemented | 🟢 Low |
| Admin dashboard | ✅ Implemented | - |

---

## 🧪 **Testing the Current Implementation**

### **What Works Now:**
1. Go to another user's profile
2. Click "Block User"
3. See toast: "You have blocked [Name]"
4. Button changes to "Unblock"
5. Block record created in database
6. Visit `/admin/api/blockeduser/` to see the record

### **What Doesn't Work Yet:**
1. Blocked user's posts still visible in feed
2. Can still see blocked user's comments
3. Blocked user can still message you
4. Blocked user can still interact with your posts

---

## 🚀 **Next Steps for Full Implementation**

1. **Create blocking utility functions** (30 mins)
2. **Apply to post queries** (15 mins)
3. **Apply to comment queries** (15 mins)
4. **Block messaging** (30 mins)
5. **Block interactions** (1 hour)
6. **Frontend query invalidation** (15 mins)
7. **Testing** (1 hour)

**Total estimated time:** ~3.5 hours for complete blocking implementation

---

## 📝 **Summary**

**Currently:**
- ✅ User can click "Block User" button
- ✅ Block record stored in database
- ✅ Button state persists
- ✅ User can unblock later
- ❌ Blocked user's content still visible
- ❌ Interactions not prevented

**For App Store Compliance:**
The current implementation **partially** meets requirements:
- ✅ "Mechanism for users to block abusive users" - Yes, button exists
- ⚠️ But blocking doesn't actually hide content yet

**Recommendation:**
Implement content filtering (Steps 1-3 above) before App Store submission to fully comply with the "block abusive users" requirement.

---

**Status:** Foundational blocking infrastructure complete. Content filtering and interaction prevention pending implementation.
