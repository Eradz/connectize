import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Bell,
  Package,
  Warehouse,
  Calendar,
  User
} from 'lucide-react';
import { InventoryAlertService } from '../../api-services/oilgas';

const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await InventoryAlertService.getAll();
      setAlerts(response.results || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await InventoryAlertService.acknowledge(alertId);
      // Reload alerts to update the status
      loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !alert.acknowledged;
    if (filter === 'acknowledged') return alert.acknowledged;
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  const getAlertIcon = (severity, acknowledged) => {
    if (acknowledged) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (severity, acknowledged) => {
    if (acknowledged) {
      return 'bg-green-50 border-green-200';
    }
    
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Alerts</h1>
              <p className="mt-2 text-gray-600">Monitor and manage inventory alerts and notifications</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All Alerts', count: alerts.length },
              { key: 'pending', label: 'Pending', count: alerts.filter(a => !a.acknowledged).length },
              { key: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
              { key: 'acknowledged', label: 'Acknowledged', count: alerts.filter(a => a.acknowledged).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Warning Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => !a.acknowledged).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.acknowledged).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-6 ${getAlertColor(alert.severity, alert.acknowledged)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.severity, alert.acknowledged)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {alert.alert_type?.replace('_', ' ').toUpperCase()} Alert
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {alert.acknowledged && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{alert.message}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        <span>Item: {alert.item_name || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Warehouse className="h-4 w-4 mr-2" />
                        <span>Warehouse: {alert.warehouse_name || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Created: {new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {alert.acknowledged && alert.acknowledged_by && (
                      <div className="mt-3 text-sm text-green-600 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>
                          Acknowledged by {alert.acknowledged_by} on{' '}
                          {new Date(alert.acknowledged_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 p-1">
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'All alerts will appear here when they are triggered.'
                : `No ${filter} alerts at the moment.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAlerts;
