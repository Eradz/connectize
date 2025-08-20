import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SubscriptionManagementSystem from '@/components/subscription/SubscriptionManagementSystem';
import SubscriptionDashboard from '@/pages/subscription/SubscriptionDashboard';
import SubscriptionPlanDetail from '@/pages/subscription/SubscriptionPlanDetail';
import EnhancedSubscriptionDashboard from '@/components/enhanced/EnhancedSubscriptionDashboard';
import SubscriptionManagementCenter from '@/components/enhanced/SubscriptionManagementCenter';
import EnhancedPlanComparison from '@/components/enhanced/EnhancedPlanComparison';

const SubscriptionRoutes = () => {
  return (
    <Routes>
      {/* Main subscription management system */}
      <Route path="/" element={<SubscriptionManagementSystem />} />
      <Route path="/manage" element={<SubscriptionManagementSystem />} />
      
      {/* Legacy routes - redirected to main system with appropriate tab */}
      <Route path="/dashboard" element={<Navigate to="/subscriptions?tab=dashboard" replace />} />
      <Route path="/plans" element={<Navigate to="/subscriptions?tab=plans" replace />} />
      <Route path="/features" element={<Navigate to="/subscriptions?tab=features" replace />} />
      <Route path="/billing" element={<Navigate to="/subscriptions?tab=billing" replace />} />
      
      {/* Enhanced components for specific use cases */}
      <Route path="/enhanced" element={<SubscriptionManagementCenter />} />
      <Route path="/enhanced/dashboard" element={<EnhancedSubscriptionDashboard />} />
      <Route path="/enhanced/comparison" element={<EnhancedPlanComparison />} />
      
      {/* Legacy components (kept for backward compatibility) */}
      <Route path="/legacy/dashboard" element={<SubscriptionDashboard />} />
      <Route path="/legacy/plan-detail" element={<SubscriptionPlanDetail />} />
      
      {/* Plan details */}
      <Route path="/plan/:planId" element={<SubscriptionPlanDetail />} />
      
      {/* Catch all - redirect to main management */}
      <Route path="*" element={<Navigate to="/subscriptions" replace />} />
    </Routes>
  );
};

export default SubscriptionRoutes;
