import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Star,
  Plus,
  ArrowLeft,
  Save,
  Eye,
  Link as LinkIcon,
  Calendar
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import { toast } from 'sonner';
import SkillsManager from '../../components/workforce/SkillsManager';

const WorkforceProfileCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    professional_title: '',
    years_of_experience: '',
    hourly_rate: '',
    currency: 'USD',
    availability_status: 'available',
    preferred_employment_types: [],
    current_location: '',
    willing_to_relocate: false,
    willing_to_travel: false,
    travel_percentage: '',
    preferred_work_environments: [],
    shift_preferences: [],
    summary: '',
    achievements: '',
    portfolio_url: '',
    linkedin_url: ''
  });

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'not_available', label: 'Not Available' },
    { value: 'open_to_offers', label: 'Open to Offers' }
  ];

  const employmentTypes = [
    'full_time', 'part_time', 'contract', 'freelance', 'consulting', 'project_based'
  ];

  const workEnvironments = [
    'offshore', 'onshore', 'office', 'remote', 'field', 'laboratory'
  ];

  const shiftOptions = [
    'day_shift', 'night_shift', 'rotating', 'flexible', 'on_call'
  ];

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleArrayChange = useCallback((field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.professional_title || !formData.years_of_experience || !formData.current_location) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await workforceAPI.createWorkforceProfile(formData);
      toast.success('Professional profile created successfully!');
      
      // Navigate to the created profile or profiles list
      if (response.data?.id) {
        navigate(webRoutes.workforceProfileDetail.replace(':id', response.data.id));
      } else {
        navigate(webRoutes.workforceProfiles);
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to create profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex flex-col md:flex-row md:items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.workforceProfiles)}
                className="inline-flex items-center px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Professionals
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Professional Profile</h1>
                <p className="text-gray-600 mt-1">Showcase your expertise and connect with opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-0 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Title *
                </label>
                <input
                  type="text"
                  value={formData.professional_title}
                  onChange={(e) => handleInputChange('professional_title', e.target.value)}
                  placeholder="e.g., Senior Petroleum Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  value={formData.years_of_experience}
                  onChange={(e) => handleInputChange('years_of_experience', e.target.value)}
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location *
                </label>
                <input
                  type="text"
                  value={formData.current_location}
                  onChange={(e) => handleInputChange('current_location', e.target.value)}
                  placeholder="e.g., Houston, Texas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status
                </label>
                <select
                  value={formData.availability_status}
                  onChange={(e) => handleInputChange('availability_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availabilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (USD)
                </label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 150.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Percentage
                </label>
                <input
                  type="number"
                  value={formData.travel_percentage}
                  onChange={(e) => handleInputChange('travel_percentage', e.target.value)}
                  min="0"
                  max="100"
                  placeholder="e.g., 25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="willing_to_relocate"
                  checked={formData.willing_to_relocate}
                  onChange={(e) => handleInputChange('willing_to_relocate', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="willing_to_relocate" className="ml-2 text-sm text-gray-700">
                  Willing to relocate
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="willing_to_travel"
                  checked={formData.willing_to_travel}
                  onChange={(e) => handleInputChange('willing_to_travel', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="willing_to_travel" className="ml-2 text-sm text-gray-700">
                  Willing to travel
                </label>
              </div>
            </div>
          </div>

          {/* Employment Preferences */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Employment Preferences
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Employment Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {employmentTypes.map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`employment_${type}`}
                        checked={formData.preferred_employment_types.includes(type)}
                        onChange={(e) => handleArrayChange('preferred_employment_types', type, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`employment_${type}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {type.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Work Environments
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {workEnvironments.map(env => (
                    <div key={env} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`env_${env}`}
                        checked={formData.preferred_work_environments.includes(env)}
                        onChange={(e) => handleArrayChange('preferred_work_environments', env, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`env_${env}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {env}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Shift Preferences
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {shiftOptions.map(shift => (
                    <div key={shift} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`shift_${shift}`}
                        checked={formData.shift_preferences.includes(shift)}
                        onChange={(e) => handleArrayChange('shift_preferences', shift, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`shift_${shift}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {shift.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Professional Summary
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Describe your professional background, expertise, and what makes you unique..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Achievements
                </label>
                <textarea
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  placeholder="List your major accomplishments, awards, certifications..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                    placeholder="https://your-portfolio.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Information */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">Skills & Expertise</h3>
                <p className="text-blue-700 text-sm mb-2">
                  After creating your profile, you'll be able to add your professional skills, certifications, and expertise areas. This helps potential employers find you based on your specific capabilities.
                </p>
                <ul className="text-blue-600 text-sm list-disc list-inside space-y-1">
                  <li>Add technical and soft skills</li>
                  <li>Specify proficiency levels</li>
                  <li>Include certifications and experience years</li>
                  <li>Get skill endorsements from colleagues</li>
                </ul>
              </div>
            </div>
          </div> */}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(webRoutes.workforceProfiles)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gold/80 text-white rounded-lg hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkforceProfileCreate;
