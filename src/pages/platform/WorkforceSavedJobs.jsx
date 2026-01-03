import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  BookmarkX,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceJobService } from '../../api-services/oilgas';
import { JobCard } from '../../components/workforce/JobCard';

const WorkforceSavedJobs = () => {
  const [savedJobsData, setSavedJobsData] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workforceJobService.getSavedJobs();
      const savedJobs = response || [];
      
      // Extract job data - the response contains job_posting objects
      const jobs = savedJobs.map(saved => saved.job_posting).filter(job => job);
      const jobIds = jobs.map(job => job.id);
      
      setSavedJobsData(jobs);
      setSavedJobIds(new Set(jobIds));
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
      setError('Failed to load saved jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId, isSaved) => {
    if (!isSaved) {
      // Job was unsaved, remove from the list
      setSavedJobsData(prev => prev.filter(job => job.id !== jobId));
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    } else {
      // Job was saved again (shouldn't happen on this page, but handle it)
      setSavedJobIds(prev => new Set(prev).add(jobId));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center pt-6">
          <div className="flex items-center gap-4">
            <Link 
              to={webRoutes.workforceJobs}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bookmark className="w-8 h-8 text-gold" />
                Saved Jobs
              </h1>
              <p className="text-gray-600 mt-1">
                Jobs you've bookmarked for later
              </p>
            </div>
          </div>
          <Link
            to={webRoutes.workforceJobs}
            className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold/80 flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            Browse All Jobs
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <BookmarkX className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Saved Jobs</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={loadSavedJobs}
              className="mt-4 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold/80"
            >
              Try Again
            </button>
          </div>
        ) : savedJobsData.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Saved Jobs</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't saved any jobs yet. Browse available jobs and click the bookmark icon to save them.
            </p>
            <div className="mt-6">
              <Link
                to={webRoutes.workforceJobs}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gold hover:bg-gold/80"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                You have {savedJobsData.length} saved job{savedJobsData.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedJobsData.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job}
                  savedJobs={savedJobIds}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkforceSavedJobs;
