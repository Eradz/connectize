import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { workforceAPI } from '../../api-services/workforce';

const ApplicationActionModal = ({ isOpen, onClose, application, onUpdate, onDelete, isEditing, setIsEditing }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cover_letter: '',
    portfolio_link: '',
    additional_info: '',
  });

  // Reset form data when application changes or modal opens
  useEffect(() => {
    if (isOpen && application) {
      setFormData({
        cover_letter: application?.cover_letter || '',
        portfolio_link: application?.portfolio_link || '',
        additional_info: application?.additional_info || '',
      });
      setShowDeleteConfirm(false);
    }
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.updateJobApplication(application.id, formData);
      toast.success('Application updated successfully');
      setIsEditing(false);
      onUpdate?.();
      // Close modal after successful update
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to update application:', error);
      toast.error(error?.response?.data?.detail || 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async () => {
    try {
      setLoading(true);
      await workforceAPI.deleteJobApplication(application.id);
      toast.success('Application deleted successfully');
      setShowDeleteConfirm(false);
      onDelete?.();
      // Close modal after successful delete
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to delete application:', error);
      toast.error(error?.response?.data?.detail || 'Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Application' : 'Application Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Application Overview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Job Title</p>
                <p className="text-gray-900 font-semibold">{application.job_title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Company</p>
                <p className="text-gray-900 font-semibold">{application.job_company}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Applied Date</p>
                <p className="text-gray-900">{new Date(application.submitted_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-4">
              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={formData.cover_letter}
                  onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                  placeholder="Enter your cover letter"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Portfolio Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Link
                </label>
                <input
                  type="url"
                  value={formData.portfolio_link}
                  onChange={(e) => handleInputChange('portfolio_link', e.target.value)}
                  placeholder="https://example.com/portfolio"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Additional Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.additional_info}
                  onChange={(e) => handleInputChange('additional_info', e.target.value)}
                  placeholder="Any additional information you'd like to add"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Display Cover Letter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-h-48 overflow-y-auto">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {formData.cover_letter || 'No cover letter provided'}
                  </p>
                </div>
              </div>

              {/* Display Portfolio Link */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Portfolio Link</p>
                {formData.portfolio_link ? (
                  <a
                    href={formData.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {formData.portfolio_link}
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">No portfolio link provided</p>
                )}
              </div>

              {/* Display Additional Info */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Additional Information</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-h-40 overflow-y-auto">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {formData.additional_info || 'No additional information provided'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Are you sure you want to delete this application?
                </p>
                <p className="text-xs text-red-700 mt-1">
                  This action cannot be undone. You will need to reapply for this position.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 gap-3">
          {/* Delete Button - Left Side */}
          {!showDeleteConfirm && !isEditing && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Application
            </button>
          )}

          {/* Delete Confirmation Buttons */}
          {showDeleteConfirm && (
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-400 bg-white text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleDeleteApplication}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}

          {/* Right Side Action Buttons */}
          {!showDeleteConfirm && (
            <div className="flex gap-3 ml-auto">
              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    // Reset form data to original values
                    setFormData({
                      cover_letter: application?.cover_letter || '',
                      portfolio_link: application?.portfolio_link || '',
                      additional_info: application?.additional_info || '',
                    });
                  } else {
                    onClose();
                  }
                }}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                } disabled:opacity-50`}
              >
                {isEditing ? 'Cancel Edit' : 'Close'}
              </button>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Edit Application
                </button>
              )}

              {isEditing && (
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get status color
function getStatusColor(status) {
  switch (status) {
    case 'submitted':
      return 'bg-green-200 text-green-900';
    case 'under_review':
      return 'bg-blue-100 text-blue-800';
    case 'shortlisted':
      return 'bg-cyan-100 text-cyan-800';
    case 'interview_scheduled':
      return 'bg-purple-100 text-purple-800';
    case 'offer_made':
      return 'bg-green-100 text-green-800';
    case 'hired':
      return 'bg-gradient-to-br from-[#FFC000] to-[#FF8400] text-transparent bg-clip-text';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'withdrawn':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default ApplicationActionModal;
