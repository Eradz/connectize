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
  TrendingDown,
  Pencil,
  BookmarkCheck,
  Bookmark,
  ClockFading,
  House,
  Dot,
  StarIcon,
  User2,
  CalendarDays,
  ClockCheck,
  BookText
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI as workforceService } from '../../api-services/workforce';
import { formatSalary, getExperienceBadgeColor, getJobTypeIcon, getTimeAgo, toggleSaveJob } from '../../components/workforce/jobcardUtils';
import BackArrowButton from '../../components/BackArrowButton';
import { StarFilledIcon } from '../../icon';
import { MessageOutlined } from '@ant-design/icons';
import Scroll from '../../components/Scroll';
import { toast as notify } from "sonner";
import { baseURL, getAuthorizationHeader } from '../../lib/helpers';
import axios from 'axios';
import ApplicationActionModal from '../../components/workforce/ApplicationActionModal';

const WorkforceApplications = () => {
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);  
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
      console.log(applications)
  // No separate filtered state; derived via useMemo
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
  // No separate filtered state; derived via useMemo
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplicationModal = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleApplicationUpdate = () => {
    loadApplications();
  };

  const handleApplicationDelete = () => {
    loadApplications();
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
      case 'submitted': return 'bg-green-200 text-green-900';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-cyan-100 text-cyan-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'offer_made': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-gradient-to-br from-[#FFC000] to-[#FF8400] text-transparent';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-300';
      case 'under_review': return 'bg-blue-100';
      case 'shortlisted': return 'bg-cyan-100';
      case 'interview_scheduled': return 'bg-purple-100';
      case 'offer_made': return 'bg-green-100';
      case 'hired': return 'bg-gradient-to-br from-[#FFC000] to-[#FF8400] text-transparent';
      case 'rejected': return 'bg-red-100';
      case 'withdrawn': return 'bg-gray-100';
      default: return 'bg-gray-100';
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
    if (!dateString) return 'Not Reviewed Yet';
    return new Date(dateString).toLocaleDateString();
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="">
        <div className="">
          <div className="flex justify-between items-center py-6">
            <div className='flex items-start'>
              <BackArrowButton/>
              <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">Track and manage your job applications</p>
              </div>
            </div>
            {/* <div className="flex space-x-3">
              <button
                onClick={loadApplications}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <Link
                to={webRoutes.workforceJobs}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-custom_yellow flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Find Jobs
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      <div className="">
        {/* Tabs */}
        <div >
          <div className="hidden md:flex" >
          <nav className="flex gap-2" aria-label="Tabs">
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
                      ? 'border-transparent bg-[#FFDB76]'
                      : 'border-[#D9D9D9] text-[#495057] hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap p-2 border-2 rounded-full font-medium text-sm flex items-center`}
                >
                  {tab.label}
                  <span className={`ml-1 px-2 py-1 text-xs rounded-full bg-[#FF1212] text-white`}>
                    {getTabCount(tab.key)}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          <div className="md:hidden">
            <Scroll>
            <nav className="flex gap-2" aria-label="Tabs">
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
                      ? 'border-transparent bg-[#FFDB76]'
                      : 'border-[#D9D9D9] text-[#495057] hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap p-2 border-2 rounded-full font-medium text-sm flex items-center`}
                >
                  {tab.label}
                  <span className={`ml-1 px-2 py-1 text-xs rounded-full bg-[#FF1212] text-white`}>
                    {getTabCount(tab.key)}
                  </span>
                </button>
              ))}
            </nav>
            </Scroll>
          </div>

        </div>
        {/* Body Section */}
          <div className='bg-white mt-4 p-4'>
              {/* Search and Filters */}
              <div className="pb-4">
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
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="offered">Offered</option>
                          <option value="hired">Hired</option>
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
                          <option value="full_time">Full-time</option>
                          <option value="Contract">Contract</option>
                          <option value="part_time">Part-time</option>
                          <option value="temporary">Temporary</option>
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
            {/* Applications List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplications.map((job, i) => (
                <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow h-[400px]">
                        <div className="flex items-start justify-between mb-2 md:mb-4 h-[50%] md:h-[35%] ">
                          <div className="flex-1">
                            <div className="flex justify-between items-center space-x-3 mb-2">
                                <div className="flex gap-2">
                                    <div className="bg-[#FFF1C6] p-2 rounded-lg">
                                        {getJobTypeIcon(job.job_type)}
                                    </div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{job.job_title}</h3>
                                </div>
                           
                            <Link to={`/jobs/${job?.job_posting}`} className="p-2 bg-pale_yellow flex rounded-lg gap-2 items-start">
                                <BookText className="w-5 h-5" />
                                <p className="text-sm md:flex hidden">View Details</p>
                            </Link>
                          </div>
                              <div className="flex items-center text-sm text-gray-600 pb-4">
                                  <Building className="w-4 h-4 mr-1" />
                                  <span className="font-medium">{job.job_company || 'Company'}</span>
                              </div>
                              <div className='flex flex-col md:flex-row md:items-center justify-between'>
                                <div className='flex flex-col md:flex-row md:items-center gap-2'>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <CalendarDays className="w-4 h-4 mr-2 " />
                                    <span>Date Applied: {formatDate(job.submitted_at)}</span>
                                  </div>
                
                                  <div className="flex items-center text-sm text-gray-600">
                                    <ClockCheck className="w-4 h-4 mr-2 " />
                                    <span>{`Reviewed At: ${formatDate(job.reviewed_at)}`}</span>
                                  </div>
                                </div>
                                <div className={`flex mt-2 md:mt-0 w-fit text-xs items-center ${getStatusBackgroundColor(job.status)} p-[0.5px] rounded-full`}>
                                  <span className={`bg-white font-medium px-3 py-2 capitalize rounded-full `}>
                                    <div className={`${getStatusColor(job.status)} bg-clip-text`}>
                                      {job.status}
                                    </div>
                                    </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="h-[28%] md:h-[30%] border-b-gray-500 ">
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="w-4 h-4 mr-2 " />
                              <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
                            </div>
                
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 " />
                            <span>{job.job_location}</span>
                            {job.requires_relocation && (
                              <span className="ml-2 text-orange-600">(Relocation Required)</span>
                            )}
                          </div>
                          
                          
                
                          {job.application_deadline && (
                            <div className="flex items-center text-sm text-gray-600">
                              <House className="w-4 h-4 mr-2" />
                              <div className='flex capitalize text-[#6C757D]'>
                                <span>{job.job_type}</span>
                                <Dot/>
                                <span >{job.job_level}</span>
                              </div>
                            </div>
                          )}

                          <div className='flex items-center text-sm text-[#6C757D]'>
                            <StarFilledIcon className="mr-2"/>
                            <span>Job Match: {job.ai_match_score || 0}%</span>
                          </div>
                        </div>

                        <div className=' flex items-center text-sm h-[10%] md:h-[15%] text-[#6C757D] border border-y-gray-400 border-x-transparent py-2'>
                          <User2 className='w-4 h-4 mr-2'/>
                          <div className='flex items-center gap-2'>
                            <p>Person contact:</p>
                            <p>{job.reviewed_by || 'No Reviewer assigned'}</p>
                          </div>
                        </div>
                
                        <div className="flex items-center my-2  h-[10%]">
                          {/* <div className="flex items-center gap-2 text-[12px]">
                             <button
                                onClick={async () => {
                                try {
                                const auth = await getAuthorizationHeader();
                                const res = await axios.get(`${baseURL}/api/v1/deals/documents/${job.job_posting}/download/`, {
                                headers: auth || {},
                                responseType: "blob",
                                });
                                const blob = new Blob([res.data]);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                const label = job.name || job.title || `Document ${i + 1}`;
                                a.href = url;
                                a.download = label.replace(/\s+/g, "_");
                                a.click();
                                window.URL.revokeObjectURL(url);
                                notify.success("Download started");
                                } catch (e) {
                                notify.error("Download failed: " + (e.response?.status === 401 ? "Authentication required" : "Unknown error"));
                                }
                                }}
                                className="flex items-center px-4 py-2 bg-pale_yellow rounded-lg cursor-pointer"
                                >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </button>
                            <div className="flex items-center bg-gradient-to-br from-[#FFC000] to-[#FF8400] p-[0.5px] rounded-lg cursor-pointer">
                              <div className='flex items-center px-4 py-2 bg-white rounded-lg'>
                              <MessageOutlined className="w-4 h-4 md:mr-1 text-[#FFC000]" />
                              <span className='text-[#FF8400] hidden md:flex'>
                                Message
                              </span>
                              </div>
                            </div>
                          </div> */}
                          
                          <div className="flex flex-row-reverse w-full justify-between  items-center space-x-2 text-[12px]">
                            <button
                              onClick={() => handleOpenApplicationModal(job)}
                              className="bg-[#FFDCDC] flex p-2 rounded-lg hover:bg-red-300 transition-colors font-medium"
                            >
                              <Trash2 className="w-4 h-4 md:mr-1 text-[#FF0000]" />
                              <p className="text-[#FF0000] hidden md:flex">Delete</p>
                            </button>
                            <button
                              onClick={() => handleOpenApplicationModal(job)}
                              className="flex font-medium bg-gray-100 hover:bg-gray-300 p-2 rounded-lg"
                            >
                                <Edit className="w-4 h-4 md:mr-1 " />
                                <p className="hidden md:flex">Edit</p>
                            </button>
                          </div>
                          
                        </div>
                </div>
              ))}
            </div>
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
                className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-custom_yellow"
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

      {/* Application Action Modal */}
      <ApplicationActionModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onClose={handleCloseModal}
        application={selectedApplication}
        onUpdate={handleApplicationUpdate}
        onDelete={handleApplicationDelete}
      />
    </div>
  );
};

export default WorkforceApplications;
