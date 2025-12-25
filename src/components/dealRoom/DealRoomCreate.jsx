import React, { useState, useCallback } from 'react';
import { 
  ArrowLeft,  
  FileText, 
  Lock, 
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  DollarSign,
  Users,
  Tag
} from 'lucide-react';

// Mock external dependencies for the standalone demo
const toast = {
  error: (msg) => alert(`Error: ${msg}`),
  success: (msg) => alert(`Success: ${msg}`),
  info: (msg) => alert(`Info: ${msg}`)
};

const webRoutes = {
  dealRooms: '#',
  dealRoomDetail: '/deals/:id'
};

// Mock API
const dealRoomAPI = {
  createDealRoom: async (payload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { id: '123' } });
      }, 1000);
    });
  }
};

// --- Child Component: Step Indicator (FIXED VERSION) ---
const StepIndicator = ({ currentStep }) => {
  console.log("🟢 StepIndicator rendering - currentStep:", currentStep);
  
  const renderSteps = () => {
    const elements = [];
    
    for (let step = 1; step <= 4; step++) {
      // Add circle
      elements.push(
        <div 
          key={`circle-${step}`}
          className={`flex items-center justify-center rounded-full border font-medium ${
            step <= currentStep 
              ? 'bg-[#FAE9B4] border-[#FAE9B4] text-gray-900' 
              : 'border-gray-300 text-gray-900 bg-white'
          }`}
          style={{ 
            width: '48px', 
            height: '48px'
          }}
        >
          {step}
        </div>
      );
      
      // Add line (except after last step)
      if (step < 4) {
        elements.push(
          <div 
            key={`line-${step}`}
            style={{ 
              width: '64px', 
              height: '3px',
              backgroundColor: step < currentStep ? '#FAE9B4' : '#D1D5DB',
              display: 'block'
            }}
          />
        );
      }
    }
    
    return elements;
  };
  
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {renderSteps()}
      </div>
    </div>
  );
};

