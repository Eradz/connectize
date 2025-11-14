import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft,  
  FileText, 
  Lock, 
  AlertCircle,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { webRoutes } from '../../lib/webRoutes';
import { dealRoomAPI } from '../../api-services/dealRoom';

const DealRoomCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deal_type: '',
    estimated_value: '',
    currency: 'USD',
    target_close_date: '',
    is_confidential: false,
    requires_nda: false,
    location: '',
    tags: [],
    participants: [],
    documents: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentParticipant, setCurrentParticipant] = useState({ email: '', role: 'viewer' });

  const dealTypes = [
    { value: 'acquisition', label: 'Asset Acquisition', description: 'Purchase of oil & gas assets' },
    { value: 'joint_venture', label: 'Joint Venture', description: 'Partnership for exploration or development' },
    { value: 'service_contract', label: 'Service Contract', description: 'Drilling, construction, or technical services' },
    { value: 'equipment_lease', label: 'Equipment Lease', description: 'Leasing of drilling or production equipment' },
    { value: 'exploration_rights', label: 'Exploration Rights', description: 'Licensing of exploration blocks' },
    { value: 'production_sharing', label: 'Production Sharing', description: 'Revenue sharing agreements' },
    { value: 'farm_out', label: 'Farm-Out Agreement', description: 'Transfer of working interest' }
  ];

  const participantRoles = [
    { value: 'admin', label: 'Administrator', description: 'Full access and management rights' },
    { value: 'editor', label: 'Editor', description: 'Can view and edit documents' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access to documents' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NOK'];

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addParticipant = () => {
    if (currentParticipant.email.trim()) {
      const emailExists = formData.participants.some(p => p.email === currentParticipant.email);
      if (!emailExists) {
        setFormData(prev => ({
          ...prev,
          participants: [...prev.participants, { ...currentParticipant }]
        }));
        setCurrentParticipant({ email: '', role: 'viewer' });
      } else {
        toast.error('Participant already added');
      }
    }
  };

  const removeParticipant = (emailToRemove) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.email !== emailToRemove)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error('Deal room title is required');
          return false;
        }
        if (!formData.description.trim()) {
          toast.error('Description is required');
          return false;
        }
        if (!formData.deal_type) {
          toast.error('Please select a deal type');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.estimated_value || parseFloat(formData.estimated_value) <= 0) {
          toast.error('Please enter a valid estimated value');
          return false;
        }
        if (!formData.target_close_date) {
          toast.error('Target close date is required');
          return false;
        }
        const closeDate = new Date(formData.target_close_date);
        const today = new Date();
        if (closeDate <= today) {
          toast.error('Target close date must be in the future');
          return false;
        }
        return true;
      
      case 3:
        return true; // Optional step
      
      case 4:
        return true; // Review step
      
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
    // Only allowed on step 4 via UI; keep simple
    setLoading(true);
    try {
      // Align payload with backend DealRoomSerializer
      const payload = {
        title: formData.title,
        description: formData.description,
        deal_type: formData.deal_type,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        currency: formData.currency,
        target_close_date: formData.target_close_date || null,
        is_confidential: !!formData.is_confidential,
        requires_nda: !!formData.requires_nda,
        location: formData.location || '',
        tags: formData.tags || []
      };

      const response = await dealRoomAPI.createDealRoom(payload);

      // Inform about participants since backend expects user IDs, not emails
      if (formData.participants?.length) {
        toast.info('Deal room created. Add participants by user from the Participants tab.');
      } else {
        toast.success('Deal room created successfully');
      }

      navigate(webRoutes.dealRoomDetail.replace(':id', response.data.id));
    } catch (error) {
      console.error('Error creating deal room:', error);
      const msg = error.response?.data?.message || error.response?.data?.detail || 'Failed to create deal room.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step < currentStep ? 'bg-pale_yellow border-pale_yellow text-white' :
              step === currentStep ? 'border-pale_yellow text-black bg-pale_yellow' :
              'border-gray-300 text-black'
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 4 && (
              <div className={`w-20 h-0.5 ${
                step < currentStep ? 'bg-pale_yellow' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="flex gap-5">
                <div className='flex flex-col gap-5 w-[40%]'>
                <div>
                  <label htmlFor='DealRoomTitle' className="block text-[16px] font-medium text-gray-700 mb-2">
                    Deal Room Title *
                  </label>
                  <input
                    type="text"
                    name='DealRoomTitle'
                    id='DealRoomTitle'
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., North Sea Asset Acquisition"
                  />
                </div>

                    <div>
                      <label htmlfor='DealRoomDescription' className="block text-[16px] font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        id='DealRoomDescription'
                        name='DealRoomDescription'
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Provide a detailed description of the deal..."
                      />
                    </div>

                    <div>
                      <label htmlFor='DealRoomLocation' className="block text-[16px] font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        name='DealRoomLocation'
                        id='DealRoomLocation'
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., North Sea, Gulf of Mexico, West Africa"
                      />
                    </div>
                </div>
                <div className='w-[60%]'>
                  <span className="block text-[16px] font-medium text-gray-700 mb-2">
                    Deal Type *
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dealTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() => handleInputChange('deal_type', type.value)}
                        className={`px-2 py-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.deal_type === type.value
                            ? 'border-pale_yellow  bg-gradient-to-br to-[#FFC000] from-[#FF8400] '
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
                

              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Value *
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_value}
                      onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Close Date *
                  </label>
                  <input
                    type="date"
                    value={formData.target_close_date}
                    onChange={(e) => handleInputChange('target_close_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add tags (e.g., offshore, drilling, upstream)"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-pale_yellow text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-pale_yellow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Access</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Confidential</span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_confidential}
                          onChange={(e) => handleInputChange('is_confidential', e.target.checked)}
                          className="rounded border-gray-300 text-pale_yellow focus:ring-blue-500"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Mark as confidential to restrict access and require special permissions
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Require NDA</span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.requires_nda}
                          onChange={(e) => handleInputChange('requires_nda', e.target.checked)}
                          className="rounded border-gray-300 text-pale_yellow focus:ring-blue-500"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Require participants to sign an NDA before accessing documents
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Initial Participants</h4>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={currentParticipant.email}
                        onChange={(e) => setCurrentParticipant(prev => ({ ...prev, email: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="participant@company.com"
                      />
                      <select
                        value={currentParticipant.role}
                        onChange={(e) => setCurrentParticipant(prev => ({ ...prev, role: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {participantRoles.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addParticipant}
                        className="px-4 py-2 bg-pale_yellow text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {formData.participants.length > 0 && (
                      <div className="space-y-2">
                        {formData.participants.map((participant, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-900">{participant.email}</span>
                              <span className="ml-2 text-sm text-gray-600 capitalize">({participant.role})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeParticipant(participant.email)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Create</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Title:</span>
                    <p className="text-gray-900">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Deal Type:</span>
                    <p className="text-gray-900 capitalize">{formData.deal_type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Estimated Value:</span>
                    <p className="text-gray-900">{formData.currency} {parseFloat(formData.estimated_value || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Target Close Date:</span>
                    <p className="text-gray-900">{new Date(formData.target_close_date).toLocaleDateString()}</p>
                  </div>
                  {formData.location && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Location:</span>
                      <p className="text-gray-900">{formData.location}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-600">Security:</span>
                    <div className="flex space-x-2">
                      {formData.is_confidential && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Confidential
                        </span>
                      )}
                      {formData.requires_nda && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          NDA Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {formData.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-gray-900">{formData.description}</p>
                  </div>
                )}

                {formData.tags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.participants.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Initial Participants:</span>
                    <div className="mt-1 space-y-1">
                      {formData.participants.map((participant, index) => (
                        <div key={index} className="text-gray-900 text-sm">
                          {participant.email} <span className="text-gray-600 capitalize">({participant.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-pale_yellow mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Next Steps</h4>
                    <p className="text-sm text-blue-700">
                      After creating the deal room, you can upload documents, add more participants, 
                      set up milestones, and begin collaboration.
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="">
        <div className="max-w-4xl ">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate(webRoutes.dealRooms)}
              className=" bg-white mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Deal Room</h1>
              <p className="text-gray-600 mt-1">Set up a secure collaboration space for your deal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <StepIndicator />
          <StepContent />

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 bg-light_yellow border rounded-lg font-medium ${
                currentStep === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => navigate(webRoutes.dealRooms)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-gold text-white rounded-lg font-medium hover:bg-services_yellow"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-gold text-white rounded-lg font-medium hover:bg-pale_yellow disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Deal Room'
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


export default DealRoomCreate;
