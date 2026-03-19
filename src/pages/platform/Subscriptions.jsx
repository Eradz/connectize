import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Subscription Plans | Connectize",
    description: "Explore Connectize subscription plans and unlock premium features for oil and gas industry networking and tools.",
  keywords: "subscription, plans, premium, pricing, Connectize",
  });

import React from 'react';
import SubscriptionDashboard from '../subscription/SubscriptionDashboard';

const SubscriptionsPage = () => {
  console.log('✅ SubscriptionsPage: Loading comprehensive subscription dashboard...');
  
  return (
    <div style={{ minHeight: '100vh' }}>
      <SubscriptionDashboard />
    </div>
  );
};

export default SubscriptionsPage;
