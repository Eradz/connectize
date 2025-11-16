import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {StepIndicator, StepContent} from "./DealRoomSteps"

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
          <StepIndicator currentStep={currentStep} />
          <StepContent currentStep={currentStep} formData={formData} handleInputChange={handleInputChange} dealTypes={dealTypes} currencies={currencies} currentTag={currentTag} addTag={addTag} currentParticipant={currentParticipant} setCurrentParticipant={setCurrentParticipant} participantRoles={participantRoles} addParticipant={addParticipant} removeParticipant={removeParticipant} />

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