// --- Child Component: Step Content (Unchanged) ---
const StepContent = ({ 
  currentStep, 
  formData, 
  handleInputChange, 
  dealTypes, 
  currencies,
  currentTag,
  addTag,
  removeTag,
  currentParticipant,
  setCurrentParticipant,
  addParticipant,
  removeParticipant,
  participantRoles
}) => {
  
  // --- Step 1: Basic Information (Split Layout on Desktop) ---
  if (currentStep === 1) {
    return (
      <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        
        {/* Left Column: Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deal room title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="E.g North east Acquisition"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of the deal"
                rows={5}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all resize-none placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="E.g North east Acquisition"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Deal Type */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-gray-800">Deal type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dealTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleInputChange('deal_type', type.value)}
                className={`
                  text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-sm h-full flex flex-col justify-between
                  ${formData.deal_type === type.value 
                    ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400' 
                    : 'border-gray-200 bg-white hover:border-gray-300'}
                `}
              >
                <div className="font-semibold text-gray-900 mb-2">{type.label}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Step 2: Financials & Dates (Unchanged) ---
  if (currentStep === 2) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Financials Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={formData.estimated_value}
                onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Close Date</label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.target_close_date}
                onChange={(e) => handleInputChange('target_close_date', e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              />
            </div>
          </div>
          <div className='md:col-span-2'>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => addTag(e.target.value)}
              onKeyDown={(e) => {
                 if(e.key === 'Enter') {
                   // Logic handled in parent via addTag
                 }
              }}
              placeholder="Add a tag..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <button 
              onClick={() => addTag()}
              className="px-4 bg-gold text-white rounded-lg hover:bg-pale_yellow"
            >
              <Plus/>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span key={tag} className="bg-white px-3 py-1 rounded-full text-sm border border-gray-200 flex items-center shadow-sm">
                <Tag className="w-3 h-3 mr-2 text-yellow-500" />
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-2 text-gray-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {formData.tags.length === 0 && <p className="text-xs text-gray-500 italic">No tags added yet.</p>}
          </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 3: Participants & Tags (Unchanged) ---
  if (currentStep === 3) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Security & Access</h2>

        {/* Tags Section */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="md:col-span-2 space-y-3 pt-4">
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.is_confidential}
                onChange={(e) => handleInputChange('is_confidential', e.target.checked)}
                className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300"
              />
              <span className="ml-3 flex-1">
                <span className="block text-sm font-medium text-gray-900">Confidential</span>
                <span className="block text-xs text-gray-500">Mark as Confidential to restrict access and require And special permission</span>
              </span>
              <Lock className="w-4 h-4 text-gray-400" />
            </label>

             <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.requires_nda}
                onChange={(e) => handleInputChange('requires_nda', e.target.checked)}
                className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300"
              />
              <span className="ml-3 flex-1">
                <span className="block text-sm font-medium text-gray-900">Require NDA</span>
                <span className="block text-xs text-gray-500">Require participants to sign an NDA Accessing documents</span>
              </span>
              <FileText className="w-4 h-4 text-gray-400" />
            </label>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Invite Participants</label>
          <div className="flex flex-col md:flex-row gap-2 mb-3">
            <input
              type="email"
              value={currentParticipant.email}
              onChange={(e) => setCurrentParticipant(prev => ({...prev, email: e.target.value}))}
              placeholder="colleague@example.com"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <select
              value={currentParticipant.role}
              onChange={(e) => setCurrentParticipant(prev => ({...prev, role: e.target.value}))}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
            >
              {participantRoles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
            <button 
              onClick={addParticipant}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 whitespace-nowrap"
            >
              Invite
            </button>
          </div>
          
          <div className="space-y-2">
             {formData.participants.map(p => (
              <div key={p.email} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 text-yellow-700 font-bold text-xs">
                    {p.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{p.role}</div>
                  </div>
                </div>
                <button onClick={() => removeParticipant(p.email)} className="text-gray-400 hover:text-red-500 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
             {formData.participants.length === 0 && <p className="text-xs text-gray-500 italic">No participants added yet.</p>}
          </div>
        </div>
      </div>
    );
  }

  // --- Step 4: Review (Unchanged) ---
  if (currentStep === 4) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ready to Launch</h2>
          <p className="text-gray-500">Review your deal room details before creating</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 block mb-1">Title</span>
              <span className="font-medium text-gray-900">{formData.title}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Type</span>
              <span className="font-medium text-gray-900 capitalize">{formData.deal_type?.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Est. Value</span>
              <span className="font-medium text-gray-900">{formData.currency} {formData.estimated_value}</span>
            </div>
             <div>
              <span className="text-gray-500 block mb-1">Target Date</span>
              <span className="font-medium text-gray-900">{formData.target_close_date}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
             <span className="text-gray-500 block mb-2">Description</span>
             <p className="text-gray-800 leading-relaxed">{formData.description}</p>
          </div>

          <div className="pt-4 border-t border-gray-200 flex gap-4">
            {formData.is_confidential && (
              <span className="flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs font-medium">
                <Lock className="w-3 h-3 mr-1" /> Confidential
              </span>
            )}
            {formData.requires_nda && (
               <span className="flex items-center text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                <FileText className="w-3 h-3 mr-1" /> NDA Required
              </span>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
             <span className="text-gray-500 block mb-2">Participants ({formData.participants.length})</span>
             <div className="flex flex-wrap gap-2">
                {formData.participants.map(p => (
                  <span key={p.email} className="bg-white px-3 py-1 rounded-full text-xs border border-gray-200">{p.email} ({p.role})</span>
                ))}
              </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


// --- Main Component ---
const DealRoomCreate = () => {
  const navigate = (path) => console.log(`Navigating to ${path}`); 
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deal_type: '',
    estimated_value: 0,
    currency: 'USD',
    target_close_date: '',
    is_confidential: true,
    requires_nda: true,
    location: '',
    tags: [],
    participants: [],
    documents: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentParticipant, setCurrentParticipant] = useState({ email: '', role: 'viewer' });

  const dealTypes = [
    { value: 'acquisition', label: 'Acquisition', description: 'Purchase of oil & gas assets' },
    { value: 'joint_venture', label: 'Joint Venture', description: 'Collaborative development of assets' },
    { value: 'service_contract', label: 'Service Contract', description: 'Drilling, construction and technical services' },
    { value: 'equipment_lease', label: 'Equipment Lease', description: 'Leasing of heavy machinery for operations' },
    { value: 'exploration_rights', label: 'Exploration Rights', description: 'Purchase of rights for drilling' },
    { value: 'production_sharing', label: 'Production Sharing', description: 'Agreement to share production output' }
  ];

  const participantRoles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NOK'];

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleAddTagWrapper = (val) => {
     if (typeof val === 'string') {
        setCurrentTag(val);
        return;
     }
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
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        target_close_date: formData.target_close_date || null,
        is_confidential: !!formData.is_confidential,
        requires_nda: !!formData.requires_nda,
      };

      const response = await dealRoomAPI.createDealRoom(payload);
      toast.success('Deal room created successfully');
      navigate(webRoutes.dealRoomDetail.replace(':id', response.data.id));
    } catch (error) {
      console.error('Error creating deal room:', error);
      toast.error('Failed to create deal room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Container */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
        
        {/* Header Section with Titles */}
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-1">
                <ArrowLeft className="w-6 h-6 mr-3 text-gray-400 cursor-pointer hover:text-gray-700" onClick={() => navigate(webRoutes.dealRooms)} />
                Create Deal Room
            </h1>
            <p className="text-gray-500">Set up a secure collaboration space for your deal</p>
        </div>
        
        <StepIndicator currentStep={currentStep} />
        
        <div className="min-h-[500px]">
          <StepContent 
              currentStep={currentStep} 
              formData={formData} 
              handleInputChange={handleInputChange} 
              dealTypes={dealTypes} 
              currencies={currencies} 
              currentTag={currentTag} 
              addTag={handleAddTagWrapper}
              removeTag={removeTag}
              currentParticipant={currentParticipant} 
              setCurrentParticipant={setCurrentParticipant} 
              participantRoles={participantRoles} 
              addParticipant={addParticipant} 
              removeParticipant={removeParticipant} 
          />
        </div>

        {/* Navigation Footer - Mobile and Desktop Logic */}
        <div className="flex justify-between items-center pt-12 mt-6">
          
          {/* LEFT SIDE: Previous (Desktop) / Cancel (Mobile) */}
          <div className="flex items-center">
            
            {/* Previous Button (Visible only on Large screens and if not on step 1) */}
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="hidden lg:flex items-center px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#FFEF9A', 
                color: '#000000'
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </button>

            {/* Cancel Button (Visible on Mobile) */}
            <button
              onClick={() => navigate(webRoutes.dealRooms)}
              className="flex lg:hidden items-center px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </button>

          </div>
          
          

          {/* RIGHT SIDE: Next / Create Button Group */}
          <div className="flex items-center gap-4">

            {/* Cancel Button (Visible only on Large screens) */}
            <button
              onClick={() => navigate(webRoutes.dealRooms)}
              className="hidden lg:flex items-center px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-8 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-all"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-8 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-all disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
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
  );
};

export default DealRoomCreate;