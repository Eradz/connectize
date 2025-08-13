# Connectize Admin Dashboard

A comprehensive, state-of-the-art admin dashboard for the Connectize platform, built with React.js and Tailwind CSS.

## Features

### 🏠 Dashboard Overview
- **Real-time Statistics**: User counts, company registrations, product listings, revenue metrics
- **Interactive Charts**: User growth trends, revenue analytics, platform health metrics
- **Recent Activity Feed**: Latest user activities, registrations, and system events
- **Quick Actions**: Direct access to common admin tasks

### 👥 User Management
- **User Listing**: Comprehensive user directory with search and filtering
- **User Details**: Profile information, activity history, verification status
- **Bulk Operations**: Mass activate/deactivate, export user data
- **User Actions**: Suspend, reactivate, delete, send notifications
- **Role-based Access**: Company user type restriction for admin access

### 🏢 Company Management
- **Company Directory**: All registered companies with detailed information
- **Company Verification**: Approve and verify business accounts
- **Company Analytics**: Growth metrics, user distribution, product/service counts
- **Industry Filtering**: Filter by industry type, company size, location

### 📦 Product Management
- **Product Catalog**: All products with images, pricing, and details
- **Approval Workflow**: Review and approve product listings
- **Category Management**: Organize products by categories
- **Performance Metrics**: Views, inquiries, and engagement data
- **Featured Products**: Promote products on the platform

### 📊 Advanced Analytics
- **User Analytics**: Registration trends, engagement metrics, retention rates
- **Revenue Analytics**: Sales data, payment processing, financial reports
- **Content Analytics**: Post engagement, product performance, service utilization
- **Platform Health**: System performance, API usage, error tracking

### ⚙️ Settings & Configuration
- **General Settings**: Site configuration, maintenance mode, registration controls
- **Security Settings**: Password policies, session management, IP whitelisting
- **Notification Settings**: Email, SMS, push notification preferences
- **API Settings**: Rate limiting, CORS configuration, API key management
- **Content Moderation**: Auto-moderation, profanity filters, spam detection
- **Analytics Settings**: Data retention, tracking preferences, privacy controls

## Technical Architecture

### Frontend Structure
```
src/
├── pages/admin/
│   ├── AdminLayout.jsx          # Main layout wrapper
│   ├── AdminDashboard.jsx       # Dashboard overview
│   ├── AdminAnalytics.jsx       # Advanced analytics
│   ├── UsersManagement.jsx      # User management
│   ├── CompaniesManagement.jsx  # Company management
│   ├── ProductsManagement.jsx   # Product management
│   └── AdminSettings.jsx        # Settings & configuration
├── components/admin/
│   └── dashboard/
│       ├── AdminSidebar.jsx     # Navigation sidebar
│       ├── AdminNavbar.jsx      # Top navigation
│       ├── StatsCard.jsx        # Statistics display
│       ├── ChartCard.jsx        # Chart components
│       ├── RecentActivityCard.jsx # Activity feed
│       └── QuickActionsCard.jsx # Quick action buttons
└── api-services/
    ├── adminStats.js            # Statistics API service
    └── adminUsers.js            # User management API service
```

### Key Dependencies
- **React Router**: Navigation and routing
- **TanStack Query**: Data fetching and caching
- **Chart.js + react-chartjs-2**: Data visualization
- **Heroicons**: Consistent iconography
- **Tailwind CSS**: Responsive styling
- **Chakra UI**: Additional UI components

## Getting Started

### Prerequisites
- Node.js 16+ installed
- Existing Connectize React application
- Access to backend API endpoints

### Installation
The admin dashboard is integrated into the existing Connectize frontend. No additional installation required.

### Required Dependencies
Install the Chart.js dependencies if not already present:

```bash
# Using npm
npm install chart.js react-chartjs-2

# Using yarn
yarn add chart.js react-chartjs-2

# Using bun
bun add chart.js react-chartjs-2
```

