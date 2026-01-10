import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'; // X imported here
import { toast } from 'sonner';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import { getCompanyByIdOrEmail } from '../../api-services/companies';
import { StepContent, StepIndicator } from '../../components/workforce/WorkforceSteps';

const WorkforceJobCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id : updateId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [userCompanies, setUserCompanies] = useState([]);
  const currentPath = location.pathname;
  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    description: '',
    employment_type: 'full_time',
    experience_level: 'mid',
    location: '',
    education_requirements_list: [],
    responsibilities: '',
    required_skills_list: [],
    benefits_list: [],
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    application_deadline: '',
    remote_allowed: false,
    travel_required: false
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentQualification, setCurrentQualification] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState('');
  const employmentTypes = [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'internship', label: 'Internship' },
    { value: 'consultant', label: 'Consultant' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6-10 years)' },
    { value: 'executive', label: 'Executive (10+ years)' }
  ];

  const departments = [
    'Exploration & Production', 'Drilling Operations', 'Reservoir Engineering',
    'Production Engineering', 'Health, Safety & Environment', 'Project Management',
    'Geology & Geophysics', 'Facilities Engineering', 'Operations & Maintenance',
    'Procurement & Supply Chain', 'Finance & Accounting', 'Human Resources',
    'Information Technology', 'Legal & Compliance', 'Business Development'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NOK'];

  // Fetch companies on mount
  useEffect(() => {
    const fetchUserCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await getCompanyByIdOrEmail();
        if (response && Array.isArray(response)) {
          setUserCompanies(response);
          if (response.length > 0) {
            setFormData(prev => ({ ...prev, company_id: response[0].id }));
          }
        }
      } catch (error) {
        toast.error('Failed to load your companies');
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchUserCompanies();
  }, []);

  const handleTextChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  }, []);

 const addSkill = () => {
  const trimmedSkill = currentSkill.trim();
  if (!trimmedSkill) return;

  setFormData(prev => {
    // Ensure required_skills_list is always an array
    const currentSkills = Array.isArray(prev.required_skills_list) ? prev.required_skills_list : [];

    // Avoid duplicates
    if (currentSkills.includes(trimmedSkill)) {
      return prev; // no change needed
    }

    return {
      ...prev,
      required_skills_list: [...currentSkills, trimmedSkill]
    };
  });

  setCurrentSkill('');
};

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      required_skills_list: prev.required_skills_list.filter(s => s !== skill)
    }));
  };

  const addQualification = () => {
const qualification = currentQualification.trim();

const qualificationArray = Array.isArray(formData.education_requirements_list) ? formData.education_requirements_list : [];

if (qualification && !qualificationArray.includes(qualification)) {
  setFormData(prev => ({
    ...prev,
    education_requirements_list: [...qualificationArray, qualification]
  }));
  setCurrentQualification('');
}
return toast.info('Qualification already added!');
};

  const removeQualification = (q) => {
    setFormData(prev => ({
      ...prev,
      education_requirements_list: prev.education_requirements_list.filter(item => item !== q)
    }));
  };

  const addBenefit = () => {
    if (currentBenefit.trim() && !formData.benefits_list.includes(currentBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits_list: [...prev.benefits_list, currentBenefit.trim()]
      }));
      setCurrentBenefit('');
    }
  };

  const removeBenefit = (b) => {
    setFormData(prev => ({
      ...prev,
      benefits_list: prev.benefits_list.filter(item => item !== b)
    }));
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.title.trim()) return toast.error('Job title is required'), false;
      if (!formData.description.trim()) return toast.error('Job description is required'), false;
      if (!formData.company_id) return toast.error('Please select a company'), false;
      if (!formData.location.trim()) return toast.error('Location is required'), false;
    }
const skills = Array.isArray(formData.required_skills_list) ? formData.required_skills_list : [];
    if (step === 2 && skills.length === 0)
      return toast.error('Add at least one required skill'), false;
    return true;
  };

  const nextStep = () => validateStep(currentStep) && setCurrentStep(s => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!formData.company_id) return toast.error('Please select a company');
    setLoading(true);
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        company: parseInt(formData.company_id),
        job_type: formData.employment_type,
        experience_level: formData.experience_level,
        location: formData.location,
        is_remote: !!formData.remote_allowed,
        requires_relocation: !!formData.travel_required,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        currency: formData.currency,
        benefits_list: formData.benefits_list,
        education_requirements_list: formData.education_requirements_list,
        application_deadline: formData.application_deadline || null,
        status: 'active'
      };

      const response = currentPath.includes("update") ? await workforceAPI.updateJob(updateId, jobData) : await workforceAPI.createJob(jobData);
      const jobId = response?.data?.id || response?.id;

      toast.success('Job posted successfully!');
      navigate(jobId ? webRoutes.workforceJobDetail.replace(':id', jobId) : webRoutes.workforceJobs);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to publish job';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

