import { BookText, Building, CalendarDays, ClockCheck, DollarSign, Dot, Edit, House, MapPin, Trash2, User2 } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { StarFilledIcon } from '../../icon'
import { formatDate, formatSalary, getJobTypeIcon, getStatusBackgroundColor, getStatusColor } from './jobcardUtils'
import ApplicationActionModal from './ApplicationActionModal'
import { useState } from 'react'
import { workforceService } from '../../api-services/oilgas'

const ApplicationJobsCard = ({job, setApplications, profile}) => {
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    console.log("Job data:", job);
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
//     if (loading) {
//     return (
//       <div className="min-h-screen ">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
//             <div className="space-y-4">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="bg-white p-6 rounded-xl border">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
//                       <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
//                       <div className="h-3 bg-gray-200 rounded w-24"></div>
//                     </div>
//                     <div className="h-6 bg-gray-200 rounded w-20"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

  return (
    <div>
        <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow h-[400px]">
            <div className="flex items-start justify-between mb-2 md:mb-4 h-[50%] md:h-[35%] ">
            <div className="flex-1">
                <div className="flex justify-between items-center space-x-3 mb-2">
                    <div className="flex gap-2">
                        <div className="bg-[#FFF1C6] p-2 rounded-lg">
                            {getJobTypeIcon(job.job_type)}
                        </div>
                            <h3 className="font-semibold text-gray-900 text-lg">{job.job_title || job.title }</h3>
                    </div>
            
                <Link to={`/jobs/${job?.job_posting}`} className="p-2 bg-pale_yellow flex rounded-lg gap-2 items-start">
                    <BookText className="w-5 h-5" />
                    <p className="text-sm md:flex hidden">View Details</p>
                </Link>
            </div>
                <div className="flex items-center text-sm text-gray-600 pb-4">
                    <Building className="w-4 h-4 mr-1" />
                    <span className="font-medium">{job.job_company || job.company_name || 'Company'}</span>
                </div>
                {profile != "company" && (
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
                )}
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
        
  )
}

export default ApplicationJobsCard