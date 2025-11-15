import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText,
  Calendar,
  MapPin,
  Building,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  Download,
  MessageCircle,
  ExternalLink,
  Trash2,
  Edit,
  RefreshCw,
  Plus,
  User,
  Users,
  Star,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI as workforceService } from '../../api-services/workforce';

const WorkforceApplications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  // Derived list; avoid setState on each keypress to prevent focus loss
  // We'll compute filtered applications via useMemo
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    jobType: '',
    dateRange: '',
    salary: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  useEffect(() => {
    loadApplications();
  }, []);

  // Derive filtered applications without triggering extra renders
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(app => {
        switch (activeTab) {
          case 'active':
            return ['submitted', 'under_review', 'shortlisted', 'interview_scheduled'].includes(app.status);
          case 'completed':
            return ['offer_made', 'hired', 'rejected', 'withdrawn'].includes(app.status);
          case 'interviews':
            return app.status === 'interview_scheduled';
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        (app.job_title || '').toLowerCase().includes(term) ||
        (app.job_posting?.company_name || app.job_company || '').toLowerCase().includes(term) ||
        (app.location || app.job_location || '').toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Job type filter
    if (filters.jobType) {
      filtered = filtered.filter(app => app.job_type === filters.jobType);
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      filtered = filtered.filter(app => {
        const appDate = new Date(app.applied_date || app.submitted_at || app.created_at);
        switch (filters.dateRange) {
          case 'week':
            return (now - appDate) <= 7 * 24 * 60 * 60 * 1000;
          case 'month':
            return (now - appDate) <= 30 * 24 * 60 * 60 * 1000;
          case 'quarter':
            return (now - appDate) <= 90 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });
    }

    // Salary filter
    if (filters.salary) {
      filtered = filtered.filter(app => {
        const minSalary = app.salary_min;
        switch (filters.salary) {
          case '50k-100k':
            return minSalary >= 50000 && minSalary <= 100000;
          case '100k-150k':
            return minSalary >= 100000 && minSalary <= 150000;
          case '150k+':
            return minSalary >= 150000;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [applications, activeTab, searchTerm, filters]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await workforceService.getApplications();
      const data = response.data?.results || response.data || response || [];
      setApplications(data);
  // No separate filtered state; derived via useMemo
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
  // No separate filtered state; derived via useMemo
    } finally {
      setLoading(false);
    }
  };

  // Removed filterApplications state updater; using useMemo instead

  const clearFilters = () => {
    setFilters({
      status: '',
      jobType: '',
      dateRange: '',
      salary: ''
    });
    setSearchTerm('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-cyan-100 text-cyan-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'offer_made': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-green-200 text-green-900';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'shortlisted': return <Star className="w-4 h-4" />;
      case 'interview_scheduled': return <Calendar className="w-4 h-4" />;
      case 'offer_made': return <CheckCircle className="w-4 h-4" />;
      case 'hired': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'withdrawn': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'all':
        return applications.length;
      case 'active':
        return applications.filter(app => ['submitted', 'under_review', 'shortlisted', 'interview_scheduled'].includes(app.status)).length;
      case 'completed':
        return applications.filter(app => ['offer_made', 'hired', 'rejected', 'withdrawn'].includes(app.status)).length;
      case 'interviews':
        return applications.filter(app => app.status === 'interview_scheduled').length;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">Track and manage your job applications</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadApplications}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <Link
                to={webRoutes.workforceJobs}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Find Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'all', label: 'All Applications' },
                { key: 'active', label: 'Active' },
                { key: 'interviews', label: 'Interviews' },
                { key: 'completed', label: 'Completed' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getTabCount(tab.key)}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search applications by job title, company, or location..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="offered">Offered</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.jobType}
                      onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applied</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    >
                      <option value="">Any Time</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="quarter">Last 3 Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.salary}
                      onChange={(e) => handleFilterChange('salary', e.target.value)}
                    >
                      <option value="">Any Range</option>
                      <option value="50k-100k">$50k - $100k</option>
                      <option value="100k-150k">$100k - $150k</option>
                      <option value="150k+">$150k+</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={clearFilters}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                  <span className="text-sm text-gray-500 py-2">
                    {filteredApplications.length} applications found
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {application.job_title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {application.job_posting?.company_name || application.job_company || 'Unknown Company'}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {application.job_location || 'Remote'}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Applied {formatDate(application.submitted_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)} flex items-center`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {application.salary_min && application.salary_max ? 
                          `$${Number(application.salary_min).toLocaleString()} - $${Number(application.salary_max).toLocaleString()}` :
                          'Salary not specified'
                        }
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-1" />
                        {application.job_type || 'Full-time'} • {application.job_level || 'Not specified'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                        {application.ai_match_score || 0}% match
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {application.application_deadline ? 
                          `Apply by ${formatDate(application.application_deadline)}` :
                          'No deadline specified'
                        }
                      </div>
                    </div>

                    {/* Interview Date */}
                    {application.interview_date && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center text-purple-800">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="font-medium">Interview Scheduled: </span>
                          <span className="ml-1">{formatDate(application.interview_date)}</span>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {application.notes && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">{application.notes}</p>
                      </div>
                    )}

                    {/* Feedback */}
                    {application.feedback && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">{application.feedback}</p>
                      </div>
                    )}

                    {/* Requirements Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Requirements Met</span>
                        <span>{application.requirements_met || 0}/{application.total_requirements || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${((application.requirements_met || 0) / (application.total_requirements || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Person</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {application.reviewed_by_name || 'No reviewer assigned'}
                        </span>
                        {application.reviewed_by_name && (
                          <span>Status: {application.status.replace('_', ' ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Link
                      to={`${webRoutes.workforceJobDetail.replace(':id', application.job_id)}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Job
                    </Link>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center text-sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center text-sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600 p-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
  {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'all' ? 'You haven\'t applied to any jobs yet' : `No ${activeTab} applications found`}
            </p>
            <div className="mt-6">
              <Link
                to={webRoutes.workforceJobs}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        )}

        {/* Load More */}
  {filteredApplications.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              Load More Applications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceApplications;
