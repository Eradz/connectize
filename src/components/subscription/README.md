# Subscription Management System

A comprehensive subscription management system for Connectize that integrates with Django backend APIs and provides a complete user experience for plan management, billing, features, and usage analytics.

## 🚀 Features

### Dashboard
- **Plan Overview**: Current subscription status, billing info, and key metrics
- **Usage Analytics**: Real-time usage monitoring with visual progress indicators
- **Quick Actions**: Easy access to upgrade, explore features, and billing
- **Smart Recommendations**: AI-powered suggestions based on usage patterns

### Plans Management
- **Plan Comparison**: Side-by-side comparison of all available plans
- **Upgrade/Downgrade**: Seamless plan transitions with cost calculations
- **Plan Details**: Comprehensive feature breakdowns for each plan
- **ROI Calculator**: Cost-benefit analysis tools

### Features Explorer
- **Categorized Features**: Organized by functional areas (Social Media, Analytics, AI Services, etc.)
- **Feature Status**: Clear indication of available vs. premium features
- **Usage Tracking**: Monitor feature utilization rates
- **Capability Matrix**: Detailed feature comparison across plans

### Billing Management
- **Payment History**: Complete transaction records with downloadable invoices
- **Billing Cycles**: Clear period tracking and next billing dates
- **Payment Methods**: Secure payment method management
- **Cost Analytics**: Detailed spend analysis and projections

## 🏗 Architecture

### Components Structure

```
src/components/subscription/
├── SubscriptionManagementSystem.jsx    # Main comprehensive system
├── SubscriptionRoutes.jsx              # Route configuration
├── BillingManagement.jsx              # Billing & payment management
├── UsageAnalytics.jsx                 # Usage monitoring & analytics
└── ...

src/components/enhanced/
├── SubscriptionManagementCenter.jsx   # Enhanced management hub
├── EnhancedSubscriptionDashboard.jsx  # Advanced dashboard
├── EnhancedPlanComparison.jsx         # Plan comparison tools
└── ...

src/pages/subscription/
├── SubscriptionDashboard.jsx          # Legacy dashboard
├── SubscriptionPlanDetail.jsx         # Plan detail pages
└── ...
```

### API Integration

The system integrates with the following Django backend endpoints:

#### Core Subscription APIs
- `GET /api/v1/subscriptions/current/` - Current user subscription
- `GET /api/v1/plans/` - Available subscription plans
- `POST /api/v1/subscriptions/{id}/upgrade/` - Plan upgrades
- `POST /api/v1/subscriptions/{id}/downgrade/` - Plan downgrades

#### Usage & Analytics APIs
- `GET /api/v1/subscriptions/usage/` - Current period usage
- `GET /api/v1/subscriptions/usage_history/` - Historical usage data
- `GET /api/v1/subscriptions/analytics/` - Advanced analytics & insights

#### Billing APIs
- `GET /api/v1/subscriptions/billing_history/` - Payment history
- `GET /api/v1/subscriptions/detailed_analytics/` - Billing analytics

#### Features API
- `GET /api/permissions/features/available/` - User's available features
- `GET /api/permissions/features/available/?plan_type=enterprise` - Plan-specific features

## 🛠 Usage

### Basic Implementation

```jsx
import SubscriptionManagementSystem from '@/components/subscription/SubscriptionManagementSystem';

function App() {
  return (
    <Routes>
      <Route path="/subscriptions/*" element={<SubscriptionManagementSystem />} />
    </Routes>
  );
}
```

### Tab-based Navigation

The system supports URL-based tab navigation:

- `/subscriptions?tab=dashboard` - Dashboard view
- `/subscriptions?tab=plans` - Plans management
- `/subscriptions?tab=features` - Features explorer
- `/subscriptions?tab=billing` - Billing management

### Programmatic Navigation

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to specific tab
navigate('/subscriptions?tab=plans');

// Navigate with state
navigate('/subscriptions?tab=billing', { 
  state: { highlightInvoice: 'INV-123' } 
});
```

## 🔧 Configuration

### Environment Variables

```env
# API Base URLs
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_SUBSCRIPTION_API_URL=/api/v1
REACT_APP_PERMISSIONS_API_URL=/api/permissions

# Feature Flags
REACT_APP_ENABLE_PLAN_COMPARISON=true
REACT_APP_ENABLE_USAGE_ANALYTICS=true
REACT_APP_ENABLE_ROI_CALCULATOR=true
```

### API Service Configuration

```jsx
// src/api-services/subscriptions.js
const SUBSCRIPTION_BASE_URL = '/api/v1';

