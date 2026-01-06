import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  Download,
  FileText,
  Calendar,
  Filter,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { InventoryReportService } from '../../api-services/oilgas';

const InventoryReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await InventoryReportService.getAll();
      setReports(response.results || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '' || report.report_type === filterType;
    return matchesSearch && matchesType;
  });

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'stock_levels':
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'movement_analysis':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'valuation':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'low_stock':
        return <FileText className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'stock_levels':
        return 'bg-blue-100 text-blue-800';
      case 'movement_analysis':
        return 'bg-green-100 text-green-800';
      case 'valuation':
        return 'bg-purple-100 text-purple-800';
      case 'low_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'stock_levels':
        return 'Stock Levels';
      case 'movement_analysis':
        return 'Movement Analysis';
      case 'valuation':
        return 'Inventory Valuation';
      case 'low_stock':
        return 'Low Stock Report';
      default:
        return 'General Report';
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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
              <p className="mt-2 text-gray-600">Generate and view inventory analytics and reports</p>
            </div>
            <Link
              to="/inventory/reports/create"
              className="bg-blue-600 hover:bg-custom_yellow text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Generate Report</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Report Types</option>
              <option value="stock_levels">Stock Levels</option>
              <option value="movement_analysis">Movement Analysis</option>
              <option value="valuation">Inventory Valuation</option>
              <option value="low_stock">Low Stock Report</option>
            </select>

            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Filter className="h-5 w-5" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Quick Report Generation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
              <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Current Stock Levels</div>
              <div className="text-xs text-gray-500">View all item quantities</div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left">
              <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Movement Analysis</div>
              <div className="text-xs text-gray-500">Track inventory changes</div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left">
              <FileText className="h-6 w-6 text-red-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Low Stock Alert</div>
              <div className="text-xs text-gray-500">Items below threshold</div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
              <FileText className="h-6 w-6 text-purple-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Valuation Report</div>
              <div className="text-xs text-gray-500">Total inventory value</div>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => {
                    const reportDate = new Date(r.created_at);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() && 
                           reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.report_type === 'stock_levels').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Movement Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.report_type === 'movement_analysis').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Generated Reports</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getReportTypeIcon(report.report_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {report.title || 'Untitled Report'}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(report.report_type)}`}>
                          {getReportTypeLabel(report.report_type)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">
                        {report.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Generated: {new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {report.period_start && report.period_end && (
                          <div className="flex items-center">
                            <span>Period: {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/inventory/reports/${report.id}`}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Report"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    
                    <button 
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Download Report"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Generate your first report to get insights into your inventory.
              </p>
              <div className="mt-6">
                <Link
                  to="/inventory/reports/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-custom_yellow"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
