import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// New comprehensive subscription management system
import SubscriptionManagementSystem from '../components/subscription/SubscriptionManagementSystem';
import TestSubscriptionManagement from '../components/TestSubscriptionManagement';
import SimpleSubscriptionManagement from '../components/SimpleSubscriptionManagement';

// Enhanced subscription components for specific use cases
import SubscriptionManagementCenter from '../components/enhanced/SubscriptionManagementCenter';
import EnhancedSubscriptionDashboard from '../components/enhanced/EnhancedSubscriptionDashboard';
import EnhancedPlanComparison from '../components/enhanced/EnhancedPlanComparison';

// Legacy components (for backward compatibility)
import SubscriptionDashboard from '../components/subscription/SubscriptionDashboard';
import SubscriptionPlanDetail from '../pages/subscription/SubscriptionPlanDetail';

const SubscriptionRoutes = () => {
  return (
    <Routes>
      {/* Main comprehensive subscription management system */}
      <Route 
        path="/" 
        element={<SubscriptionManagementSystem />} 
      />
      
      {/* Subscription management routes */}
      <Route 
        path="/management" 
        element={<SubscriptionManagementSystem />} 
      />
      
      <Route 
        path="/manage" 
        element={<SubscriptionManagementSystem />} 
      />
      
      {/* Direct tab access through URL params */}
      <Route 
        path="/dashboard" 
        element={<Navigate to="/subscriptions?tab=dashboard" replace />} 
      />
      
      <Route 
        path="/plans" 
        element={<Navigate to="/subscriptions?tab=plans" replace />} 
      />
      
      <Route 
        path="/features" 
        element={<Navigate to="/subscriptions?tab=features" replace />} 
      />
      
      <Route 
        path="/billing" 
        element={<Navigate to="/subscriptions?tab=billing" replace />} 
      />
      
      {/* Enhanced components for specific workflows */}
      <Route 
        path="/enhanced" 
        element={<SubscriptionManagementCenter />} 
      />
      
      <Route 
        path="/enhanced/dashboard" 
        element={<EnhancedSubscriptionDashboard />} 
      />
      
      <Route 
        path="/enhanced/compare" 
        element={<EnhancedPlanComparison />} 
      />
      
      {/* Plan-specific routes */}
      {/* Singular legacy path */}
      <Route 
        path="plan/:planId" 
        element={<SubscriptionPlanDetail />} 
      />
      {/* Plural path matching webRoutes.subscriptionPlanDetail (/subscriptions/plans/:planId) */}
      <Route 
        path="plans/:planId" 
        element={<SubscriptionPlanDetail />} 
      />
      
      <Route 
        path="upgrade/:planId" 
        element={<SubscriptionPlanDetail />} 
      />
      
      {/* Legacy routes for backward compatibility */}
      <Route 
        path="/legacy" 
        element={<SubscriptionDashboard />} 
      />
      
      <Route 
        path="/legacy/dashboard" 
        element={<SubscriptionDashboard />} 
      />
      
      <Route 
        path="/legacy/plan-detail" 
        element={<SubscriptionPlanDetail />} 
      />
      
      {/* Catch-all redirect to main system */}
      <Route 
        path="*" 
        element={<Navigate to="/subscriptions" replace />} 
      />
    </Routes>
  );
};

export default SubscriptionRoutes;
