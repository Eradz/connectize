import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Briefcase,
  AlertCircle,
  TrendingUp,
  UserPlus2,
  ClockCheck,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Trash2,
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import { toast } from 'sonner';
import { BriefCaseIcon } from '../../icon';
import { JobCard } from '../../components/workforce/JobCard';
import BackArrowButton from '../../components/BackArrowButton';

const WorkforceMyPostedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  useEffect(() => {
    loadMyPostedJobs();
  }, []);

  // Derive filtered + sorted jobs without triggering extra state updates
  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        (job.title || '').toLowerCase().includes(term) ||
        (job.description || '').toLowerCase().includes(term) ||
        (job.location || '').toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'applications':
          return (b.application_count || 0) - (a.application_count || 0);
        case 'created_at':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    return filtered;
  }, [jobs, searchTerm, filterStatus, sortBy]);

  const loadMyPostedJobs = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getMyCompanyJobs();
      const data = response.data?.results || response.data || response || [];
      setJobs(data);
    } catch (error) {
      console.error('Failed to load my posted jobs:', error);
      toast.error('Failed to load your posted jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await workforceAPI.deleteJob(jobId);
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(job => job.id !== jobId));
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Job Card Component
  const MobileJobCard = ({ job }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FFF1C6] rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
            <p className="text-xs text-gray-500">{job.company_name || 'Big Kahuna Burger Ltd.'}</p>
          </div>
        </div>
        <Bookmark className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex gap-2 mb-3">
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">
          {job.employment_type || 'Professional'}
        </span>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md font-medium">
          {job.job_type || 'Temporarily'}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {job.description || 'We are looking for an experienced field engineer to contribute to our continued success...'}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>{job.salary || '20,345/Annually'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{job.location || '2672 Westheimer Rd. Santa Ana, Illinois 85486'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Exp: {job.expiry_date || '10/12/2025'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="w-4 h-4" />
          <span>{job.application_count || 23} Applied</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Eye className="w-4 h-4" />
          <span>{job.views_count || 234} Views</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`${webRoutes.workforceJobDetails}/${job.id}`}
          className="flex-1 px-4 py-2 bg-[#FFCF3F] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#FFC700] transition-colors text-center"
        >
          Apply Now
        </Link>
        <Link
          to={`${webRoutes.workforceJobDetails}/${job.id}`}
          className="flex-1 px-4 py-2 bg-[#FFE7A4] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#FFD780] transition-colors text-center"
        >
          View Details
        </Link>
        <button
          onClick={() => {
            setJobToDelete(job);
            setShowDeleteModal(true);
          }}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop View */}
      <div className="hidden lg:block">
        {/* Header */}
        <div className="my-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className='flex'>
              <BackArrowButton />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Posted Jobs</h1>
                <p className="mt-2 text-gray-600">
                  Manage jobs you've posted and track applications
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to={webRoutes.workforceJobCreate}
                className="inline-flex items-center px-4 py-2 bg-pale_yellow text-white rounded-lg hover:bg-gold transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Post New Job
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-[#FFF1C6] rounded-lg">
                <BriefCaseIcon className="w-6 h-6" />
              </div>
              <div className="">
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-[#FFF1C6] rounded-lg">
                <ClockCheck className="w-6 h-6" />
              </div>
              <div className="">
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(job => job.status === 'active').length}
                </p>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-[#FFF1C6] rounded-lg">
                <UserPlus2 className="w-6 h-6" />
              </div>
              <div className="">
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((sum, job) => sum + (job.application_count || 0), 0)}
                </p>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-[#FFF1C6] rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="">
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + (job.application_count || 0), 0) / jobs.length) : 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Avg. Applications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No jobs found' : 'No jobs posted yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Start building your team by posting your first job opportunity.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link
                  to={webRoutes.workforceJobCreate}
                  className="inline-flex items-center px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold/70 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Post Your First Job
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white p-4">
              {/* Filters and Search */}
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search jobs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="draft">Draft</option>
                        <option value="paused">Paused</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="created_at">Newest First</option>
                        <option value="title">Job Title</option>
                        <option value="applications">Most Applications</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} myPostedJob={true}/>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden bg-gray-50 min-h-screen font-poppins">
        {/* Mobile Header */}
        <div className="bg-white px-4 py-4 sticky top-0 z-10">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">My Posted Jobs</h1>
          <div className="flex items-end justify-between">
            <p className="text-[16px] text-gray-600">
              Manage Jobs You've Posted<br />And Track Application
            </p>
            <Link
              to={webRoutes.workforceJobCreate}
              className="w-10 h-10 bg-[#FFE8A1] rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <Plus className="w-5 h-5 text-gray-900" />
            </Link>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-[#FFF1C6] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Briefcase className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{jobs.length || 30}</p>
              <p className="text-xs text-gray-600">Total Jobs</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-[#FFF1C6] rounded-lg flex items-center justify-center mx-auto mb-2">
                <ClockCheck className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(job => job.status === 'active').length || 10}
              </p>
              <p className="text-xs text-gray-600">Active Jobs</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-[#FFF1C6] rounded-lg flex items-center justify-center mx-auto mb-2">
                <UserPlus2 className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.reduce((sum, job) => sum + (job.application_count || 0), 0) || '98%'}
              </p>
              <p className="text-xs text-gray-600">Total Applications</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-[#FFF1C6] rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + (job.application_count || 0), 0) / jobs.length) : 5}
              </p>
              <p className="text-xs text-gray-600">Avg Application</p>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm appearance-none pr-8"
              >
                <option value="all">All Location</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm appearance-none pr-8"
              >
                <option value="created_at">Newest First</option>
                <option value="title">Job Title</option>
                <option value="applications">Most Applications</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Deal Rooms"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Mobile Jobs List */}
        <div className="px-4 pb-4 space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No jobs found' : 'No jobs posted yet'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Start posting your first job.'
                }
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <MobileJobCard key={job.id} job={job} />
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && jobToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Job</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{jobToDelete.title}"? This action cannot be undone and all applications will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setJobToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJob(jobToDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkforceMyPostedJobs;