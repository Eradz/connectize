import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Settings,
  Filter,
  MarkAsRead,
  Archive,
  Star
} from 'lucide-react';

const SmartNotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  // Mock real-time notifications
  useEffect(() => {
    // Initial notifications
    const initialNotifications = [
      {
        id: '1',
        type: 'deal_update',
        priority: 'high',
        title: 'Deal Room Update: West Africa Pipeline Project',
        message: 'New document uploaded by Chevron Corporation',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        actionUrl: '/deals/wa-pipeline-project',
        metadata: {
          dealValue: '$450M',
          participant: 'Chevron Corporation'
        }
      },
      {
        id: '2',
        type: 'market_alert',
        priority: 'urgent',
        title: 'Price Alert: Brent Crude Oil',
        message: 'Price increased by 3.2% in the last hour',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: false,
        actionUrl: '/market/brent-crude',
        metadata: {
          currentPrice: '$78.45',
          change: '+3.2%'
        }
      },
      {
        id: '3',
        type: 'connection_request',
        priority: 'medium',
        title: 'New Connection Request',
        message: 'Dr. Amina Hassan (Shell Nigeria) wants to connect',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        actionUrl: '/connections/requests',
        metadata: {
          requesterName: 'Dr. Amina Hassan',
          requesterCompany: 'Shell Nigeria',
          requesterTitle: 'Senior Geologist'
        }
      },
      {
        id: '4',
        type: 'job_match',
        priority: 'medium',
        title: 'Perfect Job Match Found',
        message: 'Senior Petroleum Engineer at TotalEnergies matches your profile',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        isRead: true,
        actionUrl: '/jobs/senior-petroleum-engineer-total',
        metadata: {
          company: 'TotalEnergies',
          location: 'Lagos, Nigeria',
          matchScore: '94%'
        }
      },
      {
        id: '5',
        type: 'challenge_reminder',
        priority: 'low',
        title: 'Daily Challenge Reminder',
        message: 'Complete your profile verification to earn 500 XP',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true,
        actionUrl: '/profile/verification',
        metadata: {
          reward: '500 XP',
          timeLeft: '6 hours'
        }
      },
      {
        id: '6',
        type: 'system_update',
        priority: 'low',
        title: 'New Feature: AI Market Insights',
        message: 'Discover market opportunities with our new AI-powered insights',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: false,
        actionUrl: '/ai/market-insights',
        metadata: {
          feature: 'AI Market Insights',
          benefits: 'Predictive analytics and opportunity identification'
        }
      }
    ];

    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.isRead).length);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        addNewNotification();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addNewNotification = () => {
    const notificationTypes = [
      {
        type: 'deal_update',
        priority: 'high',
        title: 'Deal Room Activity',
        messages: [
          'New bid submitted for offshore drilling project',
          'Due diligence phase completed',
          'Milestone achieved in joint venture deal'
        ]
      },
      {
        type: 'market_alert',
        priority: 'urgent',
        title: 'Market Movement',
        messages: [
          'Natural gas prices surge 5.1%',
          'Oil futures hit weekly high',
          'Currency fluctuation affects commodity prices'
        ]
      },
      {
        type: 'connection_request',
        priority: 'medium',
        title: 'New Connection',
        messages: [
          'Industry expert wants to connect',
          'Potential business partner reached out',
          'Fellow professional sent connection request'
        ]
      }
    ];

    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

    const newNotification = {
      id: Date.now().toString(),
      type: randomType.type,
      priority: randomType.priority,
      title: randomType.title,
      message: randomMessage,
      timestamp: new Date(),
      isRead: false,
      actionUrl: '#',
      metadata: {}
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(randomType.title, {
        body: randomMessage,
        icon: '/favicon.png'
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'deal_update':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'market_alert':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'connection_request':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'job_match':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'challenge_reminder':
        return <CheckCircle className="w-5 h-5 text-orange-500" />;
      case 'system_update':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div 
          ref={notificationRef}
          className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 mt-3">
              {['all', 'unread', 'deal_update', 'market_alert', 'connection_request'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {filterType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    getPriorityColor(notification.priority)
                  } ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                    // Navigate to action URL
                    if (notification.actionUrl !== '#') {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {/* Metadata */}
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(notification.metadata).slice(0, 2).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white bg-opacity-50 text-gray-600"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        
                        {notification.priority === 'urgent' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close panel when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SmartNotificationCenter;