### Access Control
Admin dashboard is restricted to users with `CompanyUserType` role. This is enforced in:
- `AdminLayout.jsx` - Route-level protection
- Backend API endpoints - Server-side validation

## API Integration

### Mock Data vs Production
The dashboard includes mock data for development purposes. To integrate with your Django backend:

1. **Update API Services**: Replace mock data in `adminStats.js` and `adminUsers.js`
2. **Backend Endpoints**: Implement the following Django API endpoints:

```python
# Example Django URLs
urlpatterns = [
    path('api/admin/stats/', AdminStatsView.as_view()),
    path('api/admin/users/', AdminUsersListView.as_view()),
    path('api/admin/users/<int:pk>/', AdminUserDetailView.as_view()),
    path('api/admin/companies/', AdminCompaniesListView.as_view()),
    path('api/admin/products/', AdminProductsListView.as_view()),
    # ... additional endpoints
]
```

### Expected API Response Format

#### Admin Statistics
```json
{
  "users": {
    "total": 1234,
    "active": 1100,
    "new_this_month": 45
  },
  "companies": {
    "total": 567,
    "verified": 450,
    "new_this_month": 12
  },
  "products": {
    "total": 2890,
    "approved": 2750,
    "new_this_month": 89
  },
  "revenue": {
    "total": 125000,
    "this_month": 15000,
    "growth_percentage": 12.5
  }
}
```

#### User List Response
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
      "profile_picture": "https://example.com/avatar.jpg"
    }
  ],
  "count": 1234,
  "next": "https://api.example.com/admin/users/?page=2",
  "previous": null
}
```

## Customization

### Adding New Admin Pages
1. Create page component in `src/pages/admin/`
2. Add route in `src/App.jsx`
3. Update sidebar menu in `AdminSidebar.jsx`
4. Create corresponding API service

### Styling Customization
- **Colors**: Update Tailwind config for brand colors
- **Components**: Modify individual component styling
- **Layout**: Adjust sidebar, navbar, or page layouts

### Chart Customization
Charts use Chart.js configuration. Modify chart options in component files:
- Line charts for trends
- Bar charts for comparisons
- Doughnut charts for distributions
- Area charts for cumulative data

## Security Considerations

### Authentication & Authorization
- Route-level protection in `AdminLayout.jsx`
- Role-based access control (CompanyUserType)
- JWT token validation on all API calls

### Data Protection
- Sensitive data masking in UI
- Audit logging for admin actions
- Rate limiting on admin endpoints
- IP whitelisting for admin access

### Best Practices
- Regular security audits
- Keep dependencies updated
- Implement CSRF protection
- Use HTTPS in production
- Sanitize all user inputs

## Performance Optimization

### Data Loading
- Lazy loading for large datasets
- Pagination for user/company lists
- Caching with TanStack Query
- Background data refresh

### UI Performance
- Component memoization
- Virtual scrolling for large lists
- Image optimization
- Bundle splitting

## Monitoring & Analytics

### Built-in Metrics
- User engagement tracking
- Admin action logging
- Performance monitoring
- Error tracking

### External Integration
Ready for integration with:
- Google Analytics
- Mixpanel
- Segment
- Custom analytics solutions

## Support & Maintenance

### Development Workflow
1. Test with mock data first
2. Implement backend endpoints
3. Update API services
4. Test end-to-end functionality
5. Deploy and monitor

### Common Issues & Solutions

#### Authentication Issues
- Verify JWT token format
- Check CompanyUserType assignment
- Validate API endpoint permissions

#### Data Loading Issues
- Check API endpoint responses
- Verify query parameter formatting
- Monitor network requests in browser

#### Chart Display Issues
- Ensure Chart.js dependencies installed
- Check data format compatibility
- Verify responsive chart settings

## Contributing

When contributing to the admin dashboard:

1. Follow existing code patterns
2. Add proper TypeScript types
3. Include responsive design
4. Test with mock data first
5. Update documentation

## License

This admin dashboard is part of the Connectize platform. All rights reserved.

---

**Need Help?** Check the troubleshooting section or contact the development team for assistance with integration or customization.
