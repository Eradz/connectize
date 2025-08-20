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
