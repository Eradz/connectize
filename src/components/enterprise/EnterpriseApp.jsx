/**
 * ENTERPRISE SYSTEM ENTRY POINT
 * Fortune 500-Level Application Router
 * Supervised by: Research & Product Development Team
 */

import React, { useEffect, useState, useCallback } from 'react';
import EnterpriseDashboard from './EnterpriseDashboard';
import { useSubscriptionStore } from '../../stores/enterprise-store';

// =============================================================================
// ENTERPRISE APP COMPONENT
// =============================================================================

const EnterpriseApp = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { 
    currentSubscription, 
    loading, 
    subscriptionLoading,
    error,
    fetchMySubscription 
  } = useSubscriptionStore();

  console.log('EnterpriseApp: Component rendered, isInitialized:', isInitialized, 'subscriptionLoading:', subscriptionLoading, 'loading:', loading);

  // Fetch subscription data on mount - only once
  useEffect(() => {
    console.log('🔄 EnterpriseApp: useEffect triggered, isInitialized:', isInitialized);
    
    let isMounted = true;
    
    const initializeSubscription = async () => {
      console.log('🔄 initializeSubscription: Starting...');
      
      console.log('EnterpriseApp: Initializing subscription data...');
      try {
        console.log('🔄 About to call fetchMySubscription...');
        await fetchMySubscription();
        if (isMounted) {
          console.log('EnterpriseApp: Initialization complete');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('EnterpriseApp: Initialization failed:', error);
        if (isMounted) {
          setIsInitialized(true); // Still mark as initialized to prevent infinite loops
        }
      }
    };

    // Always fetch subscription data on mount
    initializeSubscription();
    
    return () => {
      console.log('🔄 EnterpriseApp: useEffect cleanup');
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Development mode: allow access even without subscription for testing
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Show loading while fetching subscription (only on first load)
  if (!isInitialized && subscriptionLoading) {
    console.log('EnterpriseApp: Showing initial loading state');
    return <EnterpriseLoading />;
  }

  // Check if user has enterprise access
  const hasEnterpriseAccess = isDevelopment || (currentSubscription && currentSubscription.status === 'active');

  // Only log access check if we haven't initialized or subscription state changed
  console.log('EnterpriseApp: Access check', { 
    isDevelopment, 
    currentSubscription: currentSubscription?.status, 
    hasEnterpriseAccess,
    isInitialized,
    subscriptionLoading,
    loading
  });

  if (!hasEnterpriseAccess && isInitialized && !isDevelopment) {
    console.log('EnterpriseApp: Access required');
    return <EnterpriseAccessRequired />;
  }

  // Show error state if there was an error and no subscription
  if (error && !currentSubscription && isInitialized && !isDevelopment) {
    return <EnterpriseError error={error} onRetry={() => fetchMySubscription()} />;
  }

  console.log('EnterpriseApp: Rendering dashboard');
  // Return the dashboard directly since we're already inside the router context
  return <EnterpriseDashboard />;
};

// =============================================================================
// ENTERPRISE LOADING COMPONENT
// =============================================================================

const EnterpriseLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Loading Enterprise Dashboard
        </h3>
        
        <p className="text-sm text-gray-500">
          Verifying subscription access...
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// ENTERPRISE ERROR COMPONENT
// =============================================================================

const EnterpriseError = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connection Error
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          {error || 'Failed to connect to Enterprise services'}
        </p>
        
        <button 
          onClick={onRetry}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// ENTERPRISE ACCESS REQUIRED COMPONENT
// =============================================================================

const EnterpriseAccessRequired = () => {
  const { fetchMySubscription } = useSubscriptionStore();

  const handleUpgrade = () => {
    // In a real app, this would redirect to a subscription upgrade page
    console.log('Redirecting to subscription upgrade...');
  };

  const handleRetry = () => {
    fetchMySubscription();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Enterprise Access Required
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          You need an active enterprise subscription to access the Fortune 500-level dashboard and features.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={handleUpgrade}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Upgrade to Enterprise
          </button>
          
          <button 
            onClick={handleRetry}
            className="w-full text-gray-600 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Retry Connection
          </button>
        </div>

        {/* Development mode indicator */}
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-700">
              Development Mode: Backend connection may be required
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseApp;
