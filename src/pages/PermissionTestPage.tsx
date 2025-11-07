import React from 'react';
import { PermissionProvider } from '../context/PermissionContext';
import { FeatureGate, AdminGate, SubscriptionGate } from '../components/permissions/PermissionGates';
import { PermissionStatus } from '../components/permissions/PermissionStatus';
import { AdminUserPermissions } from '../components/permissions/AdminUserPermissions';
import { AdminFeatureManagement } from '../components/permissions/AdminFeatureManagement';
import { PermissionAnalytics } from '../components/permissions/PermissionAnalytics';

// Test Component for Permission System
const PermissionTestPage: React.FC = () => {
  return (
    <PermissionProvider>
      <div className="permission-test-page p-6 space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Permission System Integration Test
          </h1>
          
          {/* Permission Status Display */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Permission Status</h2>
            <PermissionStatus />
          </div>

          {/* Feature Gates Testing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Feature Access Testing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Test Analytics Feature */}
              <FeatureGate feature="advanced_analytics">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900">Advanced Analytics</h3>
                  <p className="text-blue-700 text-sm">This feature is accessible!</p>
                </div>
              </FeatureGate>

              {/* Test Report Export */}
              <FeatureGate feature="export_reports">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900">Export Reports</h3>
                  <p className="text-green-700 text-sm">You can export reports!</p>
                </div>
              </FeatureGate>

              {/* Test Custom Branding */}
              <FeatureGate feature="custom_branding">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900">Custom Branding</h3>
                  <p className="text-purple-700 text-sm">Branding features available!</p>
                </div>
              </FeatureGate>
            </div>
          </div>

          {/* Subscription Gates Testing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Subscription Access Testing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SubscriptionGate minimumPlan="basic">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900">Basic Plan Features</h3>
                  <p className="text-yellow-700 text-sm">Available with Basic plan or higher</p>
                </div>
              </SubscriptionGate>

              <SubscriptionGate minimumPlan="premium">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900">Premium Plan Features</h3>
                  <p className="text-orange-700 text-sm">Available with Premium plan or higher</p>
                </div>
              </SubscriptionGate>
            </div>
          </div>

          {/* Admin Features Testing */}
          <AdminGate>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Panel Access</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-medium text-red-900 mb-4">Admin Functions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-red-100">
                    <h4 className="font-medium text-gray-900">User Management</h4>
                    <p className="text-gray-600 text-sm">Manage user permissions</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-red-100">
                    <h4 className="font-medium text-gray-900">Feature Management</h4>
                    <p className="text-gray-600 text-sm">Create and manage features</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-red-100">
                    <h4 className="font-medium text-gray-900">Analytics Dashboard</h4>
                    <p className="text-gray-600 text-sm">View system analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </AdminGate>

          {/* API Integration Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API Integration Test</h2>
            <ApiTestComponent />
          </div>
        </div>
      </div>
    </PermissionProvider>
  );
};

// API Test Component
const ApiTestComponent: React.FC = () => {
  const [apiResults, setApiResults] = React.useState<any>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const testApiEndpoints = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test permission API
      const response = await fetch('/api/permissions/user-permissions/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        results.userPermissions = await response.json();
      } else {
        results.userPermissions = { error: `Status: ${response.status}` };
      }
    } catch (error) {
      results.userPermissions = { error: error.message };
    }

    try {
      // Test feature check
      const response = await fetch('/api/permissions/check-feature-access/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ feature_code: 'advanced_analytics' }),
      });
      
      if (response.ok) {
        results.featureCheck = await response.json();
      } else {
        results.featureCheck = { error: `Status: ${response.status}` };
      }
    } catch (error) {
      results.featureCheck = { error: error.message };
    }

    try {
      // Test available features
      const response = await fetch('/api/permissions/features/available/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        results.availableFeatures = await response.json();
      } else {
        results.availableFeatures = { error: `Status: ${response.status}` };
      }
    } catch (error) {
      results.availableFeatures = { error: error.message };
    }

    setApiResults(results);
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">API Endpoint Tests</h3>
        <button
          onClick={testApiEndpoints}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test API Endpoints'}
        </button>
      </div>

      {Object.keys(apiResults).length > 0 && (
        <div className="space-y-4">
          {Object.entries(apiResults).map(([endpoint, result]) => (
            <div key={endpoint} className="bg-white rounded-lg p-3 border">
              <h4 className="font-medium text-gray-800 mb-2 capitalize">
                {endpoint.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Admin Panel Test Page
export const AdminPanelTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('users');

  return (
    <PermissionProvider>
      <AdminGate fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      }>
        <div className="admin-panel-test p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'users', label: 'User Permissions' },
                { id: 'features', label: 'Feature Management' },
                { id: 'analytics', label: 'Analytics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'users' && <AdminUserPermissions />}
            {activeTab === 'features' && <AdminFeatureManagement />}
            {activeTab === 'analytics' && <PermissionAnalytics />}
          </div>
        </div>
      </AdminGate>
    </PermissionProvider>
  );
};

export default PermissionTestPage;
