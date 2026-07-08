import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Job Details | Connectize",
    description: "View job details, requirements, and apply to oil and gas positions on Connectize.",
  keywords: "job details, oil and gas job, energy career, apply, Connectize",
  });

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import { toast } from "sonner";
import { workforceJobService } from "../../api-services/oilgas";
import { MapPin, Clock, DollarSign, Users, BookmarkPlus, Bookmark, Send, ArrowLeft, Building, Calendar, Eye, ClockFading, Edit, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import workforce, { workforceAPI } from "../../api-services/workforce";
import { formatSalary, getExperienceBadgeColor, JobCount } from "../../components/workforce/jobcardUtils";
import { JobCard } from "../../components/workforce/JobCard";
import BackArrowButton from "../../components/BackArrowButton";
import DownloadButton from "../../components/DownloadButton";
import { useAuth } from "../../context/userContext";
import MoreOptions from "../../components/MoreOptions";
import PingButton from "../../components/PingButton";
import { confirmDialog } from '../../lib/confirm.jsx';

export default function WorkforceJobDetail() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const {user} = useAuth()
  // Apply form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [resume, setResume] = useState(null);
  const [showApplicants, setShowApplicants] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const isApply = pathname.endsWith("/apply");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await workforceJobService.getById(id);
        const jobData = res?.data || res;
        if (isMounted) {
          setJob(jobData);
          // Initialize saved state from API response
          setSaved(jobData?.user_saved || false);
        }
      } catch (e) {
        if (isMounted) setError(e?.response?.data?.detail || e?.message || "Failed to load job");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load similar jobs once the job is available
  useEffect(() => {
    if (!job) return;
    let isMounted = true;
    async function loadSimilar() {
      try {
        setSimilarLoading(true);
        const res = await workforceAPI.getJobs({ page_size: 50 });
        const list = res?.data?.results || res?.data || [];
        // Compute a simple similarity score
        const titleTokens = (job.title || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        const scoreJob = (j) => {
          if (!j || j.id === job.id) return -1;
          let score = 0;
          if (j.company_name && job.company_name && j.company_name === job.company_name) score += 3;
          if ((j.location || "").toLowerCase() === (job.location || "").toLowerCase()) score += 2;
          const tokens = (j.title || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
          const overlap = tokens.filter(t => titleTokens.includes(t)).length;
          score += overlap;
          return score;
        };
        const candidates = list
          .filter(j => j && j.id !== job.id)
          .map(j => ({ j, s: scoreJob(j) }))
          .filter(x => x.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 3)
          .map(x => x.j);
        if (isMounted) setSimilarJobs(candidates);
      } catch (e) {
        if (isMounted) setSimilarJobs([]);
      } finally {
        if (isMounted) setSimilarLoading(false);
      }
    }
    const loadApplicants = async () => {
      try {
        setLoadingApplicants(true);
        const response = await workforce.getJobApplications();
        const applicantsData = response?.data?.results || response?.data || [];
        setApplicants(applicantsData);
      } catch (err) {
        console.error('Error loading applicants:', err);
        setApplicants([]);
        toast.error('Failed to load applicants');
      } finally {
        setLoadingApplicants(false);
      }
    };
    loadSimilar();
    loadApplicants();
    return () => { isMounted = false; };
  }, [job]);


  const handleShowApplicants = () => {
    setShowApplicants(true);
  };

  const isJobPoster = user?.id === job?.posted_by || user?.id === job?.created_by;

  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: 'Delete job',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const result = await workforceJobService.delete(job.id);
      if (result === null) return; // makeApiRequest returns null on failure and already toasts the API error
      toast.success('Job deleted');
      navigate(webRoutes.workforceJobs);
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className='flex py-6'>
        <Link
          to= {webRoutes.workforceJobs}
          className="flex gap-2 md:gap-0 w-fit md:w-[6%] bg-white p-2 h-[50%] hover:bg-gray-100 rounded-lg transition-colors mb-4 md:mr-4"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
          <span className='md:hidden'>Back</span>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Job details</h1>
            <p className="mt-2 text-gray-600">
              Manage jobs you’ve posted and track application
            </p>
        </div>
        {isJobPoster && (
          <div className="ml-auto flex items-center gap-2">
            {job?.company_name && (
              <PingButton objectType="job" objectId={job.id} tip="Ping job" />
            )}
            <MoreOptions className="!w-fit">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(webRoutes.workforceJobUpdate.replace(":id", job?.id))}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 text-sm text-red-700 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </MoreOptions>
          </div>
        )}
      </div>

      <div className="bg-white p-3">
        {loading ? (
          <div className="bg-white border rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-white border rounded-xl p-6">
            <div className="text-red-600">{error}</div>
          </div>
        ) : (
          <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 relative ">
              <div className="bg-white border rounded-xl p-6 ">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {job?.title || `Job #${id}`}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {job?.company_name && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {job.company_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        if (saved) {
                          await workforceJobService.unsaveJob(id);
                          setSaved(false);
                          toast.success("Job unsaved");
                        } else {
                          await workforceJobService.saveJob(id);
                          setSaved(true);
                          toast.success("Job saved");
                        }
                      } catch (e) {
                        toast.error("Failed to update saved status");
                      }
                    }}
                    className={`inline-flex absolute top-4 right-4 items-center px-3 py-2 rounded-lg border text-sm transition-colors ${
                      saved ? 'border-pale_yellow bg-pale_yellow/20 text-gold' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {saved ? <Bookmark className="h-4 w-4 mr-2 fill-current" /> : <BookmarkPlus className="h-4 w-4 mr-2" />}
                    {saved ? "Saved" : "Save Job"}
                  </button>
                </div>

                {/* Job Details */}
                <div className="flex flex-wrap gap-4 p-2 rounded-lg">
                  {job?.salary_range && (
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Salary</div>
                        <div className="font-medium">{job.salary_range}</div>
                      </div>
                    </div>
                  )}
                  {job?.experience_level && (
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
                  )}
                  {job?.posted_date && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Posted</div>
                        <div className="font-medium">{new Date(job.posted_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this role</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {job?.description || "No description available."}
                  </p>
                </div>

                {/* Requirements */}
                {job?.requirements && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <div className="text-gray-600">
                      {Array.isArray(job.requirements) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {job.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="whitespace-pre-wrap">{job.requirements}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {job?.benefits && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About Our Company</h3>
                    <div className="text-gray-600">
                      {Array.isArray(job.benefits) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {job.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="whitespace-pre-wrap">{job.benefits}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className={`w-[90%] flex justify-between items-center space-x-1 text-['12px'] text-gray-500`}>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {job?.applications_count || 0} applicants
                          </div>
                          <span className="bg-gray-400 w-[1px] h-4"></span>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {/* <DealIcon className="w-6 h-6" fill={"#ffffff"}/> */}
                            {job?.views_count || 0} views
                          </div>
              </div>
              {/* {<JobDetails />} */}
              <h2><b>Job Details</b></h2>
                <div className="flex flex-col gap-2">
                
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{formatSalary(job?.salary_min, job?.salary_max, job?.currency)}</span>
                          </div>
                
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{job?.location}</span>
                            {job?.requires_relocation && (
                              <span className="ml-2 text-orange-600">(Relocation Required)</span>
                            )}
                          </div>
                          
                          
                
                          {job?.application_deadline && (
                            <div className="flex items-center text-sm text-gray-600">
                              {/* <Calendar className="w-4 h-4 mr-2 text-gray-400" /> */}
                              <ClockFading className="w-4 h-4 mr-2 text-gray-400" />
                              <span>Exp: {new Date(job?.application_deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

              <div className="bg-white border rounded-xl p-4">
                <div className="space-y-2">
                  {isJobPoster ? (
                    <>
                      <b>Job Applicants</b>
                      <div className="text-sm text-gray-500">
                        View and manage applications for this job
                      </div>
                      <button
                        onClick={()=>navigate(webRoutes.workforceApplicationsManage.replace(":id", job?.id))}
                        disabled={job?.applications_count === 0}
                        className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg font-medium hover:bg-custom_yellow transition-colors flex items-center justify-center"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        View Applicants ({job?.applications_count || 0})
                      </button>
                    </>
                  ) : (
                    <>
                      <b>Apply for this job</b>
                      <div className="text-sm text-gray-500">
                        Please Note: Application typically takes 2-3 minutes
                      </div>
                      <button
                        onClick={() => setShowApplicationModal(true)}
                        className="bg-gradient-to-br from-[#FFC000] to-[#FF8400] text-white p-2 rounded-lg font-medium hover:bg-custom_yellow transition-colors flex items-center justify-center"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Apply Now
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
                <div className="py-6">
                  <b className="pb-4">Similar jobs</b>
                  <div className="">
                 {similarLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : similarJobs.length > 0 ? (
                  <div className="grid grid-col-1 md:grid-cols-2 gap-4">
                    {similarJobs.map(job => <JobCard key={job?.id} job={job}  />)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z" fill="#9CA3AF"/>
                        <path d="M16 14C17.1046 14 18 13.1046 18 12C18 10.8954 17.1046 10 16 10C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14Z" fill="#9CA3AF"/>
                        <path d="M21 20C21 21.1046 20.1046 22 19 22C17.8954 22 17 21.1046 17 20V18C17 16.8954 17.8954 16 19 16C20.1046 16 21 16.8954 21 18V20Z" fill="#9CA3AF"/>
                        <path d="M3 20C3 21.1046 3.89543 22 5 22C6.10457 22 7 21.1046 7 20V18C7 16.8954 6.10457 16 5 16C3.89543 16 3 16.8954 3 18V20Z" fill="#9CA3AF"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Similar Jobs</h3>
                    <p className="text-gray-600 text-center max-w-sm text-sm">
                      We couldn't find any similar jobs at the moment. Try exploring other opportunities or refine your search criteria.
                    </p>
                  </div>
                )}
              </div>
                </div>
          </div>
          
        )}
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal || isApply}
        onClose={() => { setShowApplicationModal(false); navigate(pathname.replace("/apply", "")) }}
        title="Job Application form"
        className=""
        >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setSubmitting(true);
              const formData = new FormData();
              formData.append("full_name", fullName);
              formData.append("email", email);
              formData.append("cover_letter", coverLetter);
              if (resume) formData.append("resume", resume);
              
              const response = await workforceJobService.applyToJob(id, formData);

              if(response !== null){
                setFullName("");
                setEmail("");
                setCoverLetter("");
                setResume(null);
                setShowApplicationModal(false);
                toast.success("Application submitted successfully!");
                navigate(webRoutes.workforceJobDetail.replace(":id", id));
              }
            } catch (e) {
              toast.error("Failed to submit application");
            } finally {
              setSubmitting(false);
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume/CV
            </label>
            <DownloadButton
              newDocFile={resume}
              setNewDocFile={setResume}
            />
            <div className="text-xs text-gray-500">
              Accepted formats: PDF, DOC, DOCX (max 5MB)
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're interested in this role and what makes you a great fit..."
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {setShowApplicationModal(false); pathname.includes("/apply") && navigate(pathname.replace("/apply", ""))}}
              className="w-[30%] px-6 py-2 bg-pale_yellow border rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-center w-[30%] px-6 py-2 bg-custom_yellow rounded hover:bg-gold disabled:opacity-60 flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  {/* <Send className="h-4 w-4 mr-2" /> */}
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Applicants Modal */}
      {showApplicants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Applicants for "{job?.title}"
              </h3>
              <button
                onClick={() => {
                  setShowApplicants(false);
                  setApplicants([]);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingApplicants ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
                  <p className="text-slate-600">Loading applicants...</p>
                </div>
              ) : applicants.length > 0 ? (
                <div className="space-y-3">
                  {applicants.map((applicant) => (
                    <div key={applicant.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {(applicant.full_name || applicant.user?.first_name || 'A').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900">{applicant.full_name || applicant.user?.full_name || 'Unknown'}</h4>
                        <p className="text-sm text-slate-600">
                          {applicant.email || applicant.user?.email || 'No email provided'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Applied: {new Date(applicant.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {applicant.cover_letter && (
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2 italic">
                            "{applicant.cover_letter}"
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {applicant.resume && (
                          <a
                            href={applicant.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            View Resume
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No applications yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}