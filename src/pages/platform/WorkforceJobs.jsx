import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  DollarSign,
  Clock,
  Users,
  Building,
  Star,
  Bookmark,
  BookmarkCheck,
  Eye,
  ExternalLink,
  Briefcase,
  TrendingUp,
  LucideChartNoAxesCombined,
  ClockFading, 
  MapPin
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { BriefCaseIcon } from '../../icon';

const WorkforceJobs = () => {
  const [jobs, setJobs] = useState([]);
  // derive filtered list to avoid setState on each keypress
  // keeps input focus stable and reduces unnecessary renders
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filterSalaryRange, setFilterSalaryRange] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [savedJobs, setSavedJobs] = useState(new Set());

  useEffect(() => {
    loadJobs();
  }, []);

  // derive filtered + sorted jobs without triggering extra state updates
  const filteredJobs = useMemo(() => {
    // Ensure jobs is always an array
    if (!Array.isArray(jobs)) {
      return [];
    }
    
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        (job.title || '').toLowerCase().includes(term) ||
        (job.company_name || '').toLowerCase().includes(term) ||
        (job.location || '').toLowerCase().includes(term) ||
        (Array.isArray(job.skills_required) ? job.skills_required : []).some(skill => (skill || '').toLowerCase().includes(term))
      );
    }

    // Location filter
    if (filterLocation !== 'all') {
      filtered = filtered.filter(job => 
        (job.location || '').toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    // Job type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(job => job.job_type === filterType);
    }

    // Experience level filter
    if (filterExperience !== 'all') {
      filtered = filtered.filter(job => job.experience_level === filterExperience);
    }

    // Salary range filter
    if (filterSalaryRange !== 'all') {
      filtered = filtered.filter(job => {
        const salary = job.salary_min || 0;
        switch (filterSalaryRange) {
          case '50000-80000':
            return salary >= 50000 && salary <= 80000;
          case '80000-120000':
            return salary >= 80000 && salary <= 120000;
          case '120000-150000':
            return salary >= 120000 && salary <= 150000;
          case '150000-plus':
            return salary >= 150000;
          default:
            return true;
        }
      });
    }

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'salary':
          return (b.salary_min || 0) - (a.salary_min || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [jobs, searchTerm, filterLocation, filterType, filterExperience, filterSalaryRange, sortBy]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      // Use direct fetch since our API service has authentication issues
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/v1/workforce/jobs/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const jobs = data.results || [];
        setJobs(jobs);
      } else {
        console.error('Failed to fetch jobs:', response.status, response.statusText);
        setJobs([]);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
  e.preventDefault();
  };

  const toggleSaveJob = async (jobId) => {
    try {
      if (savedJobs.has(jobId)) {
        await workforceJobService.unsaveJob(jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await workforceJobService.saveJob(jobId);
        setSavedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Failed to toggle job save:', error);
      // Don't show error to user, just log it
    }
  };

  const formatSalary = (min, max, currency = 'USD') => {
    const formatAmount = (amount) => {
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
      return amount.toString();
    };

    if (min && max) {
      return `$${formatAmount(min)} - $${formatAmount(max)}`;
    } else if (min) {
      return `$${formatAmount(min)}+`;
    } else if (max) {
      return `Up to $${formatAmount(max)}`;
    }
    return 'Salary not specified';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const getExperienceBadgeColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeIcon = (type) => {
    switch (type) {
      case 'full_time': return <Briefcase className="w-4 h-4" />;
      case 'part_time': return <Clock className="w-4 h-4" />;
      case 'contract': return <ExternalLink className="w-4 h-4" />;
      case 'remote': return <Users className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  const getCompanySize = (jobCount) => {
    if (jobCount >= 100) return 'Large Enterprise (100+ employees)';
    if (jobCount >= 50) return 'Medium Company (50-99 employees)';
    if (jobCount >= 10) return 'Small Company (10-49 employees)';
    return 'Startup (<10 employees)';
  };

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-[#FFF1C6] p-2 rounded-lg">
                {getJobTypeIcon(job.job_type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Building className="w-4 h-4 mr-1" />
                  <span className="font-medium">{job.company_name || 'Company'}</span>
                  <span className="mx-2">•</span>
                  <span>{getTimeAgo(job.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getExperienceBadgeColor(job.experience_level)}`}>
                {job.experience_level} Level
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {job.job_type?.replace('_', ' ')}
              </span>
              {job.is_remote && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Remote
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => toggleSaveJob(job.id)}
            className={`p-2 rounded-lg transition-colors ${
              savedJobs.has(job.id) 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            {savedJobs.has(job.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>

        <div className="space-y-2 mb-4">

          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{job.location}</span>
            {job.requires_relocation && (
              <span className="ml-2 text-orange-600">(Relocation Required)</span>
            )}
          </div>
          
          

          {job.application_deadline && (
            <div className="flex items-center text-sm text-gray-600">
              {/* <Calendar className="w-4 h-4 mr-2 text-gray-400" /> */}
              <ClockFading className="w-4 h-4 mr-2 text-gray-400" />
              <span>Exp: {new Date(job.application_deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-[12px] text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {job.applications_count || 0} applicants
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {/* <DealIcon className="w-6 h-6" fill={"#ffffff"}/> */}
              {job.views_count || 0} views
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-[12px]">
            <Link
              to={webRoutes.workforceJobApply.replace(':id', job.id)}
              className="bg-custom_yellow text-white p-2 rounded-lg hover:bg-gold transition-colors font-medium"
            >
              Apply Now
            </Link>
            <Link
              to={webRoutes.workforceJobDetail.replace(':id', job.id)}
              className="font-medium bg-pale_yellow p-2 rounded-lg"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center pt-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Oil & Gas Jobs</h1>
              <p className="text-gray-600 mt-1">Find your next opportunity in the energy sector</p>
            </div>
            <Link
                to={webRoutes.workforceJobCreate}
                className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold/20 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                 New deal room
              </Link>
          </div>
        </div>
      </div>

      <div className="bg-white my-8">
        {/* Job Statistics */}
        <div className="bg-background grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 pb-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col text-center gap-1 items-center">
              <div className="bg-[#FFF1C6] p-3 rounded-lg">
                <BriefCaseIcon className="w-6 h-6 text-[#495057]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                <p className="text-sm text-gray-600">Active Jobs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col text-center gap-1 items-center">
              <div className="bg-[#FFF1C6] p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#495057]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">25%</p>
                <p className="text-sm text-gray-600">Growth This Month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col text-center gap-1 items-center">
              <div className="bg-[#FFF1C6] p-3 rounded-lg">
                <Star className="w-6 h-6 text-[#495057]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col text-center gap-1 items-center">
              <div className="bg-[#FFF1C6] p-3 rounded-lg">
                <LucideChartNoAxesCombined className="w-6 h-6 text-[#495057]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">98%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 w-[95%] mx-auto ">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, skills, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Locations</option>
              <option value="Houston">Houston, TX</option>
              <option value="Aberdeen">Aberdeen, UK</option>
              <option value="Stavanger">Stavanger, Norway</option>
              <option value="Dubai">Dubai, UAE</option>
              <option value="Lagos">Lagos, Nigeria</option>
              <option value="Rio de Janeiro">Rio de Janeiro, Brazil</option>
              <option value="Perth">Perth, Australia</option>
              <option value="Calgary">Calgary, Canada</option>
              <option value="Luanda">Luanda, Angola</option>
              <option value="Doha">Doha, Qatar</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
            </select>

            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Experience</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Executive">Executive</option>
            </select>

            <select
              value={filterSalaryRange}
              onChange={(e) => setFilterSalaryRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Salaries</option>
              <option value="50000-80000">$50K - $80K</option>
              <option value="80000-120000">$80K - $120K</option>
              <option value="120000-150000">$120K - $150K</option>
              <option value="150000-plus">$150K+</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="created_at">Newest First</option>
              <option value="salary_max">Highest Salary</option>
              <option value="application_deadline">Deadline Soon</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Filter Results Count */}
        <div className="flex justify-between items-center mb-6 w-[95%] mx-auto">
          <div className="text-sm text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
          <div className="text-sm text-gray-500">
            Updated {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <div className="mt-6">
              <Link
                to={webRoutes.workforceJobCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gold hover:bg-gold/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                 New deal room
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-[95%] mx-auto">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {jobs.length > 0 && (
          <div className="text-center mt-8 w-[95%] mx-auto">
            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Load More Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceJobs;
