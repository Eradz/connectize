import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Building, 
  Tag,
  Plus,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import { getCompanyByIdOrEmail } from '../../api-services/companies';
import { StepContent, StepIndicator } from '../../components/workforce/WorkforceSteps';
const WorkforceJobCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [userCompanies, setUserCompanies] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    description: '',
    employment_type: 'full_time',
    experience_level: 'mid',
    location: '',
    qualifications: [], // Fixed: should be array
    responsibilities: '',
    skills_required: [], // Fixed field name to match usage
    benefits: [], // Fixed: should be array
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
    { value: 'entry_level', label: 'Entry Level (0-2 years)' },
    { value: 'mid_level', label: 'Mid Level (3-5 years)' },
    { value: 'senior_level', label: 'Senior Level (6-10 years)' },
    { value: 'executive', label: 'Executive (10+ years)' }
  ];

  const departments = [
    'Exploration & Production',
    'Drilling Operations',
    'Reservoir Engineering',
    'Production Engineering',
    'Health, Safety & Environment',
    'Project Management',
    'Geology & Geophysics',
    'Facilities Engineering',
    'Operations & Maintenance',
    'Procurement & Supply Chain',
    'Finance & Accounting',
    'Human Resources',
    'Information Technology',
    'Legal & Compliance',
    'Business Development'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NOK'];

  // Fetch user companies on component mount
  useEffect(() => {
    const fetchUserCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await getCompanyByIdOrEmail();
        if (response && Array.isArray(response)) {
          setUserCompanies(response);
          // Auto-select first company if available
          if (response.length > 0) {
            setFormData(prev => ({ ...prev, company_id: response[0].id }));
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Failed to load your companies');
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchUserCompanies();
  }, []);

  const loadUserCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companies = await getCompanyByIdOrEmail();
      setUserCompanies(companies || []);
      
      // Auto-select first company if available
      if (companies && companies.length > 0) {
        setFormData(prev => ({
          ...prev,
          company_id: companies[0].id
        }));
      }
    } catch (error) {
      console.error('Failed to load user companies:', error);
      toast.error('Failed to load your companies');
      setUserCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleTextChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  }, []);

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills_required.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
    }));
  };

  const addQualification = () => {
    if (currentQualification.trim() && !formData.qualifications.includes(currentQualification.trim())) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, currentQualification.trim()]
      }));
      setCurrentQualification('');
    }
  };

  const removeQualification = (qualificationToRemove) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(qual => qual !== qualificationToRemove)
    }));
  };

  const addBenefit = () => {
    if (currentBenefit.trim() && !formData.benefits.includes(currentBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, currentBenefit.trim()]
      }));
      setCurrentBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error('Job title is required');
          return false;
        }
        if (!formData.description.trim()) {
          toast.error('Job description is required');
          return false;
        }
        if (!formData.company_id) {
          toast.error('Please select a company');
          return false;
        }
        if (!formData.location.trim()) {
          toast.error('Location is required');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.department) {
          toast.error('Please select a department');
          return false;
        }
        if (formData.skills_required.length === 0) {
          toast.error('Please add at least one required skill');
          return false;
        }
        return true;
      
      case 3:
        if (formData.salary_min && formData.salary_max) {
          if (parseFloat(formData.salary_min) >= parseFloat(formData.salary_max)) {
            toast.error('Maximum salary must be greater than minimum salary');
            return false;
          }
        }
        if (formData.application_deadline) {
          const deadline = new Date(formData.application_deadline);
          const today = new Date();
          if (deadline <= today) {
            toast.error('Application deadline must be in the future');
            return false;
          }
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (userCompanies.length === 0) {
      toast.error('You need to be associated with a company to post jobs');
      return;
    }

    if (!formData.company_id) {
      toast.error('Please select a company');
      return;
    }

    console.log('Submitting job with data:', {
      company_id: formData.company_id,
      userCompanies,
      selectedCompany: userCompanies.find(c => c.id === parseInt(formData.company_id))
    });

    setLoading(true);
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        company: parseInt(formData.company_id), // Ensure it's an integer
        job_type: formData.employment_type, // maps to backend job_type choices
        experience_level: formData.experience_level,
        location: formData.location,
        // skills_required: removed - not supported by current serializer
        is_remote: !!formData.remote_allowed,
        requires_relocation: !!formData.travel_required,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        currency: formData.currency,
        benefits_list: formData.benefits, // Send as array
        min_years_experience: undefined, // optional; not collected in this form
        education_requirements_list: formData.qualifications, // Send as array
        certifications_required: [],
        application_deadline: formData.application_deadline || null,
        max_applications: undefined,
        status: 'active'
        // Note: reports_to field removed as it's not part of JobPosting model
      };

      console.log('Job data being sent to API:', jobData);
      console.log('Job data stringified:', JSON.stringify(jobData, null, 2));

      const response = await workforceAPI.createJob(jobData);
      
      // Enhanced response debugging
      console.log('Job creation response:', response);
      console.log('Response type:', typeof response);
      console.log('Response data:', response?.data);
      console.log('Response data type:', typeof response?.data);
      
      // Only show success toast if we actually have a response
      if (response && (response.data || response.id)) {
        toast.success('Job posted successfully');
      }
      
      // Fix: Check response structure and handle different formats
      const jobId = response?.data?.id || response?.id || response?.data?.job_id;
      if (jobId) {
        navigate(webRoutes.workforceJobDetail.replace(':id', jobId));
      } else {
        console.warn('Job created but no ID returned in response:', {
          response,
          responseData: response?.data,
          keys: response ? Object.keys(response) : 'no response',
          dataKeys: response?.data ? Object.keys(response.data) : 'no response.data'
        });
        // Only navigate if we got some response
        if (response) {
          navigate(webRoutes.workforceJobs);
        }
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      const msg = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail || 'Failed to publish job.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate(webRoutes.workforceJobs)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
              <p className="text-gray-600 mt-1">Find the best oil & gas professionals for your team</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <StepIndicator currentStep={currentStep} />
          <StepContent employmentTypes={employmentTypes} currentStep={currentStep} formData={formData} handleTextChange={handleTextChange} loadingCompanies={loadingCompanies} userCompanies={userCompanies} experienceLevels={experienceLevels} departments={departments} currentSkill={currentSkill} setCurrentSkill={setCurrentSkill} addSkill={addSkill} removeSkill={removeSkill} currentQualification={currentQualification} setCurrentQualification={setCurrentQualification} addQualification={addQualification} handleCheckboxChange={handleCheckboxChange} currencies={currencies} currentBenefit={currentBenefit} setCurrentBenefit={setCurrentBenefit} addBenefit={addBenefit} removeBenefit={removeBenefit}  />

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 border rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-light_yellow/80 text-gray-400 cursor-not-allowed'
                  : 'bg-light_yellow text-gray-700 hover:bg-gold'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => navigate(webRoutes.workforceJobs)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={userCompanies.length === 0}
                  className="px-6 py-2 bg-gold rounded-lg font-medium hover:bg-gold/70 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {`Next >`}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || userCompanies.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
                  ) : userCompanies.length === 0 ? (
                    'No Company Selected'
                  ) : (
                    'Publish Job'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceJobCreate;
