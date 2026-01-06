import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Simple card components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);
const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);
const CardContent = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

const SimpleSubscriptionManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Get active tab from URL or default to dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab') || 'dashboard';
    setActiveTab(tab);
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`?tab=${tab}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage your subscription, billing, and usage</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'plans', label: 'Plans' },
                { id: 'billing', label: 'Billing' },
                { id: 'usage', label: 'Usage' },
                { id: 'features', label: 'Features' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Current Plan</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">Enterprise</p>
                  <p className="text-gray-600">$299.99/month</p>
                  <p className="text-sm text-green-600 mt-2">✓ Active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Usage This Month</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-600">73%</p>
                  <p className="text-gray-600">of plan limits</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Next Billing</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">Sep 18</p>
                  <p className="text-gray-600">2025</p>
                  <p className="text-sm text-gray-500 mt-2">Auto-renew enabled</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'plans' && (
            <div>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Available Plans</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['Trial', 'Starter', 'Professional', 'Enterprise'].map((plan) => (
                      <div key={plan} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-lg">{plan}</h4>
                        <p className="text-gray-600 text-sm">Features for {plan.toLowerCase()} users</p>
                        <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-custom_yellow">
                          {plan === 'Enterprise' ? 'Current Plan' : 'Upgrade'}
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Billing Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Payment Method</h4>
                      <p className="text-gray-600">Visa ending in 1234</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Billing Address</h4>
                      <p className="text-gray-600">123 Business St, City, State 12345</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Next Charge</h4>
                      <p className="text-gray-600">$299.99 on September 18, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'usage' && (
            <div>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Usage Analytics</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Posts</h4>
                      <div className="flex justify-between mb-1">
                        <span>730 / 1000</span>
                        <span>73%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Storage</h4>
                      <div className="flex justify-between mb-1">
                        <span>120GB / 200GB</span>
                        <span>60%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'features' && (
            <div>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Available Features</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      'AI Insights', 'Advanced Analytics', 'Custom Branding', 
                      'Priority Support', 'White Label', 'Enterprise API',
                      'Deal Analytics', 'Unlimited Posts', 'Team Management'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/subscriptions')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-custom_yellow"
                >
                  Back to Dashboard
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Upgrade Plan
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                  Download Invoice
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Cancel Subscription
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleSubscriptionManagement;
