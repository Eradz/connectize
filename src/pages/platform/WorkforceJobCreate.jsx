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

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step < currentStep ? 'bg-green-600 border-green-600 text-white' :
              step === currentStep ? 'border-green-600 text-green-600' :
              'border-gray-300 text-gray-300'
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-0.5 ml-4 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Job Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Senior Drilling Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  {loadingCompanies ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                      Loading companies...
                    </div>
                  ) : userCompanies.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600">
                      No companies found. You need to be associated with a company to post jobs.
                    </div>
                  ) : (
                    <select
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Company</option>
                      {userCompanies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  )}
                  {userCompanies.length === 0 && !loadingCompanies && (
                    <p className="text-sm text-gray-500 mt-1">
                      Contact your administrator to be added to a company.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Houston, TX or Remote"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type
                    </label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {employmentTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleTextChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Qualifications</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills *
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add a required skill (e.g., Drilling Operations)"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_required.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentQualification}
                      onChange={(e) => setCurrentQualification(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add a qualification (e.g., Bachelor's in Petroleum Engineering)"
                    />
                    <button
                      type="button"
                      onClick={addQualification}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.qualifications.map((qual) => (
                      <span
                        key={qual}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {qual}
                        <button
                          type="button"
                          onClick={() => removeQualification(qual)}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remote_allowed"
                      name="remote_allowed"
                      checked={formData.remote_allowed}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="remote_allowed" className="ml-2 text-sm font-medium text-gray-700">
                      Remote work allowed
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="travel_required"
                      name="travel_required"
                      checked={formData.travel_required}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="travel_required" className="ml-2 text-sm font-medium text-gray-700">
                      Travel required
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="security_clearance_required"
                      name="security_clearance_required"
                      checked={formData.security_clearance_required}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="security_clearance_required" className="ml-2 text-sm font-medium text-gray-700">
                      Security clearance required
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compensation & Benefits</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="number"
                        name="salary_min"
                        value={formData.salary_min}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Minimum"
                        min="0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="salary_max"
                        value={formData.salary_max}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Maximum"
                        min="0"
                      />
                    </div>
                    <div>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {currencies.map((currency) => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentBenefit}
                      onChange={(e) => setCurrentBenefit(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add a benefit (e.g., Health Insurance, 401k)"
                    />
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit)}
                          className="ml-2 hover:text-purple-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="hr@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Instructions
                  </label>
                  <textarea
                    name="application_instructions"
                    value={formData.application_instructions}
                    onChange={handleTextChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Provide specific instructions for how candidates should apply..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Publish</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Job Title:</span>
                    <p className="text-gray-900">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Company:</span>
                    <p className="text-gray-900">
                      {userCompanies.find(c => c.id === formData.company_id)?.company_name || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Location:</span>
                    <p className="text-gray-900">{formData.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Employment Type:</span>
                    <p className="text-gray-900 capitalize">{formData.employment_type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Department:</span>
                    <p className="text-gray-900">{formData.department}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Experience Level:</span>
                    <p className="text-gray-900 capitalize">{formData.experience_level?.replace('_', ' ')}</p>
                  </div>
                  {(formData.salary_min || formData.salary_max) && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Salary Range:</span>
                      <p className="text-gray-900">
                        {formData.currency} {formData.salary_min ? parseFloat(formData.salary_min).toLocaleString() : 'Not specified'} - {formData.salary_max ? parseFloat(formData.salary_max).toLocaleString() : 'Not specified'}
                      </p>
                    </div>
                  )}
                  {formData.application_deadline && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Application Deadline:</span>
                      <p className="text-gray-900">{new Date(formData.application_deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {formData.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-gray-900 mt-1">{formData.description}</p>
                  </div>
                )}

                {formData.skills_required.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Required Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.skills_required.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.qualifications.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Qualifications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.qualifications.map((qual) => (
                        <span
                          key={qual}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.benefits.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Benefits:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm">
                  {formData.remote_allowed && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Remote Allowed
                    </span>
                  )}
                  {formData.travel_required && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Travel Required
                    </span>
                  )}
                  {formData.security_clearance_required && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Security Clearance Required
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Ready to Publish</h4>
                    <p className="text-sm text-green-700">
                      Your job posting will be published and visible to all professionals on the platform.
                      You can edit or unpublish it anytime from your job management dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
          <StepIndicator />
          <StepContent />

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 border rounded-lg font-medium ${
                currentStep === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
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
