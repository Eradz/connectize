import React, { useEffect, useState } from 'react';
import subscriptionsApi from '../../api-services/subscriptions';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { webRoutes } from '../../lib/webRoutes';

const SubscriptionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [changing, setChanging] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [plansRes, mySubRes] = await Promise.all([
        subscriptionsApi.getPlans().then(r => r.data || r),
        subscriptionsApi.getMySubscription().then(r => r.data || r),
      ]);
      setPlans(plansRes?.results || plansRes || []);
      setCurrent(mySubRes || null);
    } catch (e) {
      console.error('Failed to load subscriptions', e);
      setError('Unable to load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  const onSelectPlan = async (planId) => {
    setChanging(planId);
    setError('');
    try {
      await subscriptionsApi.createSubscription({ plan_id: planId });
      await loadData();
    } catch (e) {
      console.error('Failed to change plan', e);
      setError('Failed to change plan.');
    } finally {
      setChanging(null);
    }
  };

  const daysLeft = () => {
    if (!current?.end_date) return null;
    const end = new Date(current.end_date);
    const diff = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-600">Manage your plan and billing</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Current plan */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Plan</h2>
          {loading ? (
            <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
          ) : current ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xl font-bold text-gray-900">{current.plan?.name}</p>
                <p className="text-gray-600 text-sm">
                  Status: <span className="font-medium capitalize">{current.status || (current.is_active ? 'active' : 'inactive')}</span>
                </p>
                {current.end_date && (
                  <p className="text-gray-600 text-sm">
                    Renews by <span className="font-medium">{new Date(current.end_date).toLocaleDateString()}</span> ({daysLeft()} days left)
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${Number(current.plan?.price || 0).toFixed(2)}<span className="text-sm text-gray-500">/mo</span></p>
                {current.plan?.name?.toLowerCase() === 'trial' ? (
                  <div className="mt-1 inline-flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Trial
                  </div>
                ) : (
                  <div className="mt-1 inline-flex items-center text-green-700 bg-green-100 px-2 py-1 rounded text-xs">
                    <CheckCircle className="w-4 h-4 mr-1" /> Active
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-600">No active subscription.</div>
          )}
        </div>

        {/* Available plans */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
            <Link to={webRoutes.platformDashboard} className="text-sm text-blue-600 hover:text-blue-700">Back to dashboard</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="h-6 w-1/2 bg-gray-100 rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(plan => {
                const isCurrent = current?.plan?.id === plan.id;
                return (
                  <div key={plan.id} className={`p-5 border rounded-lg ${isCurrent ? 'border-blue-300 bg-blue-50' : ''}`}>
                    <p className="text-lg font-semibold text-gray-900">{plan.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">${Number(plan.price || 0).toFixed(2)}<span className="text-sm text-gray-500">/mo</span></p>
                    <p className="text-sm text-gray-600 mt-2 min-h-[40px]">{plan.description || 'Flexible plan'}</p>
                    <button
                      disabled={isCurrent || changing === plan.id}
                      onClick={() => onSelectPlan(plan.id)}
                      className={`mt-4 w-full text-sm font-medium rounded-lg py-2 transition-colors ${isCurrent ? 'bg-gray-200 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {isCurrent ? 'Current Plan' : changing === plan.id ? 'Updating…' : 'Choose Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
