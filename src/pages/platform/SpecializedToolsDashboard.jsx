import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  TrendingUp,
  BarChart3,
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  HardHat,
  Gauge,
  Activity,
  Zap,
  Thermometer,
  Wind,
  MapPin,
  Calendar,
  Globe,
  Database,
  Monitor
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
// import { specializedToolsService } from '../../api-services/oilgas'; // Will be implemented when backend endpoint is ready

const SpecializedToolsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    equipment: { total: 0, data: [] },
    hseReports: { total: 0, data: [] },
    compliance: { total: 0, data: [] },
    analytics: {
      totalEquipment: 0,
      activeTools: 0,
      complianceScore: 0,
      safetyIncidents: 0
    }
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data since endpoints may not exist yet
      const mockEquipment = generateMockEquipment();
      const mockHSEReports = generateMockHSEReports();
      const mockCompliance = generateMockCompliance();
      const mockAnalytics = generateMockAnalytics();

      setDashboardData({
        equipment: {
          total: mockEquipment.length,
          data: mockEquipment
        },
        hseReports: {
          total: mockHSEReports.length,
          data: mockHSEReports
        },
        compliance: {
          total: mockCompliance.length,
          data: mockCompliance
        },
        analytics: mockAnalytics
      });
    } catch (error) {
      console.error('Failed to load specialized tools data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockEquipment = () => {
    const types = ['Drilling Equipment', 'Safety Systems', 'Monitoring Tools', 'Testing Equipment'];
    const statuses = ['active', 'maintenance', 'standby', 'offline'];
    const locations = ['Platform A', 'Rig B-12', 'Processing Unit C', 'Storage Tank D'];
    
    return Array.from({ length: 18 }, (_, index) => ({
      id: `equip_${index + 1}`,
      name: `${types[index % types.length]} ${String(index + 1).padStart(3, '0')}`,
      type: types[index % types.length],
      status: statuses[index % statuses.length],
      location: locations[index % locations.length],
      model: `Model-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      serial_number: `SN${String(index + 1).padStart(6, '0')}`,
      last_maintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      next_maintenance: new Date(Date.now() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString(),
      efficiency: Math.floor(Math.random() * 30) + 70,
      temperature: (Math.random() * 40 + 40).toFixed(1),
      pressure: (Math.random() * 100 + 50).toFixed(1)
    }));
  };

  const generateMockHSEReports = () => {
    const types = ['Safety Inspection', 'Environmental Audit', 'Health Assessment', 'Emergency Drill'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['open', 'in_progress', 'resolved', 'closed'];
    
    return Array.from({ length: 12 }, (_, index) => ({
      id: `hse_${index + 1}`,
      title: `${types[index % types.length]} - ${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
      type: types[index % types.length],
      severity: severities[index % severities.length],
      status: statuses[index % statuses.length],
      location: ['Platform A', 'Rig B-12', 'Processing Unit C', 'Storage Tank D'][index % 4],
      reported_by: `Inspector ${String(index + 1).padStart(2, '0')}`,
      reported_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + (7 + Math.random() * 21) * 24 * 60 * 60 * 1000).toISOString(),
      findings: Math.floor(Math.random() * 10) + 1,
      actions: Math.floor(Math.random() * 5) + 1
    }));
  };

  const generateMockCompliance = () => {
    const frameworks = ['ISO 45001', 'ISO 14001', 'API 510', 'OSHA Standards'];
    const statuses = ['compliant', 'non_compliant', 'under_review', 'expired'];
    
    return Array.from({ length: 8 }, (_, index) => ({
      id: `comp_${index + 1}`,
      framework: frameworks[index % frameworks.length],
      status: statuses[index % statuses.length],
      last_audit: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      next_audit: new Date(Date.now() + (30 + Math.random() * 150) * 24 * 60 * 60 * 1000).toISOString(),
      compliance_score: Math.floor(Math.random() * 30) + 70,
      findings: Math.floor(Math.random() * 8),
      corrective_actions: Math.floor(Math.random() * 5)
    }));
  };

  const generateMockAnalytics = () => ({
    totalEquipment: 156,
    activeTools: 134,
    complianceScore: 94.2,
    safetyIncidents: 3,
    monthlyGrowth: 8.5,
    equipmentEfficiency: 87.3
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'compliant':
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
      case 'under_review':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'standby':
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'offline':
      case 'non_compliant':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'compliant':
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      case 'maintenance':
      case 'under_review':
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'standby':
      case 'open':
        return <Activity className="w-4 h-4" />;
      case 'offline':
      case 'non_compliant':
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentTypeIcon = (type) => {
    switch (type) {
      case 'Drilling Equipment': return <Wrench className="w-5 h-5" />;
      case 'Safety Systems': return <HardHat className="w-5 h-5" />;
      case 'Monitoring Tools': return <Monitor className="w-5 h-5" />;
      case 'Testing Equipment': return <Gauge className="w-5 h-5" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-yellow-600';
    if (efficiency >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Specialized Tools & Equipment</h1>
              <p className="text-gray-600 mt-1">Equipment management, HSE compliance & regulatory tools</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={webRoutes.specializedToolsEquipmentCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Link>
              <button
                onClick={loadDashboardData}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.totalEquipment}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{dashboardData.analytics.monthlyGrowth}% this month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tools</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.activeTools}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Activity className="w-4 h-4 mr-1" />
                  {dashboardData.analytics.equipmentEfficiency}% efficiency
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.complianceScore}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Excellent rating
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Safety Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.safetyIncidents}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <HardHat className="w-4 h-4 mr-1" />
                  This month
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'equipment', label: 'Equipment', icon: Wrench },
                { key: 'hse', label: 'HSE Reports', icon: HardHat },
                { key: 'compliance', label: 'Compliance', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Equipment Status Overview */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Equipment Status</h3>
                      <Link 
                        to={webRoutes.specializedToolsEquipment}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.equipment.data.slice(0, 5).map((equipment) => (
                        <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white p-2 rounded-lg border">
                              {getEquipmentTypeIcon(equipment.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{equipment.name}</p>
                              <p className="text-sm text-gray-600">{equipment.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(equipment.status)}`}>
                              {equipment.status}
                            </span>
                            <p className={`text-xs mt-1 ${getEfficiencyColor(equipment.efficiency)}`}>
                              {equipment.efficiency}% efficiency
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent HSE Reports */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent HSE Reports</h3>
                      <Link 
                        to={webRoutes.specializedToolsHSE}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.hseReports.data.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white p-2 rounded-lg border">
                              <HardHat className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{report.title}</p>
                              <p className="text-sm text-gray-600">{report.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(report.severity)}`}>
                              {report.severity}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {getTimeAgo(report.reported_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compliance Overview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-sm text-gray-600">ISO Compliant</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">92%</div>
                      <div className="text-sm text-gray-600">Safety Standards</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">78%</div>
                      <div className="text-sm text-gray-600">Environmental</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">96%</div>
                      <div className="text-sm text-gray-600">API Standards</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to={webRoutes.specializedToolsEquipmentCreate}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="text-center">
                      <Plus className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Add Equipment</h3>
                      <p className="mt-1 text-sm text-gray-500">Register new equipment</p>
                    </div>
                  </Link>

                  <Link
                    to={webRoutes.specializedToolsHSECreate}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors group"
                  >
                    <div className="text-center">
                      <HardHat className="mx-auto h-8 w-8 text-gray-400 group-hover:text-orange-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">HSE Report</h3>
                      <p className="mt-1 text-sm text-gray-500">Create safety report</p>
                    </div>
                  </Link>

                  <Link
                    to={webRoutes.specializedToolsCompliance}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
                  >
                    <div className="text-center">
                      <Shield className="mx-auto h-8 w-8 text-gray-400 group-hover:text-green-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Compliance Check</h3>
                      <p className="mt-1 text-sm text-gray-500">Run compliance audit</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'equipment' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Equipment Management</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search equipment..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.equipment.data.map((equipment) => (
                    <div key={equipment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(equipment.status)}`}>
                          {equipment.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <span className="text-gray-900">{equipment.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="text-gray-900">{equipment.location}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Efficiency:</span>
                          <span className={`font-medium ${getEfficiencyColor(equipment.efficiency)}`}>
                            {equipment.efficiency}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Temperature:</span>
                          <span className="text-gray-900">{equipment.temperature}°C</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pressure:</span>
                          <span className="text-gray-900">{equipment.pressure} bar</span>
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <Link
                          to={webRoutes.specializedToolsEquipmentDetail.replace(':id', equipment.id)}
                          className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'hse' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">HSE Reports</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search reports..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Report</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Severity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Reported</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.hseReports.data.map((report) => (
                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <Link 
                              to={webRoutes.specializedToolsHSEDetail.replace(':id', report.id)}
                              className="font-medium text-blue-600 hover:text-blue-700"
                            >
                              {report.title}
                            </Link>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {report.type}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(report.severity)}`}>
                              {report.severity}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(report.status)}`}>
                              {getStatusIcon(report.status)}
                              <span className="ml-1">{report.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {report.location}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {getTimeAgo(report.reported_at)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {new Date(report.due_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <Link
                              to={webRoutes.specializedToolsHSEDetail.replace(':id', report.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Management</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search compliance..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.compliance.data.map((compliance) => (
                    <div key={compliance.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{compliance.framework}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(compliance.status)}`}>
                          {compliance.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Compliance Score:</span>
                          <span className={`font-medium ${getEfficiencyColor(compliance.compliance_score)}`}>
                            {compliance.compliance_score}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Audit:</span>
                          <span className="text-gray-900">{getTimeAgo(compliance.last_audit)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Next Audit:</span>
                          <span className="text-gray-900">{new Date(compliance.next_audit).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Findings:</span>
                          <span className="text-gray-900">{compliance.findings}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Actions:</span>
                          <span className="text-gray-900">{compliance.corrective_actions}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <Link
                          to={webRoutes.specializedToolsComplianceDetail.replace(':id', compliance.id)}
                          className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecializedToolsDashboard;
