import React from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { InfoIcon } from '../../components/ui/ModernIcon';

const PlaceholderPage = ({ title, subtitle }) => {
  const location = useLocation();
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={title || 'Page Under Development'}
        subtitle={subtitle || `This page (${location.pathname}) is currently being developed.`}
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <InfoIcon size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            This feature is currently under development. Please check back later for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
