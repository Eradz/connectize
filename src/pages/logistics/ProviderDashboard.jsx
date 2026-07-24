import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck, Package, DollarSign, Star, TrendingUp, Clock,
  CheckCircle, AlertCircle, Eye, Send, BarChart3,
  Calendar, MapPin, ArrowRight, Filter, Search,
  FileText, Settings, Bell, ChevronRight, Trophy, X
} from 'lucide-react';
import { logisticsAPI } from '../../api-services/logistics';
import { getSession } from '../../lib/session';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [stats, setStats] = useState({
    activeShipments: 0,
    pendingQuotes: 0,
    completedShipments: 0,
    totalEarnings: 0,
    wonBids: 0,
  });
  const [openRequests, setOpenRequests] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);
  const [activeShipments, setActiveShipments] = useState([]);
  const [wonBids, setWonBids] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
    
    // Close notifications when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await logisticsAPI.getLogisticsNotifications();
      setNotifications(response?.results || []);
      setUnreadCount(response?.unread_count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await logisticsAPI.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await logisticsAPI.markLogisticsNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const session = getSession();
      
      // Session has { id, email, tokens } structure
      if (!session?.id || !session?.tokens?.access) {
        navigate('/login?redirect=/logistics/provider-dashboard');
        return;
      }

      // Load provider profile using dedicated endpoint
      let myProvider = null;
      try {
        myProvider = await logisticsAPI.getMyProviderProfile();
      } catch (profileError) {
        console.log('No provider profile found:', profileError);
        // Fallback: try to find in all providers
        try {
          const providersResponse = await logisticsAPI.getLogisticsProviders();
          const providers = providersResponse?.results || providersResponse || [];
          myProvider = providers.find(p => p.user === session.id);
        } catch (err) {
          console.error('Failed to load providers:', err);
        }
      }

      if (!myProvider) {
        navigate('/logistics/become-provider');
        return;
      }

      setProvider(myProvider);

      // Load open shipment requests (that we can quote on)
      const requestsResponse = await logisticsAPI.getShipmentRequests({ 
        status: 'posted',
        page_size: 10 
      });
      setOpenRequests(requestsResponse?.results || requestsResponse || []);

      // Load my quotes
      const quotesResponse = await logisticsAPI.getShipmentQuotes({ 
        provider: myProvider.id,
        page_size: 20 
      });
      const allQuotes = quotesResponse?.results || quotesResponse || [];
      setMyQuotes(allQuotes);

      // Filter won bids (accepted quotes)
      const wonQuotes = allQuotes.filter(q => q.accepted);
      setWonBids(wonQuotes);

      // Load active shipments assigned to me
      const shipmentsResponse = await logisticsAPI.getShipments({ 
        provider: myProvider.id,
        page_size: 20 
      });
      const shipments = shipmentsResponse?.results || shipmentsResponse || [];
      setActiveShipments(shipments);

      // Calculate stats
      const activeCount = shipments.filter(s => 
        ['preparing', 'picked_up', 'in_transit'].includes(s.status)
      ).length;
      const completedCount = shipments.filter(s => s.status === 'delivered').length;
      const pendingQuotes = allQuotes.filter(q => q.is_active && !q.accepted).length;

      setStats({
        activeShipments: activeCount,
        pendingQuotes: pendingQuotes,
        completedShipments: completedCount,
        totalEarnings: shipments.reduce((sum, s) => {
          if (s.status === 'delivered' && s.quote?.total_cost) {
            return sum + parseFloat(s.quote.total_cost);
          }
          return sum;
        }, 0),
        wonBids: wonQuotes.length,
      });

    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (requestId) => {
    navigate(`/logistics/requests/${requestId}?action=quote`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Not a Provider Yet</h2>
          <p className="text-gray-600 mb-4">Register as a logistics provider to access this dashboard</p>
          <button
            onClick={() => navigate('/logistics/become-provider')}
            className="px-6 py-3 bg-gold text-dark rounded-lg hover:bg-custom_yellow"
          >
            Become a Provider
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gold/90 to-custom_yellow rounded-xl flex items-center justify-center">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{provider.company_name}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {Number(provider.safety_rating || 0).toFixed(1)} Rating
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    {Number(provider.on_time_delivery_rate || 0).toFixed(0)}% On-Time
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    provider.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {provider.is_active ? 'Active' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Logistics Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllNotificationsRead}
                            className="text-xs text-gold hover:text-custom_yellow"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                          <p>No notifications yet</p>
                          <p className="text-sm mt-1">You'll be notified when quotes are accepted</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              if (!notification.is_read) {
                                handleMarkNotificationRead(notification.id);
                              }
                              if (notification.link) {
                                navigate(notification.link);
                                setShowNotifications(false);
                              }
                            }}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.is_read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                notification.notification_type === 'quote_accepted' 
                                  ? 'bg-green-100 text-green-600' 
                                  : notification.notification_type === 'shipment_status'
                                  ? 'bg-blue-100 text-gold'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {notification.notification_type === 'quote_accepted' ? (
                                  <Trophy className="w-5 h-5" />
                                ) : notification.notification_type === 'shipment_status' ? (
                                  <Truck className="w-5 h-5" />
                                ) : (
                                  <Bell className="w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                                  {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-gold/90 rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                to="/logistics/provider-settings"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="API Integration Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <Link
                to="/logistics/requests"
                className="flex items-center gap-2 px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow"
              >
                <Search className="w-4 h-4" />
                Find Shipments
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-gold" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.activeShipments}</span>
            </div>
            <h3 className="font-medium text-gray-600">Active Shipments</h3>
            <p className="text-sm text-gray-400 mt-1">Currently in progress</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.pendingQuotes}</span>
            </div>
            <h3 className="font-medium text-gray-600">Pending Quotes</h3>
            <p className="text-sm text-gray-400 mt-1">Awaiting response</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.completedShipments}</span>
            </div>
            <h3 className="font-medium text-gray-600">Completed</h3>
            <p className="text-sm text-gray-400 mt-1">Successfully delivered</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</span>
            </div>
            <h3 className="font-medium text-gray-600">Total Earnings</h3>
            <p className="text-sm text-gray-400 mt-1">From completed jobs</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'won', label: 'Won Bids', icon: Trophy, badge: stats.wonBids },
            { id: 'requests', label: 'Open Requests', icon: Package },
            { id: 'quotes', label: 'My Quotes', icon: FileText },
            { id: 'shipments', label: 'Active Shipments', icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">New Shipment Requests</h2>
                  <Link 
                    to="/logistics/requests" 
                    className="text-sm text-gold hover:text-custom_yellow flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {openRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{request.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {request.origin_address} → {request.destination_address}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">
                            {request.weight} kg • {request.cargo_type?.replace('_', ' ')}
                          </span>
                          {request.budget_max && (
                            <span className="text-xs font-medium text-green-600">
                              Budget: {formatCurrency(request.budget_max)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSubmitQuote(request.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-gold rounded-lg hover:bg-blue-100"
                      >
                        <Send className="w-3 h-3" />
                        Quote
                      </button>
                    </div>
                  </div>
                ))}
                {openRequests.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No open requests available
                  </div>
                )}
              </div>
            </div>

            {/* Active Shipments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Active Shipments</h2>
                  <button 
                    onClick={() => setActiveTab('shipments')}
                    className="text-sm text-gold hover:text-custom_yellow flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {activeShipments
                  .filter(s => ['preparing', 'picked_up', 'in_transit'].includes(s.status))
                  .slice(0, 5)
                  .map((shipment) => (
                    <div key={shipment.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {shipment.tracking_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                              {shipment.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {shipment.request?.origin_address} → {shipment.request?.destination_address}
                          </p>
                        </div>
                        <Link
                          to={`/logistics/shipments/${shipment.id}`}
                          className="p-2 text-gray-400 hover:text-gold hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                {activeShipments.filter(s => ['preparing', 'picked_up', 'in_transit'].includes(s.status)).length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No active shipments
                  </div>
                )}
              </div>
            </div>

            {/* Performance Score Card - Only show if there's delivery data */}
            {stats.completedShipments > 0 && (
              <div className="bg-gradient-to-br from-gold to-custom_yellow rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8" />
                  <h2 className="text-lg font-semibold">Performance Score</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold">
                      {Number(provider.on_time_delivery_rate || 0).toFixed(0)}%
                    </div>
                    <p className=" text-sm">On-Time Delivery</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold flex items-center gap-1">
                      {Number(provider.safety_rating || 0).toFixed(1)}
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className=" text-sm">Reliability Rating</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gold/90">
                  <p className="text-sm ">
                    Based on {stats.completedShipments} completed {stats.completedShipments === 1 ? 'delivery' : 'deliveries'}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/logistics/requests"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Search className="w-5 h-5 text-gold" />
                  <span className="font-medium text-gray-900">Browse Shipments</span>
                </Link>
                <Link
                  to="/logistics/shipments"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Truck className="w-5 h-5 text-gold" />
                  <span className="font-medium text-gray-900">My Shipments</span>
                </Link>
                <Link
                  to="/logistics/provider-settings"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gold" />
                  <span className="font-medium text-gray-900">Settings</span>
                </Link>
                <button
                  onClick={() => setActiveTab('shipments')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <BarChart3 className="w-5 h-5 text-gold" />
                  <span className="font-medium text-gray-900">View All Shipments</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Won Bids Tab */}
        {activeTab === 'won' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Won Bids</h2>
                    <p className="text-sm text-gray-500">Quotes that have been accepted</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {wonBids.length} Won
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {wonBids.map((quote) => (
                <div key={quote.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          WON
                        </span>
                        <h3 className="font-semibold text-gray-900">{quote.request_title}</h3>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase">Your Quote</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(quote.total_cost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase">Delivery Est.</p>
                          <p className="text-sm font-medium text-gray-900">
                            {quote.estimated_days} days
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase">Accepted On</p>
                          <p className="text-sm text-gray-600">
                            {new Date(quote.updated_at || quote.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {quote.notes && (
                        <p className="mt-2 text-sm text-gray-500 italic">"{quote.notes}"</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Link
                        to={`/logistics/requests/${quote.request}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gold text-dark rounded-lg hover:bg-custom_yellow"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      <Link
                        to={`/logistics/shipments?request=${quote.request}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <Truck className="w-4 h-4" />
                        Manage Shipment
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {wonBids.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">No Won Bids Yet</h3>
                  <p className="text-gray-500 mb-4">Submit competitive quotes to win shipment contracts</p>
                  <Link
                    to="/logistics/requests"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow"
                  >
                    <Search className="w-4 h-4" />
                    Browse Requests
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Open Shipment Requests</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold/90"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {openRequests
                .filter(r => 
                  r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  r.origin_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  r.destination_address?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((request) => (
                  <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{request.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            request.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                            request.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {request.urgency || 'Normal'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{request.origin_address}</span>
                          <ArrowRight className="w-4 h-4" />
                          <span>{request.destination_address}</span>
                        </div>
                        <div className="flex items-center gap-6 mt-3">
                          <span className="text-sm text-gray-500">
                            <strong>{request.weight}</strong> kg
                          </span>
                          <span className="text-sm text-gray-500">
                            {request.cargo_type?.replace('_', ' ')}
                          </span>
                          {request.pickup_date_requested && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              Pickup: {new Date(request.pickup_date_requested).toLocaleDateString()}
                            </span>
                          )}
                          {request.budget_max && (
                            <span className="text-sm font-medium text-green-600">
                              Budget: {formatCurrency(request.budget_min)} - {formatCurrency(request.budget_max)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/logistics/requests/${request.id}`}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        <button
                          onClick={() => handleSubmitQuote(request.id)}
                          className="flex items-center gap-1 px-4 py-2 text-sm bg-gold text-dark rounded-lg hover:bg-custom_yellow"
                        >
                          <Send className="w-4 h-4" />
                          Submit Quote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {openRequests.length === 0 && (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-1">No Open Requests</h3>
                  <p className="text-gray-500">Check back later for new shipment opportunities</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">My Quotes</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {myQuotes.map((quote) => (
                <div key={quote.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{quote.request_title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Quote: {formatCurrency(quote.total_cost)}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          quote.accepted ? 'bg-green-100 text-green-700' :
                          quote.is_active ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {quote.accepted ? 'Accepted' : quote.is_active ? 'Pending' : 'Expired'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Submitted {new Date(quote.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/logistics/requests/${quote.request}`}
                      className="p-2 text-gray-400 hover:text-gold hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {myQuotes.length === 0 && (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-1">No Quotes Yet</h3>
                  <p className="text-gray-500 mb-4">Start quoting on shipment requests to win jobs</p>
                  <Link
                    to="/logistics/requests"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow"
                  >
                    <Search className="w-4 h-4" />
                    Browse Requests
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">My Shipments</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {activeShipments.map((shipment) => (
                <div key={shipment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{shipment.tracking_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {shipment.request?.origin_address} → {shipment.request?.destination_address}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Created {new Date(shipment.created_at).toLocaleDateString()}</span>
                        {shipment.quote?.total_cost && (
                          <span className="font-medium text-green-600">
                            {formatCurrency(shipment.quote.total_cost)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/logistics/shipments/${shipment.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-gold rounded-lg hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4" />
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
              {activeShipments.length === 0 && (
                <div className="p-12 text-center">
                  <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-1">No Shipments Yet</h3>
                  <p className="text-gray-500">Win quotes to start managing shipments</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
