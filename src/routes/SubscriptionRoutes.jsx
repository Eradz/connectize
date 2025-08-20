import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { webRoutes } from '../lib/webRoutes';

// Enhanced subscription components
import SubscriptionManagementCenter from '../components/enhanced/SubscriptionManagementCenter';
import EnhancedSubscriptionDashboard from '../components/enhanced/EnhancedSubscriptionDashboard';
import EnhancedPlanComparison from '../components/enhanced/EnhancedPlanComparison';

// Legacy components (for backward compatibility)
import SubscriptionDashboard from '../components/subscription/SubscriptionDashboard';
import SubscriptionPlanDetail from '../pages/subscription/SubscriptionPlanDetail';

const SubscriptionRoutes = () => {
  return (
    <Routes>
      {/* Enhanced Subscription Management Center - Main entry point */}
      <Route 
        path="/management" 
        element={<SubscriptionManagementCenter />} 
      />
      
      {/* Enhanced Dashboard */}
      <Route 
        path="/dashboard" 
        element={<EnhancedSubscriptionDashboard />} 
      />
      
      {/* Enhanced Plan Comparison */}
      <Route 
        path="/compare" 
        element={<EnhancedPlanComparison />} 
      />
      
      {/* Feature Explorer (redirect to management center) */}
      <Route 
        path="/features" 
        element={<Navigate to="/subscriptions/management?tab=features" replace />} 
      />
      
      {/* Billing (redirect to management center) */}
      <Route 
        path="/billing" 
        element={<Navigate to="/subscriptions/management?tab=billing" replace />} 
      />
      
      {/* Legacy routes for backward compatibility */}
      <Route 
        path="/" 
        element={<SubscriptionDashboard />} 
      />
      
      <Route 
        path="/plans/:planId" 
        element={<SubscriptionPlanDetail />} 
      />
      
      <Route 
        path="/upgrade/:planId" 
        element={<SubscriptionPlanDetail />} 
      />
      
      {/* Default redirect to management center */}
      <Route 
        path="*" 
        element={<Navigate to="/subscriptions/management" replace />} 
      />
    </Routes>
  );
};

export default SubscriptionRoutes;
