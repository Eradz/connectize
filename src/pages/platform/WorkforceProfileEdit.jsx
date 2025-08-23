import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Briefcase, MapPin, DollarSign, Clock, Globe } from 'lucide-react';
import { workforceAPI } from '../../api-services/workforce';
import { toast } from 'sonner';
import { webRoutes } from '../../lib/webRoutes';
import { useAuth } from '../../context/userContext';
import SkillsManager from '../../components/workforce/SkillsManager';

const WorkforceProfileEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
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
    travel_percentage: 0,
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
    { value: 'not_available', label: 'Not Available' }
  ];

  const employmentTypeOptions = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'consulting', label: 'Consulting' }
  ];

  const workEnvironmentOptions = [
    { value: 'office', label: 'Office' },
    { value: 'remote', label: 'Remote' },
    { value: 'field', label: 'Field' },
    { value: 'offshore', label: 'Offshore' }
  ];

  const shiftOptions = [
    { value: 'day', label: 'Day Shift' },
    { value: 'night', label: 'Night Shift' },
    { value: 'rotating', label: 'Rotating Shifts' }
  ];

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getProfile(id);
      const profileData = response.data;
      
      // Check if user owns this profile
      if (!user || profileData.user !== user.id) {
        toast.error('You can only edit your own profile');
        navigate(webRoutes.workforceProfiles);
        return;
      }

      setProfile(profileData);
      setFormData({
        professional_title: profileData.professional_title || '',
        years_of_experience: profileData.years_of_experience || '',
        hourly_rate: profileData.hourly_rate || '',
        currency: profileData.currency || 'USD',
        availability_status: profileData.availability_status || 'available',
        preferred_employment_types: profileData.preferred_employment_types || [],
        current_location: profileData.current_location || '',
        willing_to_relocate: profileData.willing_to_relocate || false,
        willing_to_travel: profileData.willing_to_travel || false,
        travel_percentage: profileData.travel_percentage || 0,
        preferred_work_environments: profileData.preferred_work_environments || [],
        shift_preferences: profileData.shift_preferences || [],
        summary: profileData.summary || '',
        achievements: profileData.achievements || '',
        portfolio_url: profileData.portfolio_url || '',
        linkedin_url: profileData.linkedin_url || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
      navigate(webRoutes.workforceProfiles);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const currentValues = prev[name] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.professional_title || !formData.years_of_experience || !formData.current_location || !formData.summary) {
        toast.error('Please fill in all required fields: Professional Title, Years of Experience, Current Location, and Professional Summary');
        return;
      }

      await workforceAPI.updateProfile(id, formData);
      toast.success('Profile updated successfully!');
      navigate(webRoutes.workforceProfileDetail.replace(':id', id));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="bg-white border rounded-xl p-6">
            <div className="h-6 w-1/2 bg-gray-200 rounded mb-3 animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(webRoutes.workforceProfileDetail.replace(':id', id))}
            className="inline-flex items-center px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Edit Professional Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    name="professional_title"
                    value={formData.professional_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Senior Petroleum Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Location *
                  </label>
                  <input
                    type="text"
                    name="current_location"
                    value={formData.current_location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Houston, TX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status
                  </label>
                  <select
                    name="availability_status"
                    value={formData.availability_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availabilityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Compensation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Employment Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Employment Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Employment Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {employmentTypeOptions.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferred_employment_types.includes(option.value)}
                          onChange={() => handleMultiSelect('preferred_employment_types', option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Work Environments
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {workEnvironmentOptions.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferred_work_environments.includes(option.value)}
                          onChange={() => handleMultiSelect('preferred_work_environments', option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Preferences
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {shiftOptions.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.shift_preferences.includes(option.value)}
                          onChange={() => handleMultiSelect('shift_preferences', option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="willing_to_relocate"
                      checked={formData.willing_to_relocate}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Willing to Relocate</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="willing_to_travel"
                      checked={formData.willing_to_travel}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Willing to Travel</span>
                  </label>

                  {formData.willing_to_travel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Travel Percentage
                      </label>
                      <input
                        type="number"
                        name="travel_percentage"
                        value={formData.travel_percentage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        placeholder="0-100%"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Professional Summary
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Summary *
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your professional background, expertise, and what makes you unique..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Achievements
                  </label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List your major accomplishments, awards, or notable projects..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      name="portfolio_url"
                      value={formData.portfolio_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Management */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6">
                <SkillsManager 
                  profileId={id}
                  initialSkills={profile?.user_skills || []}
                  onSkillsUpdate={(updatedSkills) => {
                    setProfile(prev => ({ ...prev, user_skills: updatedSkills }));
                  }}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(webRoutes.workforceProfileDetail.replace(':id', id))}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkforceProfileEdit;
