import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Star,
  Briefcase,
  TrendingUp,
  LucideChartNoAxesCombined,
  Bookmark,
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { BriefCaseIcon } from '../../icon';
import { workforceJobService } from '../../api-services/oilgas';
import { JobCard } from '../../components/workforce/JobCard';
import { useSubscription } from '../../context/SubscriptionContext';
import BackArrowButton from '../../components/BackArrowButton';

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
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      const response = await workforceJobService.getSavedJobs();
      const savedJobIds = (response || []).map(saved => saved.job_posting?.id || saved.job_posting);
      setSavedJobs(new Set(savedJobIds.filter(id => id)));
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    }
  };

  const handleToggleSave = (jobId, isSaved) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  };

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

  const getCompanySize = (jobCount) => {
    if (jobCount >= 100) return 'Large Enterprise (100+ employees)';
    if (jobCount >= 50) return 'Medium Company (50-99 employees)';
    if (jobCount >= 10) return 'Small Company (10-49 employees)';
    return 'Startup (<10 employees)';
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row">
        <BackArrowButton  className={"w-fit"}/>
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Oil & Gas Jobs</h1>
              <p className="text-gray-600 mt-1">Find your next opportunity in the energy sector</p>
            </div>
            <div className="flex items-center gap-[6px] md:gap-3">
              <Link
                to={webRoutes.workforceSavedJobs}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Bookmark className="w-4 h-4 md:mr-2" />
                <span className="hidden md:flex">
                  Saved Jobs ({savedJobs.size})
                </span>
              </Link>
              <Link
                to={webRoutes.workforceJobCreate}
                className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold/20 flex items-center"
              >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:flex">
                  Post a Job
                </span>
              </Link>
            </div>
          </div>
      </div>

      {/* NAVIGATION GRID */}
      <div className="md:hidden pt-4">
        <div className="grid grid-cols-2 gap-4">
          <Link
            to={webRoutes.workforceJobs}
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-[#FFE8A3] to-[#FFD700] rounded-xl border-2 border-[#FFD700] hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex-1">
              <p className="text-[12px] text-gray-900">Job Marketplace</p>
            </div>
          </Link>

          <Link
            to={webRoutes.workforceSavedJobs}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex-1">
              <p className="text-[12px] text-gray-900">Saved Jobs</p>
            </div>
          </Link>

          <Link
            to={webRoutes.workforceMyPostedJobs}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex-1">
              <p className="text-[12px] text-gray-900">My Posted Jobs</p>
            </div>
          </Link>

          <Link
            to={webRoutes.workforceMyAppliedJobs}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex-1">
              <p className="text-[12px] text-gray-900">My Applications</p>
            </div>
          </Link>

          <Link
            to={webRoutes.workforceProfiles}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex-1">
              <p className="text-[12px] text-gray-900">Professionals</p>
            </div>
          </Link>

          <Link
            to={webRoutes.workforceEvents}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex-1">
              <p className="text-[12px] text-gray-900">Industry Events</p>
            </div>
          </Link>

          <Link
            to={webRoutes.workforceMyRegistrations}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex-1">
              <p className="text-[12px] text-gray-900">My Registered Events</p>
            </div>
          </Link>

          <Link
            to={webRoutes.workforceMyEvents}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex-1">
              <p className="text-[12px] text-gray-900">My Created Events</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="md:bg-white my-8">
        {/* Job Statistics */}
        {/* <div className="bg-background grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 pb-4">
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
        </div> */}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 md:w-[95%] mx-auto ">
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
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
            </select>

            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Experience</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="executive">Executive</option>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:w-[95%] mx-auto">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                savedJobs={savedJobs}
                onToggleSave={handleToggleSave}
              />
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
