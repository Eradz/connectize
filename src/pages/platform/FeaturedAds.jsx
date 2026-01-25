import React from 'react';
import FeaturedAdsManager from '../../components/featured-ads/FeaturedAdsManager';

const FeaturedAdsPage = () => {
  return (
    <div className="min-h-screen ">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Featured Ads</h1>
          <p className="text-gray-600">Create and manage your featured ad campaigns</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FeaturedAdsManager />
      </div>
    </div>
  );
};

export default FeaturedAdsPage;
