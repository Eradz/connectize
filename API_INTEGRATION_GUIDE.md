# Connectize API Integration Guide

## Backend API Structure Analysis

Based on the backend code analysis, here's the correct API structure for subscription and feature integration:

### 1. Subscription API Endpoints

**Base URL**: `/api/v1/` (from subscriptions app)

#### Available Endpoints:
- `GET /api/v1/plans/` - List all subscription plans
- `GET /api/v1/plans/{id}/` - Get specific plan details
- `GET /api/v1/plans/{id}/detail_view/` - Enhanced plan details with upgrade benefits
- `GET /api/v1/plans/compare/` - Compare all plans in table format
- `POST /api/v1/plans/compare_plans/` - Compare specific plans by IDs
- `GET /api/v1/subscriptions/current/` - Get current user subscription
- `GET /api/v1/subscriptions/` - List user subscriptions

### 2. Feature Permissions API Endpoints

**Base URL**: `/api/permissions/` (from admin_permissions app)

#### Available Endpoints:
- `GET /api/permissions/features/available/` - Get all available features
- `GET /api/permissions/user/permissions/` - Get current user permissions
- `POST /api/permissions/user/check-access/` - Check specific feature access
- `GET /api/permissions/company/permissions/` - Get company permissions

### 3. Enhanced Subscription API Endpoints

**Base URL**: `/api/permissions/api/v2/` (from admin_permissions enhanced views)

#### Available Endpoints:
- `GET /api/permissions/api/v2/subscription/current/` - Enhanced subscription details
- `GET /api/permissions/api/v2/subscription/features/` - Features for current subscription
- `GET /api/permissions/api/v2/subscription/analytics/` - Usage analytics and insights
- `GET /api/permissions/api/v2/enhanced-plans/` - Enhanced plans with features
- `GET /api/permissions/api/v2/enhanced-plans/{id}/` - Specific enhanced plan details
- `GET /api/permissions/api/v2/enhanced-plans/{id}/features/` - Features for specific plan
- `GET /api/permissions/api/v2/plans/comparison/` - Detailed plan comparison
- `GET /api/permissions/api/v2/features/by-category/` - Features grouped by category

## Database Models Structure

### 1. Plan Model (subscriptions/models.py)
```python
class Plan(models.Model):
    # Basic plan info
    id = UUIDField
    name = CharField
    plan_type = CharField  # trial, starter, professional, enterprise, custom
    billing_cycle = CharField  # monthly, yearly
    price = DecimalField
    
    # Feature limits
    max_posts_per_month = IntegerField
    max_products_per_month = IntegerField
    max_services_per_month = IntegerField
    max_storage_gb = IntegerField
    max_team_members = IntegerField
    max_api_calls_per_month = IntegerField
    
    # Feature flags
    analytics_enabled = BooleanField
    api_access_enabled = BooleanField
    ai_insights_enabled = BooleanField
    featured_ads_enabled = BooleanField
    priority_support = BooleanField
    
    # Enhanced fields for frontend
    description = TextField
    tagline = CharField
    popular = BooleanField
    feature_highlights = JSONField
    business_value_props = JSONField
```

### 2. FeaturePermission Model (admin_permissions/models.py)
```python
class FeaturePermission(models.Model):
    feature_code = CharField  # unique identifier
    feature_name = CharField
    feature_category = CharField  # core_social, deal_management, ai_services, etc.
    description = TextField
    minimum_plan = CharField  # trial, starter, professional, enterprise, custom
    access_level = CharField  # basic, standard, premium, enterprise, admin
    is_enabled_globally = BooleanField
    has_usage_limits = BooleanField
    default_quota = JSONField
```

## Frontend Integration Implementation

### 1. Updated Subscription Plan Detail Page

The plan detail page now:
- Uses correct API endpoints: `/api/v1/plans/{id}/detail_view/`
- Fetches features from: `/api/permissions/features/available/`
- Filters features based on plan hierarchy
- Shows only included features with green checkmarks
- Handles API errors gracefully with fallback data

### 2. Plan Hierarchy Logic
```javascript
const planHierarchy = {
  'trial': ['trial'],
  'starter': ['trial', 'starter'],
  'professional': ['trial', 'starter', 'professional'],
  'enterprise': ['trial', 'starter', 'professional', 'enterprise'],
  'custom': ['trial', 'starter', 'professional', 'enterprise', 'custom']
};

// Features are included if plan rank >= feature minimum rank
const availablePlans = planHierarchy[planType] || ['trial'];
const includedFeatures = allFeatures.filter(feature => 
  availablePlans.includes(feature.minimum_plan?.toLowerCase())
);
```

### 3. Feature Display Logic
```javascript
// All displayed features show green checkmark (included in plan)
<CheckCircle className="h-4 w-4 text-green-600" />

// Badge shows "✓ Included" for all features
<Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
  ✓ Included
</Badge>
```

## Authentication Requirements

All API calls require authentication:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}
```

## Error Handling Strategy

1. **Primary API Call**: Try main endpoint
2. **Fallback API Call**: Try alternative endpoint if main fails
3. **Mock Data**: Use realistic mock data if all APIs fail
4. **User Feedback**: Show appropriate error messages

## Data Flow

1. **Plan Details**: `subscriptionsApi.getPlanDetails(planId)` → Plan information
2. **Features**: `fetch('/api/permissions/features/available/')` → All features
3. **Filtering**: Client-side filtering based on plan hierarchy
4. **Display**: Only included features with green checkmarks

## Mock Data Fallback

When APIs fail, the page displays realistic mock features based on plan type:
- **Trial**: Basic posting, company profile
- **Starter**: + User management
- **Professional**: + Analytics, priority support, smart recommendations
- **Enterprise**: + API access, AI insights

This ensures the page always displays meaningful content even if backend APIs are unavailable.
