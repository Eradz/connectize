import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '../../context/featureFlagContext';
import Button from '../ui/Button';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  CloudIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  SparklesIcon,
  GlobeAltIcon,
  ArrowPathIcon
} from '../ui/ModernIcon';

const PlatformStatusPage = () => {
  const { flags } = useFeatureFlags();
  const [systemStatus, setSystemStatus] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchStatusData();
    const interval = setInterval(fetchStatusData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatusData = async () => {
    try {
      // Mock comprehensive status data
      setSystemStatus({
        api: {
          name: 'API Gateway',
          status: 'operational',
          uptime: 99.97,
          responseTime: 245,
          lastIncident: null
        },
        database: {
          name: 'Database Cluster',
          status: 'operational',
          uptime: 99.99,
          connections: 45,
          lastIncident: null
        },
        redis: {
          name: 'Cache Layer',
          status: 'operational',
          uptime: 99.95,
          memory: 78,
          lastIncident: null
        },
        storage: {
          name: 'File Storage',
          status: 'operational',
          uptime: 99.98,
          usage: 65,
          lastIncident: null
        },
        websockets: {
          name: 'Real-time Services',
          status: 'operational',
          uptime: 99.89,
          connections: 1250,
          lastIncident: null
        },
        cdn: {
          name: 'Content Delivery',
          status: 'operational',
          uptime: 99.99,
          cacheHit: 96.5,
          lastIncident: null
        },
        ai_services: {
          name: 'AI/ML Services',
          status: 'operational',
          uptime: 99.85,
          processingTime: 2.3,
          lastIncident: null
        },
        mobile_api: {
          name: 'Mobile API',
          status: 'operational',
          uptime: 99.94,
          responseTime: 180,
          lastIncident: null
        }
      });

      setIncidents([
        {
          id: 1,
          title: 'Scheduled Database Maintenance',
          status: 'scheduled',
          severity: 'low',
          startTime: '2024-01-20T02:00:00Z',
          endTime: '2024-01-20T04:00:00Z',
          description: 'Routine database optimization and backup verification',
          affectedServices: ['Database Cluster'],
          updates: [
            {
              time: '2024-01-19T10:00:00Z',
              message: 'Maintenance window scheduled for January 20th, 2-4 AM UTC'
            }
          ]
        },
        {
          id: 2,
          title: 'AI Service Latency Issue - Resolved',
          status: 'resolved',
          severity: 'medium',
          startTime: '2024-01-18T14:30:00Z',
          endTime: '2024-01-18T15:45:00Z',
          description: 'Increased response times for AI matchmaking service',
          affectedServices: ['AI/ML Services'],
          updates: [
            {
              time: '2024-01-18T15:45:00Z',
              message: 'Issue resolved. Service performance has returned to normal levels.'
            },
            {
              time: '2024-01-18T15:15:00Z',
              message: 'Implementing fix for AI service latency issue.'
            },
            {
              time: '2024-01-18T14:30:00Z',
              message: 'Investigating reports of increased AI service response times.'
            }
          ]
        }
      ]);

      setMetrics({
        totalRequests: 2450000,
        successRate: 99.98,
        averageResponseTime: 245,
        errorRate: 0.02,
        activeUsers: 12485,
        dataProcessed: '1.2TB',
        uptime: 99.97,
        incidents: 2
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching status data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      case 'maintenance':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getIncidentSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentStatusColor = (status) => {
    switch (status) {
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'identified':
        return 'bg-orange-100 text-orange-800';
      case 'monitoring':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString();
  };

  const getServiceIcon = (serviceName) => {
    const icons = {
      'API Gateway': <ServerIcon className="h-6 w-6" />,
      'Database Cluster': <CpuChipIcon className="h-6 w-6" />,
      'Cache Layer': <BoltIcon className="h-6 w-6" />,
      'File Storage': <CloudIcon className="h-6 w-6" />,
      'Real-time Services': <GlobeAltIcon className="h-6 w-6" />,
      'Content Delivery': <ChartBarIcon className="h-6 w-6" />,
      'AI/ML Services': <SparklesIcon className="h-6 w-6" />,
      'Mobile API': <ShieldCheckIcon className="h-6 w-6" />
    };
    
    return icons[serviceName] || <ServerIcon className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system status...</p>
        </div>
      </div>
    );
  }

  const overallStatus = Object.values(systemStatus).every(service => service.status === 'operational') 
    ? 'operational' 
    : 'degraded';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          {getStatusIcon(overallStatus)}
          <h1 className="text-4xl font-bold text-gray-900 ml-3">
            Platform Status
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-4">
          Real-time status and performance metrics for all Connectize services
        </p>
        <div className="flex items-center justify-center text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-xl p-6 mb-8 ${
        overallStatus === 'operational' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center justify-center">
          {getStatusIcon(overallStatus)}
          <span className={`text-xl font-semibold ml-3 ${getStatusColor(overallStatus)}`}>
            {overallStatus === 'operational' 
              ? 'All Systems Operational' 
              : 'Some Services Experiencing Issues'
            }
          </span>
        </div>
        {overallStatus !== 'operational' && (
          <p className="text-center text-gray-600 mt-2">
            We are aware of the issues and are working to resolve them.
          </p>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.uptime}%
            </div>
            <p className="text-gray-600">Uptime (30 days)</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {metrics.averageResponseTime}ms
            </div>
            <p className="text-gray-600">Avg Response Time</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {metrics.activeUsers.toLocaleString()}
            </div>
            <p className="text-gray-600">Active Users</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {metrics.successRate}%
            </div>
            <p className="text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Service Status</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(systemStatus).map(([key, service]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-gray-600">
                    {getServiceIcon(service.name)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Uptime: {service.uptime}%</span>
                      {service.responseTime && (
                        <span>Response: {service.responseTime}ms</span>
                      )}
                      {service.connections && (
                        <span>Connections: {service.connections}</span>
                      )}
                      {service.memory && (
                        <span>Memory: {service.memory}%</span>
                      )}
                      {service.usage && (
                        <span>Usage: {service.usage}%</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(service.status)}
                  <span className={`font-medium capitalize ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Flags Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Feature Availability</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(flags).map(([flagKey, enabled]) => (
              <div key={flagKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium capitalize">
                  {flagKey.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  {enabled ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recent Incidents</h2>
            <Button variant="minimal" size="sm">
              View All
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {incidents.length > 0 ? (
            <div className="space-y-6">
              {incidents.map((incident) => (
                <div key={incident.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {incident.title}
                      </h3>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIncidentSeverityColor(incident.severity)}`}>
                          {incident.severity} impact
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{incident.description}</p>
                      <div className="text-sm text-gray-500">
                        <div>Started: {formatTime(incident.startTime)}</div>
                        {incident.endTime && (
                          <div>Resolved: {formatTime(incident.endTime)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Updates</h4>
                    <div className="space-y-3">
                      {incident.updates.map((update, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <div className="text-sm text-gray-500">
                              {formatTime(update.time)}
                            </div>
                            <p className="text-gray-700">{update.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Incidents</h3>
              <p className="text-gray-600">All systems have been running smoothly.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-gray-500">
        <p>
          For real-time updates, follow our status page or contact support at{' '}
          <a href="mailto:support@connectize.com" className="text-blue-600 hover:text-blue-800">
            support@connectize.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PlatformStatusPage;