if(currentPath.includes("update")) {
  // If we're in update mode, fetch the job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const response = await workforceAPI.getJob(updateId);
        setFormData(response.data);
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to fetch job details';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [updateId]);
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate(webRoutes.workforceJobs)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{`${ currentPath.includes("update") ? 'Update Job' : 'Publish a Job'}`}</h1>
              <p className="text-gray-600 mt-1">Find the best oil & gas professionals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
          <StepIndicator currentStep={currentStep} />

          <StepContent
            employmentTypes={employmentTypes}
            currentStep={currentStep}
            formData={formData}
            handleTextChange={handleTextChange}
            loadingCompanies={loadingCompanies}
            userCompanies={userCompanies}
            experienceLevels={experienceLevels}
            departments={departments}
            currentSkill={currentSkill}
            setCurrentSkill={setCurrentSkill}
            addSkill={addSkill}
            removeSkill={removeSkill}
            currentQualification={currentQualification}
            setCurrentQualification={setCurrentQualification}
            addQualification={addQualification}
            removeQualification={removeQualification}
            handleCheckboxChange={handleCheckboxChange}
            currencies={currencies}
            currentBenefit={currentBenefit}
            setCurrentBenefit={setCurrentBenefit}
            addBenefit={addBenefit}
            removeBenefit={removeBenefit}
          />

          {/* ----------------- BUTTON FOOTER (Refactored) ----------------- */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center">
    
                    {/* ----------------- MOBILE BUTTONS (Default view, hidden on large screens) ----------------- */}
                    <div className="flex justify-between w-full lg:hidden">
                        
                        {/* LEFT: Previous/Cancel (Mobile) */}
                        {currentStep === 1 ? (
                            // Cancel Button on Step 1 (Mobile)
                            <button
                                onClick={() => navigate(webRoutes.workforceJobs)} // Corrected route
                                className="flex items-center px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex-1 mr-2"
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </button>
                        ) : (
                            // Previous Button (Mobile)
                            <button
                                onClick={prevStep}
                                className="flex items-center px-8 py-3 rounded-lg font-medium transition-colors flex-1 mr-2"
                                style={{ 
                                    backgroundColor: '#FFEF9A', 
                                    color: '#000000'
                                }}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                            </button>
                        )}

                        {/* RIGHT: Next/Publish (Mobile) */}
                        {currentStep < 4 ? (
                            <button
                                onClick={nextStep}
                                disabled={userCompanies.length === 0}
                                className="flex items-center px-8 py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-all flex-1"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || userCompanies.length === 0}
                                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-70 flex-1 justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {currentPath.includes("update") ? 'Updating...' : 'Publishing...'}
                                    </>
                                ) : (
                                     currentPath.includes("update") ? 'Update Job' : 'Publish Job'
                                )}
                            </button>
                        )}

                    </div>


                    {/* ----------------- DESKTOP BUTTONS (Hidden on default, visible on large screens) ----------------- */}
                    <div className="hidden lg:flex justify-between w-full">

                        {/* LEFT: Previous (Desktop) */}
                        <div className="flex items-center">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="flex items-center px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ 
                                    backgroundColor: '#FFEF9A', 
                                    color: '#000000'
                                }}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                            </button>
                        </div>


                        {/* RIGHT: Cancel + Next/Publish (Desktop) */}
                        <div className="flex items-center gap-4">
                            
                            {/* Cancel Button (Desktop) */}
                            <button
                                onClick={() => navigate(webRoutes.workforceJobs)} // Corrected route
                                className="flex items-center px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </button>
                            
                            {currentStep < 4 ? (
                                <button
                                    onClick={nextStep}
                                    disabled={userCompanies.length === 0}
                                    className="flex items-center px-8 py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-all"
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || userCompanies.length === 0}
                                    className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-70 justify-center min-w-[160px]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {!currentPath.includes("update")  ? 'Updating...' : 'Publishing...'}
                                        </>
                                    ) : (
                                         currentPath.includes("update") ? 'Update Job' : 'Publish Job'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceJobCreate;