# Connectize Admin Dashboard - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
# If not already installed
npm install chart.js react-chartjs-2
# or
bun add chart.js react-chartjs-2
```

### 2. Access Admin Dashboard
- Navigate to: `http://localhost:3000/admin`
- Login with a user that has `CompanyUserType` role
- Start exploring the dashboard!

### 3. Current Status
✅ **Working Now:**
- Dashboard overview with mock data
- User management interface
- Company management page
- Product management page
- Analytics dashboard
- Settings configuration
- Responsive design
- Role-based access control

🔄 **Next Steps (Backend Integration):**
- Implement Django API endpoints
- Replace mock data with real API calls
- Add user authentication middleware
- Configure admin permissions

## 📁 Files Created/Modified

### New Admin Files
```
src/pages/admin/
├── AdminLayout.jsx           ✅ Complete
├── AdminDashboard.jsx        ✅ Complete  
├── AdminAnalytics.jsx        ✅ Complete
├── UsersManagement.jsx       ✅ Complete
├── CompaniesManagement.jsx   ✅ Complete
├── ProductsManagement.jsx    ✅ Complete
└── AdminSettings.jsx         ✅ Complete

src/components/admin/dashboard/
├── AdminSidebar.jsx          ✅ Complete
├── AdminNavbar.jsx           ✅ Complete
├── StatsCard.jsx            ✅ Complete
├── ChartCard.jsx            ✅ Complete
├── RecentActivityCard.jsx   ✅ Complete
└── QuickActionsCard.jsx     ✅ Complete

src/api-services/
├── adminStats.js            ✅ Complete (with mock data)
└── adminUsers.js            ✅ Complete (with mock data)
```

### Modified Existing Files
```
src/App.jsx                  ✅ Added admin routes
src/lib/webRoutes.js         ✅ Extended route definitions
```

## 🔧 Backend Integration Checklist

### Django API Endpoints Needed
```python
# Add these to your Django urls.py and implement views

# Statistics
GET /api/admin/stats/                    # Dashboard stats
GET /api/admin/users/stats/              # User analytics
GET /api/admin/companies/stats/          # Company analytics
GET /api/admin/products/stats/           # Product analytics

# User Management
GET /api/admin/users/                    # List users (with filters)
GET /api/admin/users/{id}/               # User details
PATCH /api/admin/users/{id}/status/      # Update user status
POST /api/admin/users/{id}/suspend/      # Suspend user
POST /api/admin/users/{id}/reactivate/   # Reactivate user
DELETE /api/admin/users/{id}/            # Delete user
POST /api/admin/users/bulk/              # Bulk operations

# Company Management  
GET /api/admin/companies/                # List companies
GET /api/admin/companies/{id}/           # Company details
PATCH /api/admin/companies/{id}/         # Update company
POST /api/admin/companies/{id}/verify/   # Verify company

# Product Management
GET /api/admin/products/                 # List products
PATCH /api/admin/products/{id}/          # Update product
POST /api/admin/products/{id}/approve/   # Approve product
```

### Permission Setup
```python
# In your Django models/views
class CompanyUserType(models.TextChoices):
    INDIVIDUAL = 'individual'
    COMPANY = 'company'
    ADMIN = 'admin'  # Add this if not exists

# View permission decorator
def admin_required(view_func):
    def wrapped_view(request, *args, **kwargs):
        if request.user.user_type != 'company':  # Adjust as needed
            return Response({'error': 'Admin access required'}, 
                          status=403)
        return view_func(request, *args, **kwargs)
    return wrapped_view
```

## 📊 Data Format Examples

### Dashboard Stats Response
```json
{
  "users": {
    "total": 1250,
    "active": 1100,
    "new_this_month": 45,
    "growth_rate": 12.5
  },
  "companies": {
    "total": 567,
    "verified": 450,
    "new_this_month": 12
  },
  "products": {
    "total": 2890,
    "approved": 2750,
    "pending": 140
  },
  "revenue": {
    "total": 125000,
    "this_month": 15000
  }
}
```

### User List Response
```json
{
  "results": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe", 
      "email": "john@example.com",
      "user_type": "individual",
      "is_active": true,
      "is_verified": true,
      "date_joined": "2024-01-15T10:30:00Z",
      "company_name": null,
      "total_posts": 15,
      "total_products": 0
    }
  ],
  "count": 1250,
  "next": "http://api/admin/users/?page=2",
  "previous": null
}
```

## 🔒 Security Setup

### 1. Role-Based Access
```javascript
// Already implemented in AdminLayout.jsx
const { user } = useAuth();
if (user?.user_type !== 'company') {
  return <Navigate to="/login" replace />;
}
```

### 2. API Authentication
```javascript
// Already setup in api-services/auth.js
// Just ensure your Django backend validates JWT tokens
```

### 3. Route Protection
```javascript
// Already implemented in App.jsx admin routes
// Protected by AdminLayout component
```

## 🎨 Customization Options

### 1. Branding
```javascript
// Update in AdminNavbar.jsx
const siteName = "Your Company Admin";

// Update colors in Tailwind classes
className="bg-blue-600" // Change to your brand color
```

### 2. Menu Items
```javascript
// Modify in AdminSidebar.jsx
const adminMenuItems = [
  // Add/remove/modify menu items
];
```

### 3. Dashboard Cards
```javascript
// Modify in AdminDashboard.jsx
// Add/remove statistics cards as needed
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot access admin dashboard"
- **Solution**: Ensure user has correct role in database
- **Check**: User.user_type === 'company' (or your admin role)

#### 2. "Charts not displaying"
- **Solution**: Install Chart.js dependencies
- **Command**: `npm install chart.js react-chartjs-2`

#### 3. "Mock data showing instead of real data"
- **Solution**: Implement backend API endpoints
- **Check**: API calls in adminStats.js and adminUsers.js

#### 4. "Sidebar not responsive"
- **Solution**: Clear browser cache and check Tailwind CSS
- **Verify**: Mobile breakpoints in AdminLayout.jsx

## 🚀 Deployment Checklist

### Before Production
- [ ] Replace all mock data with real API calls
- [ ] Test admin permissions thoroughly
- [ ] Implement proper error handling
- [ ] Add loading states for all data fetching
- [ ] Test responsive design on all devices
- [ ] Configure production API endpoints
- [ ] Set up admin user roles in database
- [ ] Test bulk operations carefully
- [ ] Implement audit logging for admin actions
- [ ] Add rate limiting for admin endpoints

### Performance Optimization
- [ ] Enable React Query caching
- [ ] Implement pagination for large datasets
- [ ] Add virtual scrolling for user/company lists
- [ ] Optimize chart rendering performance
- [ ] Implement lazy loading for dashboard components

## 📞 Support

- **Documentation**: See `ADMIN_DASHBOARD_README.md` for detailed docs
- **Issues**: Check common troubleshooting steps above
- **Development**: Follow React and Django best practices
- **Testing**: Test with mock data first, then integrate APIs

---

**You're all set!** 🎉 The admin dashboard is ready to use with mock data. Follow the backend integration steps to connect with your Django API.
