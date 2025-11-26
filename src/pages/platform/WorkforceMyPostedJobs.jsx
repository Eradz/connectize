import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Briefcase,
  AlertCircle,
  TrendingUp,
  UserPlus2,
  ClockCheck
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

  return (
    <div className="min-h-screen">
      <div className="">
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
    </div>
  );
};

export default WorkforceMyPostedJobs;
