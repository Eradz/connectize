import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import { 
  CheckCircle, 
  TrendingUp, 
  Crown, 
  Zap, 
  Shield,
  BarChart3,
  Settings,
  ArrowRight,
  Sparkles,
  Users,
  CreditCard,
  Calendar,
  Bell
} from 'lucide-react';

import EnhancedSubscriptionDashboard from './EnhancedSubscriptionDashboard';
import EnhancedPlanComparison from './EnhancedPlanComparison';

const SubscriptionManagementCenter = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subscription, setSubscription] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUserSubscription(), fetchNotifications()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchUserSubscription = async () => {
    try {
      const res = await fetch('/api/admin_permissions/api/v2/subscription/current/');
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Derive notifications from analytics recommendations
      const res = await fetch('/api/admin_permissions/api/v2/subscription/analytics/');
      const data = await res.json();

      const recs = data?.recommendations || [];
      const newNotifications = recs.map((rec) => {
        let type = 'info';
        if (rec.type === 'usage_warning') type = 'warning';
        else if (rec.type === 'feature_suggestion') type = 'info';
        else if (rec.type === 'upgrade_recommendation') type = 'success';

        return {
          id: Date.now() + Math.random(),
          type,
          title: rec.title || (type === 'warning' ? 'Usage Alert' : type === 'success' ? 'Upgrade Recommendation' : 'Feature Suggestion'),
          message: rec.message,
          action: rec.suggestion || rec.benefit || '',
          timestamp: new Date()
        };
      });

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'warning': TrendingUp,
      'info': Sparkles,
      'success': Crown,
      'error': Shield
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'warning': 'border-yellow-200 bg-yellow-50',
      'info': 'border-blue-200 bg-blue-50',
      'success': 'border-green-200 bg-green-50',
      'error': 'border-red-200 bg-red-50'
    };
    return colorMap[type] || 'border-gray-200 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Subscription Management
                </h1>
              </div>
              
              {subscription && (
                <Badge className="bg-blue-100 text-blue-800">
                  {subscription.plan?.name} Plan
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Billing cycle indicator */}
              {subscription && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                </div>
              )}

              {/* Notifications indicator */}
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {notifications.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-3">
            {notifications.slice(0, 3).map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              
              return (
                <Alert key={notification.id} className={getNotificationColor(notification.type)}>
                  <IconComponent className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div>
                        <strong>{notification.title}:</strong> {notification.message}
                        {notification.action && (
                          <div className="mt-1 text-sm opacity-80">
                            {notification.action}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setActiveTab('plans')}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        )}

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('dashboard')}
          >
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Dashboard</h3>
              <p className="text-sm text-gray-600">View usage & analytics</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('plans')}
          >
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Plans</h3>
              <p className="text-sm text-gray-600">Compare & upgrade</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('features')}
          >
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Features</h3>
              <p className="text-sm text-gray-600">Explore capabilities</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('billing')}
          >
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Billing</h3>
              <p className="text-sm text-gray-600">Manage payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <EnhancedSubscriptionDashboard />
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            <EnhancedPlanComparison />
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Feature Explorer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Feature Explorer Coming Soon
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Detailed feature exploration and interactive demos will be available here.
                    For now, you can explore features in the Dashboard and Plans sections.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('dashboard')}
                    >
                      View Dashboard
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('plans')}
                    >
                      Compare Plans
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Plan Billing */}
                  {subscription && (
                    <div className="p-6 border rounded-lg bg-gray-50">
                      <h3 className="font-medium text-gray-900 mb-4">Current Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Plan</p>
                          <p className="font-medium">{subscription.plan?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-medium">
                            ${subscription.plan?.price}/{subscription.plan?.billing_cycle}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Next Billing</p>
                          <p className="font-medium">
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <Badge 
                          className={
                            subscription.auto_renew 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {subscription.auto_renew ? 'Auto-renewal enabled' : 'Auto-renewal disabled'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Manage Billing
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Billing Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">Payment Methods</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Manage your payment methods and billing information
                        </p>
                        <Button variant="outline" className="w-full">
                          Manage Payment Methods
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium">Billing History</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          View and download your billing history and invoices
                        </p>
                        <Button variant="outline" className="w-full">
                          View Billing History
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Upgrade CTA */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          Need more features?
                        </h3>
                        <p className="text-sm text-gray-600">
                          Upgrade your plan to unlock advanced capabilities and higher limits.
                        </p>
                      </div>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setActiveTab('plans')}
                      >
                        View Plans
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscriptionManagementCenter;
