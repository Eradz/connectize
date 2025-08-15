import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import { toast } from "sonner";
import { workforceJobService } from "../../api-services/oilgas";
import { MapPin, Clock, DollarSign, Users, BookmarkPlus, Bookmark, Send, ArrowLeft, Building, Calendar } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";

export default function WorkforceJobDetail() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);

  // Apply form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [resume, setResume] = useState(null);
  const isApply = pathname.endsWith("/apply");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await workforceJobService.getById(id);
        if (isMounted) setJob(res?.data || res);
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li><Link to={webRoutes.platformDashboard} className="text-gray-500 hover:text-gray-700">Dashboard</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><Link to={webRoutes.workforceJobs} className="text-gray-500 hover:text-gray-700">Jobs</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><span className="text-gray-900">Job #{id}</span></li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to={webRoutes.workforceJobs} 
                className="inline-flex items-center px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border rounded-xl p-6">
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
                      {job?.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                      )}
                      {job?.job_type && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.job_type}
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
                      } catch (e) {}
                    }}
                    className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm transition-colors ${
                      saved ? 'border-blue-300 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    {saved ? <Bookmark className="h-4 w-4 mr-2" /> : <BookmarkPlus className="h-4 w-4 mr-2" />}
                    {saved ? "Saved" : "Save Job"}
                  </button>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
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
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Experience</div>
                        <div className="font-medium">{job.experience_level}</div>
                      </div>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
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
            <div className="space-y-6">
              <div className="bg-white border rounded-xl p-6">
                <div className="space-y-4">
                  <button
                    onClick={() => setShowApplicationModal(true)}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Apply for this job
                  </button>
                  
                  <div className="text-center text-sm text-gray-500">
                    Application typically takes 2-3 minutes
                  </div>
                </div>
              </div>

              {/* Company Info */}
              {job?.company_name && (
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">About {job.company_name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {job.company_description && (
                      <p>{job.company_description}</p>
                    )}
                    {job.company_size && (
                      <div>Company size: {job.company_size}</div>
                    )}
                    {job.industry && (
                      <div>Industry: {job.industry}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Similar Jobs */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Similar Jobs</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium text-sm text-gray-900">Senior Engineer Position</div>
                      <div className="text-xs text-gray-500">Company Name • $120k-150k</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title="Apply for this position"
        size="lg"
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
              
              await workforceJobService.applyToJob(id, formData);
              setFullName("");
              setEmail("");
              setCoverLetter("");
              setResume(null);
              setShowApplicationModal(false);
              toast.success("Application submitted successfully!");
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
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">
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
              onClick={() => setShowApplicationModal(false)}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}