export default {
  getCurrentSubscription: () => api.get(`${SUBSCRIPTION_BASE_URL}/subscriptions/current/`),
  getPlans: (params = {}) => api.get(`${SUBSCRIPTION_BASE_URL}/plans/`, { params }),
  upgradeSubscription: (id, data) => api.post(`${SUBSCRIPTION_BASE_URL}/subscriptions/${id}/upgrade/`, data),
  // ... more methods
};
```

## 📊 Data Flow

### State Management

The system uses React hooks for state management:

```jsx
const [currentSubscription, setCurrentSubscription] = useState(null);
const [availablePlans, setAvailablePlans] = useState([]);
const [features, setFeatures] = useState({});
const [usage, setUsage] = useState(null);
const [analytics, setAnalytics] = useState(null);
const [billingHistory, setBillingHistory] = useState([]);
```

### Error Handling

Comprehensive error handling with graceful fallbacks:

```jsx
const safeJsonParse = async (response, defaultValue = null) => {
  if (!response.ok) {
    console.warn(`API returned ${response.status}: ${response.statusText}`);
    return defaultValue;
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.warn('API returned non-JSON response:', contentType);
    return defaultValue;
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.warn('Failed to parse JSON response:', error);
    return defaultValue;
  }
};
```

## 🎨 UI Components

### Design System Integration

The system uses a consistent design system:

```jsx
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Progress from '@/components/ui/Progress';
```

### Responsive Design

All components are mobile-first responsive:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Plan cards */}
</div>
```

### Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast compliance
- Focus management

## 🔒 Security

### Authentication

All API calls include proper authentication headers:

```jsx
const authHeaders = await getAuthorizationHeader();
const response = await fetch('/api/v1/subscriptions/current/', {
  headers: {
    'Content-Type': 'application/json',
    ...authHeaders
  }
});
```

### Data Validation

Client-side validation for all user inputs:

```jsx
const validateUpgradeRequest = (planId, currentPlan) => {
  if (!planId || !currentPlan) {
    throw new Error('Invalid upgrade request');
  }
  // Additional validation logic
};
```

## 🧪 Testing

### Unit Tests

```jsx
// __tests__/SubscriptionManagementSystem.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import SubscriptionManagementSystem from '../SubscriptionManagementSystem';

test('renders subscription dashboard', async () => {
  render(<SubscriptionManagementSystem />);
  await waitFor(() => {
    expect(screen.getByText('Subscription Management')).toBeInTheDocument();
  });
});
```

### Integration Tests

```jsx
// Test API integration
test('loads subscription data on mount', async () => {
  const mockSubscription = { plan: { name: 'Enterprise' } };
  jest.spyOn(subscriptionsApi, 'getCurrentSubscription')
    .mockResolvedValue({ data: mockSubscription });
  
  render(<SubscriptionManagementSystem />);
  
  await waitFor(() => {
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });
});
```

## 📈 Performance

### Optimization Strategies

1. **Lazy Loading**: Components loaded on demand
2. **Memoization**: React.memo for expensive calculations
3. **Debounced API Calls**: Prevent excessive requests
4. **Cached Data**: Local storage for frequently accessed data

### Bundle Splitting

```jsx
// Lazy load heavy components
const EnhancedPlanComparison = lazy(() => 
  import('../components/enhanced/EnhancedPlanComparison')
);
```

## 🚀 Deployment

### Build Configuration

```json
{
  "scripts": {
    "build": "vite build",
    "build:subscription": "vite build --mode subscription",
    "preview": "vite preview"
  }
}
```

### Environment-specific Builds

```jsx
// vite.config.js
export default defineConfig({
  define: {
    __SUBSCRIPTION_FEATURES__: JSON.stringify(process.env.VITE_SUBSCRIPTION_FEATURES)
  }
});
```

## 🛠 Maintenance

### Adding New Features

1. Create feature component in `src/components/subscription/`
2. Add to main `SubscriptionManagementSystem.jsx`
3. Update routing in `SubscriptionRoutes.jsx`
4. Add API integration in `subscriptions.js`
5. Update tests and documentation

### API Schema Updates

When backend APIs change:

1. Update `src/api-services/subscriptions.js`
2. Update TypeScript interfaces (if using TS)
3. Update error handling
4. Update tests
5. Update documentation

## 📝 Contributing

### Code Style

- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful component names
- Include JSDoc comments for complex functions

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description
5. Address review feedback

## 🐛 Troubleshooting

### Common Issues

#### "No Active Plan" showing despite having subscription

**Solution**: Check subscription data structure in API response
```jsx
// Ensure proper data extraction
setCurrentSubscription(subscriptionData?.data?.subscription || subscriptionData);
```

#### JSON parsing errors

**Solution**: Implement safe JSON parsing with fallbacks
```jsx
const data = await safeJsonParse(response, {});
```

#### Features not loading

**Solution**: Verify permissions API endpoint and authentication
```jsx
// Check API endpoint and headers
const featuresResponse = await fetch('/api/permissions/features/available/', {
  headers: { ...authHeaders }
});
```

### Debug Mode

Enable debug logging:

```jsx
// Set in development
window.SUBSCRIPTION_DEBUG = true;

// Use in components
if (window.SUBSCRIPTION_DEBUG) {
  console.log('Subscription data:', subscriptionData);
}
```

## 📚 Resources

- [Django Backend API Documentation](../backend/docs/api.md)
- [UI Component Library](../components/ui/README.md)
- [Authentication System](../auth/README.md)
- [Testing Guide](../testing/README.md)

---

**Version**: 1.0.0  
**Last Updated**: August 2025  
**Maintainer**: Connectize Development Team
