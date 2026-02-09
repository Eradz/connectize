import { Bookmark, BookmarkCheck, Briefcase, Building, Clock, ClockFading, DollarSign, ExternalLink, Eye, MapPin, Pen, Pencil, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import { useState } from "react";
import { workforceJobService } from "../../api-services/oilgas";
import { useSubscription } from "../../context/SubscriptionContext";


export const JobCard = ({ job, myPostedJob, setShowDeleteModal, setJobToDelete, savedJobs: propSavedJobs, onToggleSave }) => {
  const {getCurrencySymbol} = useSubscription();
  // Use prop savedJobs if provided, otherwise use local state for backwards compatibility
  const [localSavedJobs, setLocalSavedJobs] = useState(new Set());
  const savedJobs = propSavedJobs || localSavedJobs;
  
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


   const toggleSaveJob = async (jobId) => {
    try {
      if (savedJobs.has(jobId)) {
        await workforceJobService.unsaveJob(jobId);
        if (onToggleSave) {
          onToggleSave(jobId, false);
        } else {
          setLocalSavedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      } else {
        await workforceJobService.saveJob(jobId);
        if (onToggleSave) {
          onToggleSave(jobId, true);
        } else {
          setLocalSavedJobs(prev => new Set(prev).add(jobId));
        }
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
      return `${formatAmount(min)} - ${formatAmount(max)}`;
    } else if (min) {
      return `${formatAmount(min)}+`;
    } else if (max) {
      return `Up to ${formatAmount(max)}`;
    }
    return 'Salary not specified';
  };

return(
    <div className="bg-white flex flex-col justify-between rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow min-h-min w-[90%] md:w-full mx-auto">
        <div className="flex items-start justify-between mb-4 ">
          <div className="flex-1">
            <div className="flex justify-between items-center space-x-3 mb-2">
                <div className="flex gap-2">
                    <div className="bg-[#FFF1C6] p-2 rounded-lg">
                        {getJobTypeIcon(job.job_type)}
                    </div>
                        <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                </div>
                {
            myPostedJob ? 
            <Link to={`/jobs/update/${job.id}`} className="p-2 bg-pale_yellow flex rounded-lg gap-2 items-start">
                <Pencil className="w-5 h-5" />
                <p className="text-sm">Edit</p>
            </Link>
            :
          <button
            onClick={() => toggleSaveJob(job.id)}
            className={`hidden p-2 rounded-lg transition-colors ${
              savedJobs.has(job.id) 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            {savedJobs.has(job.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
          }
            </div>
              <div className="flex items-center text-sm text-gray-600 pb-4">
                  <Building className="w-4 h-4 mr-1" />
                  <span className="font-medium">{job.company_name || 'Company'}</span>
                  <span className="mx-2">•</span>
                  <span>{getTimeAgo(job.created_at)}</span>
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
          
        </div>

        <p className="text-gray-600 text-sm my-4 line-clamp-3 text-ellipsis overflow-hidden">{job.description}</p>

        <div className="space-y-2 mb-4 ">

          <div className="flex items-center text-sm text-gray-600">
            <span className="text-[18px] ml-[3px] mr-2 text-gray-400">
              {getCurrencySymbol(job.currency)}
            </span>
            {/* <DollarSign  /> */}
            <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 line-clamp-1">
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

        <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between md:justify-normal space-x-1 text-[12px] text-gray-500 mb-3 md:mb-0">
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
          
          {
            myPostedJob ? 
            <div className="flex items-center justify-between md:justify-normal space-x-2 text-[12px]">
            <button
              onClick={()=>{setShowDeleteModal(true); setJobToDelete(job)}}
              className="bg-[#FFDCDC] flex p-2 rounded-lg hover:bg-gold transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4 md:mr-1 text-[#FF0000]" />
              <p className="text-[#FF0000] hidden md:flex">Delete</p>
            </button>
            <Link
              to={webRoutes.workforceJobDetail.replace(':id', job.id)}
              className="flex font-medium bg-pale_yellow p-2 rounded-lg"
            >
                <Eye className="w-4 h-4 md:mr-1 " />
                <p className="hidden md:flex">View Details</p>
            </Link>
          </div>
            :

          <div className="flex items-center justify-between md:justify-normal space-x-2 text-[12px]">
            <Link
              to={webRoutes.workforceJobApply.replace(':id', job.id)}
              className="bg-custom_yellow text-white  text-center p-2 rounded-lg hover:bg-gold transition-colors font-medium w-[50%] md:w-fit"
            >
              Apply Now
            </Link>
            <Link
              to={webRoutes.workforceJobDetail.replace(':id', job.id)}
              className="font-medium bg-pale_yellow text-center p-2 rounded-lg w-[50%] md:w-fit"
            >
              View Details
            </Link>
          </div>
          }
        </div>
    </div>
)};